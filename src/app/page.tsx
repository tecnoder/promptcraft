'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthProvider'
import { ChatMessage, ChatContainer, ChatInput } from '@/components/ChatMessage'
import { 
  Sparkles, 
  Zap,
  Brain
} from 'lucide-react'

interface UsageInfo {
  canGenerate: boolean
  promptsUsed: number
  maxPrompts: number
  isAuthenticated: boolean
  remainingPrompts: number
}

export default function Home() {
  const { session } = useAuth()
  const router = useRouter()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [streaming, setStreaming] = useState(false)
  const [usageInfo, setUsageInfo] = useState<UsageInfo | null>(null)
  const [promptId, setPromptId] = useState<string | null>(null)

  // Fetch usage information
  const fetchUsageInfo = async () => {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }
      
      const response = await fetch('/api/usage', { headers })
      if (response.ok) {
        const data = await response.json()
        setUsageInfo(data)
      }
    } catch (error) {
      console.error('Error fetching usage info:', error)
    }
  }

  // Load usage info on component mount and when session changes
  useEffect(() => {
    fetchUsageInfo()
  }, [session])

  const handleCraftPrompt = async () => {
    if (!input.trim()) return
    if (usageInfo && !usageInfo.canGenerate) return

    setLoading(true)
    setStreaming(true)
    setOutput('')
    
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      
      // Add authorization header if user is authenticated
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }
      
      const response = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers,
        body: JSON.stringify({ input: input.trim() }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to generate prompt')
      }

      // Handle streaming response
      if (!response.body) {
        throw new Error('No response body')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulatedText = ''

      try {
        while (true) {
          const { done, value } = await reader.read()
          
          if (done) break
          
          if (value) {
            const chunk = decoder.decode(value, { stream: true })
            accumulatedText += chunk
            
            // Update output with accumulated text for smooth streaming effect
            setOutput(accumulatedText)
            
            // Small delay to make streaming more visible
            await new Promise(resolve => setTimeout(resolve, 10))
          }
        }
        
        // After streaming is complete, fetch the prompt ID and redirect
        if (session?.user?.id && accumulatedText) {
          // Wait longer for the backend to save the prompt and retry if needed
          let attempts = 0
          const maxAttempts = 5
          const fetchLatestPrompt = async () => {
            try {
              const response = await fetch('/api/latest-prompt', {
                headers: {
                  'Authorization': `Bearer ${session.access_token}`
                }
              })
              
              if (response.ok) {
                const { data } = await response.json()
                if (data?.id) {
                  router.push(`/prompt/${data.id}`)
                  return true
                }
              }
              return false
            } catch (error) {
              console.error('Error fetching latest prompt:', error)
              return false
            }
          }
          
          const tryFetch = async () => {
            attempts++
            const success = await fetchLatestPrompt()
            if (!success && attempts < maxAttempts) {
              setTimeout(tryFetch, 1000)
            }
          }
          
          // Start fetching after a short delay
          setTimeout(tryFetch, 1500)
        }
      } finally {
        reader.releaseLock()
      }

    } catch (error) {
      console.error('Error generating prompt:', error)
      setOutput('Error generating prompt. Please try again.')
    } finally {
      setLoading(false)
      setStreaming(false)
      // Refresh usage info after generating
      fetchUsageInfo()
    }
  }

  const handleInputChange = (value: string) => {
    setInput(value)
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800/30">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-cyan-400/15 to-violet-400/15 dark:from-cyan-600/8 dark:to-violet-600/8 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-violet-400/10 to-cyan-400/10 dark:from-violet-600/5 dark:to-cyan-600/5 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-gradient-to-br from-cyan-300/8 to-violet-300/8 dark:from-cyan-700/4 dark:to-violet-700/4 rounded-full blur-2xl animate-pulse-slow"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative z-10">
        {output || streaming ? (
          // Chat Interface - Show conversation
          <>
            <div className="flex-1 overflow-y-auto">
              <ChatContainer>
                {input && (
                  <ChatMessage 
                    type="user" 
                    content={input} 
                    timestamp={new Date()}
                  />
                )}
                {(output || streaming) && (
                  <ChatMessage 
                    type="assistant" 
                    content={output} 
                    timestamp={new Date()}
                    isStreaming={streaming}
                  />
                )}
              </ChatContainer>
            </div>
          </>
        ) : (
          // Welcome Screen with centered input
          <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-screen">
            <div className="w-full max-w-4xl mx-auto space-y-12">
              {/* Hero Section */}
              <div className="text-center space-y-8 animate-fade-in">
                {/* Badge */}
                <div className="inline-flex items-center space-x-3 glass dark:glass-dark px-6 py-3 rounded-full text-cyan-700 dark:text-cyan-400 border border-cyan-200/50 dark:border-cyan-800/20">
                  <div className="relative">
                    <Zap className="h-5 w-5" />
                    <div className="absolute inset-0 animate-ping">
                      <Zap className="h-5 w-5 opacity-20" />
                    </div>
                  </div>
                  <span className="font-semibold text-sm tracking-wide">AI-Powered Prompt Engineering</span>
                </div>

                {/* Main Heading */}
                <div className="space-y-4">
                  <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
                    Transform your simple ideas into powerful, detailed prompts that unlock the full potential of AI tools.
                  </p>
                </div>

                {/* Feature Pills */}
                {/* <div className="flex flex-wrap justify-center gap-3 mt-8">
                  {[
                    { icon: Brain, text: "Smart Enhancement" },
                    { icon: Sparkles, text: "Instant Results" },
                    { icon: Zap, text: "Optimized Output" }
                  ].map((feature, index) => (
                    <div 
                      key={feature.text}
                      className="flex items-center space-x-2 glass dark:glass-dark px-4 py-2 rounded-full border border-slate-200/50 dark:border-slate-700/50 animate-slide-up"
                      style={{animationDelay: `${index * 100}ms`}}
                    >
                      <feature.icon className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{feature.text}</span>
                    </div>
                  ))}
                </div> */}
              </div>



              {/* Enhanced Input Section */}
              <div className="w-full max-w-3xl mx-auto animate-slide-up" style={{animationDelay: '400ms'}}>
                <div className="relative group">
                  {/* Input Container */}
                  <div className="relative glass dark:glass-dark rounded-3xl p-2 border border-slate-200/50 dark:border-slate-600/30">
                    {/* Subtle Usage Indicator */}
                    {usageInfo && (
                      <div className="absolute top-4 right-4 z-10">
                        <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-500">
                          {usageInfo.isAuthenticated ? (
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 bg-cyan-500 dark:bg-cyan-500 rounded-full"></div>
                              <span>Unlimited</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 bg-violet-500 dark:bg-violet-500 rounded-full"></div>
                              <span>{usageInfo.remainingPrompts} left</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <textarea
                      value={input}
                      onChange={(e) => {
                        setInput(e.target.value)
                        const textarea = e.target
                        textarea.style.height = 'auto'
                        textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px'
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          if (!loading && input.trim() && usageInfo?.canGenerate) {
                            handleCraftPrompt()
                          }
                        }
                      }}
                      placeholder="Describe your idea, project, or concept... ✨"
                      disabled={loading || !!(usageInfo && !usageInfo.canGenerate)}
                      className="w-full min-h-[140px] max-h-[200px] p-8 pr-20 bg-transparent border-0 resize-none focus:outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-lg leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed"
                      rows={4}
                    />
                    
                    {/* Subtle Submit Button */}
                    <button
                      onClick={handleCraftPrompt}
                      disabled={loading || !input.trim() || !!(usageInfo && !usageInfo.canGenerate)}
                      className="absolute right-4 bottom-4 group/btn"
                      title={loading ? "Generating..." : "Generate prompt"}
                    >
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center transition-all duration-200 border border-slate-200 dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading ? (
                          <div className="w-5 h-5 border-2 border-slate-400 dark:border-slate-300 border-t-slate-600 dark:border-t-slate-100 rounded-full animate-spin" />
                        ) : (
                          <svg className="w-5 h-5 text-slate-600 dark:text-slate-300 group-hover/btn:text-slate-800 dark:group-hover/btn:text-slate-100 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        )}
                      </div>
                    </button>
                  </div>
                  
                  {/* Input Footer */}
                  <div className="flex justify-between items-center mt-4 px-4">
                    <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-500">
                      <span className="flex items-center space-x-1">
                        <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800/60 rounded text-xs font-mono">Enter</kbd>
                        <span>to send</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800/60 rounded text-xs font-mono">Shift+Enter</kbd>
                        <span>new line</span>
                      </span>
                    </div>
                    {input.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-cyan-500 dark:bg-cyan-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-slate-500 dark:text-slate-500 font-mono">
                          {input.length} chars
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Example prompts */}
                <div className="mt-8 text-center">
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Try these examples:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {[
                      "Write a marketing email for a new product",
                      "Create a lesson plan for teaching Python",
                      "Design a workout routine for beginners"
                    ].map((example, index) => (
                      <button
                        key={index}
                        onClick={() => setInput(example)}
                        className="btn-ghost text-sm py-2 px-4 border border-slate-200 dark:border-slate-600/50 hover:border-cyan-300 dark:hover:border-cyan-700/60 transition-all duration-200"
                        disabled={loading}
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
