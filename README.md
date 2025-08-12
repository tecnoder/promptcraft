# PromptCraft 🚀

A modern, AI-powered prompt engineering tool built with Next.js, Supabase, and OpenAI. Transform your ideas into well-crafted prompts with real-time streaming responses and intelligent suggestions.

## ✨ Features

- **AI-Powered Prompt Generation**: Leverage OpenAI's advanced language models to craft effective prompts
- **Real-Time Streaming**: Watch as your prompts are generated in real-time with smooth streaming
- **User Authentication**: Secure Google Sign-In integration with Supabase
- **Prompt History**: Track and save your prompt generation history
- **Dark/Light Theme**: Beautiful, responsive UI with theme switching
- **Modern Tech Stack**: Built with Next.js 15, React 19, TypeScript, and Tailwind CSS

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Authentication**: Supabase Auth with Google OAuth
- **Database**: Supabase PostgreSQL
- **AI Integration**: OpenAI API
- **Deployment**: Vercel-ready

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd promptcraft
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Setup Guide

### Supabase Configuration

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In Project Settings > API, copy your project URL and anon key
3. Enable Google authentication in Authentication > Settings
4. Run the database schema (see Database Setup section)

### OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com)
2. Go to API Keys section and create a new key
3. Add the key to your `.env.local` file

### Database Setup

For storing prompt history, run these SQL commands in your Supabase SQL editor:

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

## 📱 Usage

1. **Sign In**: Use Google authentication to create an account
2. **Craft Prompts**: Enter your idea or description in the input field
3. **Generate**: Click the "Craft Prompt" button to generate AI-powered prompts
4. **Copy & Use**: Copy the generated prompt to use in your AI applications
5. **Track History**: View your prompt generation history in your profile

## 🏗️ Project Structure

```
promptcraft/
├── src/
│   ├── app/                 # Next.js app router
│   │   ├── api/            # API routes
│   │   ├── craft/          # Main prompt crafting page
│   │   └── layout.tsx      # Root layout
│   ├── components/         # Reusable UI components
│   ├── contexts/           # React contexts (Auth, Theme)
│   └── lib/               # Utility libraries
├── public/                 # Static assets
└── scripts/               # Build and utility scripts
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app is built with Next.js and can be deployed to any platform that supports Node.js applications.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Powered by [OpenAI](https://openai.com/)
- Backend by [Supabase](https://supabase.com/)

## 📞 Support

If you have any questions or need help, please open an issue on GitHub or reach out to the maintainers.

---

**Happy Prompt Crafting! 🎯**