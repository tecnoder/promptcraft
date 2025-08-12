'use client'

import { useState } from 'react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { 
  Sparkles, 
  Copy, 
  Check, 
  Wand2, 
  ArrowRight,
  Loader2,
  Zap,
  Brain
} from 'lucide-react'

export default function CraftPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCraftPrompt = async () => {
    if (!input.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: input.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate prompt')
      }

      setOutput(data.prompt)
    } catch (error) {
      console.error('Error generating prompt:', error)
      setOutput('Error generating prompt. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!output) return

    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Error copying to clipboard:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-20"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-2xl">
                  <Brain className="h-7 w-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  PromptCraft
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                  AI-Powered Prompt Engineering
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-12 text-center">
        <div className="space-y-6">
          <div className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium border border-blue-200 dark:border-blue-800">
            <Zap className="h-4 w-4" />
            <span>Transform ideas into powerful prompts</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight">
            Craft Perfect Prompts for
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> AI Tools</span>
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Enter your simple idea and watch it transform into a detailed, structured prompt that maximizes AI performance.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Input Panel */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <Wand2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                Your Idea
              </h3>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/20 dark:shadow-slate-900/20 overflow-hidden">
              <div className="p-8">
                <label htmlFor="input" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                  Describe what you want to create or accomplish
                </label>
                
                <textarea
                  id="input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Example: I need a reusable card component for a dashboard using React and Tailwind CSS..."
                  className="w-full h-64 p-4 border border-slate-200 dark:border-slate-600 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 text-base leading-relaxed transition-all"
                />
                
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                      {input.length} characters
                    </span>
                    {input.length > 0 && (
                      <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  
                  <button
                    onClick={handleCraftPrompt}
                    disabled={!input.trim() || loading}
                    className="relative group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-3 shadow-lg shadow-blue-500/25"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur opacity-0 group-hover:opacity-20 transition-opacity"></div>
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Crafting...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5" />
                        <span>Craft Prompt</span>
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Output Panel */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Generated Prompt
                </h3>
              </div>
              
              {output && (
                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-600" />
                      <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              )}
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/20 dark:shadow-slate-900/20 overflow-hidden">
              {output ? (
                <div className="p-8">
                  <div className="h-80 overflow-auto custom-scrollbar">
                    <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-mono">
                      {output}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="p-8 h-96 flex items-center justify-center text-center">
                  <div className="space-y-6 max-w-sm">
                    <div className="relative mx-auto w-20 h-20">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-20"></div>
                      <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-5 rounded-full flex items-center justify-center">
                        <Sparkles className="h-10 w-10 text-white" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                        Ready to craft your prompt
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        Enter your idea on the left and click &ldquo;Craft Prompt&rdquo; to generate a detailed, professional prompt optimized for AI tools.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
