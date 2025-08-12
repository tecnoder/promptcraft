# PromptCraft 🎨

**AI-Powered Prompt Engineering Assistant**

Transform your simple ideas into powerful, detailed prompts optimized for AI tools like ChatGPT, Claude, Gemini, and more.

![PromptCraft Screenshot](https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=PromptCraft+Screenshot)

## ✨ Features

- **🤖 AI-Powered Generation**: Uses GPT-4o to transform simple ideas into comprehensive, structured prompts
- **🎨 Modern UI/UX**: Professional design with gradient backgrounds, glass morphism effects, and smooth animations
- **🌙 Dark/Light Theme**: Seamless theme switching with system preference detection
- **📱 Fully Responsive**: Works beautifully on desktop, tablet, and mobile devices
- **📋 Copy to Clipboard**: One-click copying of generated prompts with visual feedback
- **⚡ No Authentication**: Simple, instant access - no signup required
- **🎯 Clean Interface**: Distraction-free two-panel layout for optimal productivity

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- OpenAI API Key

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/promptcraft.git
cd promptcraft
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
```

### 4. Get OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com)
2. Create an account or sign in
3. Go to API Keys section
4. Create a new API key
5. Add it to your `.env.local` file

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── generate-prompt/ # Prompt generation endpoint
│   ├── auth/              # Authentication page
│   ├── craft/             # Main application page
│   ├── settings/          # User settings page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page (redirects)
├── components/            # Reusable components
│   └── ThemeToggle.tsx   # Theme switching component
├── contexts/              # React contexts
│   ├── AuthContext.tsx   # Authentication state
│   └── ThemeProvider.tsx # Theme management
└── lib/                   # Utility libraries
    ├── openai.ts         # OpenAI client and prompt generation
    └── supabase.ts       # Supabase client and types
```

## 🎯 How It Works

1. **User Input**: Enter a simple description of what you want to create
2. **AI Processing**: The app sends your input to GPT-4o with a specialized meta-prompt
3. **Structured Output**: Receive a professionally formatted prompt with sections like:
   - **Role**: Defines the AI's expertise
   - **Objective**: Clear goal statement
   - **Context**: Background information
   - **Technical Specifications**: Detailed requirements
   - **Acceptance Criteria**: Success criteria
   - **Output Format**: How the response should be structured

## 🔧 Configuration

### Customizing the Meta-Prompt

Edit the `generatePrompt` function in `src/lib/openai.ts` to customize how prompts are generated:

```typescript
const metaPrompt = `Your custom meta-prompt here...`
```

### Styling

The app uses Tailwind CSS with a custom design system. Modify colors in:
- `src/app/globals.css` (CSS variables)
- `tailwind.config.ts` (Tailwind configuration)

## 📱 Responsive Design

PromptCraft is built mobile-first and works perfectly on:
- 📱 Mobile phones (320px+)
- 📱 Tablets (768px+)
- 💻 Desktops (1024px+)
- 🖥️ Large screens (1440px+)

## 🔒 Security Features

- **Authentication Required**: All features require user login
- **Row Level Security**: Database policies ensure users only see their own data
- **API Key Protection**: OpenAI API key is server-side only
- **Input Validation**: All user inputs are validated and sanitized

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings
4. Deploy!

### Deploy to Other Platforms

PromptCraft can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- AWS Amplify
- DigitalOcean App Platform

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

### Code Quality

- **TypeScript**: Full type safety
- **ESLint**: Code linting
- **Prettier**: Code formatting (add configuration as needed)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@promptcraft.app
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/promptcraft/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/promptcraft/discussions)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) - The React framework
- [Supabase](https://supabase.com) - Backend as a Service
- [OpenAI](https://openai.com) - AI API
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework
- [Lucide](https://lucide.dev) - Beautiful icons

---

Built with ❤️ for the AI community