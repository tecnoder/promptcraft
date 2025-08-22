# Promptcraft Setup Guide

## Environment Variables Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
# Get these from your Supabase project settings at https://supabase.com
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI Configuration  
# Get your API key from https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key
```

## Quick Setup Steps

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd promptcraft
   npm install
   ```

2. **Set up Supabase**
   - Go to [supabase.com](https://supabase.com) and create a new project
   - In Project Settings > API, copy your project URL and anon key
   - Enable Email authentication in Authentication > Settings

3. **Get OpenAI API Key**
   - Visit [OpenAI Platform](https://platform.openai.com)
   - Go to API Keys section and create a new key

4. **Create Environment File**
   - Copy the environment template above into `.env.local`
   - Replace the placeholder values with your actual keys

5. **Run the Application**
   ```bash
   npm run dev
   ```

6. **Open in Browser**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - Create an account or sign in
   - Start crafting prompts!

## Database Setup (Optional)

For storing prompt history, you can run these SQL commands in your Supabase SQL editor:

```sql
-- User profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  email TEXT,
  full_name TEXT
);

-- Prompts history table
CREATE TABLE prompts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  original_input TEXT NOT NULL,
  generated_prompt TEXT NOT NULL
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own prompts" ON prompts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prompts" ON prompts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```
