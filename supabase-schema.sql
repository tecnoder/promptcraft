-- Enable Row Level Security (RLS) on all tables

-- Create UUID v7 generation function
CREATE OR REPLACE FUNCTION generate_uuid_v7() RETURNS uuid AS $$
DECLARE
    timestamp_ms bigint;
    uuid_bytes bytea;
BEGIN
    -- Get current timestamp in milliseconds
    timestamp_ms := extract(epoch from now()) * 1000;
    
    -- Create UUID v7 bytes
    uuid_bytes := '\x' || 
                  lpad(to_hex((timestamp_ms >> 16)::bigint), 8, '0') ||
                  lpad(to_hex((timestamp_ms & 65535)::bigint), 4, '0') ||
                  lpad(to_hex((random() * 4095)::bigint | 28672), 4, '0') ||  -- version 7 + 12 random bits
                  lpad(to_hex((random() * 16383)::bigint | 32768), 4, '0') ||  -- variant + 14 random bits  
                  lpad(to_hex((random() * 4294967295)::bigint), 8, '0') ||
                  lpad(to_hex((random() * 4294967295)::bigint), 8, '0');
    
    RETURN uuid_bytes::uuid;
END;
$$ LANGUAGE plpgsql;

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user_sessions table to track user sessions
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID DEFAULT generate_uuid_v7() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  user_agent TEXT NOT NULL,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create prompt_history table to store prompt inputs/outputs
CREATE TABLE IF NOT EXISTS public.prompt_history (
  id UUID DEFAULT generate_uuid_v7() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  session_id UUID REFERENCES public.user_sessions(id) ON DELETE SET NULL,
  input_text TEXT NOT NULL,
  output_text TEXT NOT NULL,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create usage_tracking table for rate limiting
CREATE TABLE IF NOT EXISTS public.usage_tracking (
  id UUID DEFAULT generate_uuid_v7() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  session_identifier TEXT, -- For anonymous users (IP + User Agent hash)
  prompts_used INTEGER DEFAULT 0,
  last_reset_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Users can only see and update their own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can only see their own sessions
CREATE POLICY "Users can view own sessions" ON public.user_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" ON public.user_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only see their own prompt history
CREATE POLICY "Users can view own prompt history" ON public.prompt_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prompt history" ON public.prompt_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usage tracking policies
CREATE POLICY "Users can view own usage" ON public.usage_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage" ON public.usage_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage" ON public.usage_tracking
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_created_at ON public.user_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_prompt_history_user_id ON public.prompt_history(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_history_session_id ON public.prompt_history(session_id);
CREATE INDEX IF NOT EXISTS idx_prompt_history_created_at ON public.prompt_history(created_at);
CREATE INDEX IF NOT EXISTS idx_prompt_history_title ON public.prompt_history(title);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON public.usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_session_identifier ON public.usage_tracking(session_identifier);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_last_reset_date ON public.usage_tracking(last_reset_date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for users table
CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create trigger for usage_tracking table
CREATE TRIGGER handle_updated_at_usage_tracking
  BEFORE UPDATE ON public.usage_tracking
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to reset daily usage limits
CREATE OR REPLACE FUNCTION reset_daily_usage_limits() RETURNS void AS $$
BEGIN
  UPDATE public.usage_tracking 
  SET prompts_used = 0, 
      last_reset_date = CURRENT_DATE,
      updated_at = timezone('utc'::text, now())
  WHERE last_reset_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;
