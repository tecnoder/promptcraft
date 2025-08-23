'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthProvider'
import { useSidebar } from '@/components/SidebarLayout'
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
  const { refreshHistory } = useSidebar()
  const router = useRouter()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [streaming, setStreaming] = useState(false)
  const [redirecting, setRedirecting] = useState(false)
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
          setRedirecting(true)
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
                  refreshHistory() // Refresh sidebar history before redirecting
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
            } else if (!success) {
              setRedirecting(false)
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
      setRedirecting(false)
      // Refresh usage info after generating
      fetchUsageInfo()
    }
  }

  const handleInputChange = (value: string) => {
    setInput(value)
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800/30">
      {/* Enhanced decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-blue-400/20 dark:from-emerald-600/10 dark:to-blue-600/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-violet-400/15 to-purple-400/15 dark:from-violet-600/8 dark:to-purple-600/8 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-gradient-to-br from-cyan-300/10 to-blue-300/10 dark:from-cyan-700/5 dark:to-blue-700/5 rounded-full blur-2xl animate-pulse-slow"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-br from-yellow-300/8 to-orange-300/8 dark:from-yellow-700/4 dark:to-orange-700/4 rounded-full blur-xl animate-float" style={{animationDelay: '4s'}}></div>
        <div className="absolute bottom-1/4 right-1/3 w-16 h-16 bg-gradient-to-br from-pink-300/12 to-rose-300/12 dark:from-pink-700/6 dark:to-rose-700/6 rounded-full blur-lg animate-pulse-slow" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative z-10 overflow-y-auto">
        {output || streaming ? (
          // Chat Interface - Show conversation
          <>
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
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
                    content={redirecting ? output + '\n\nRedirecting to saved prompt...' : output} 
                    timestamp={new Date()}
                    isStreaming={streaming && !redirecting}
                    onRegenerate={!streaming && !redirecting ? () => handleCraftPrompt() : undefined}
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
                {/* Personalized Greeting */}
                {session?.user && (
                  <div className="space-y-3">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
                      <span className="text-gradient-warm">Hello, {session.user.user_metadata?.full_name?.split(' ')[0] || session.user.email?.split('@')[0] || 'there'}</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300">
                      What do you want to craft today?
                    </p>
                  </div>
                )}
                

                {/* Main Heading for non-logged users */}
                {!session?.user && (
                  <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
                      <span className="text-gradient-warm">Craft Perfect Prompts</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
                      Transform your simple ideas into powerful, detailed prompts that unlock the full potential of AI tools.
                    </p>
                  </div>
                )}

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
                <div className="relative group gradient-glow">
                  {/* Input Container with Animated Gradient Border */}
                  <div className="relative glass-gradient rounded-3xl p-1 gradient-border animate-gradient">
                    <div className="relative bg-white dark:bg-slate-900 rounded-3xl p-2">
                      {/* Subtle Usage Indicator */}
                      {usageInfo && (
                        <div className="absolute top-4 right-4 z-10">
                          <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
                            {usageInfo.isAuthenticated ? (
                              <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full animate-gradient-pulse"></div>
                                <span className="text-gradient-warm font-medium">Unlimited</span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-gradient-to-r from-violet-400 to-purple-500 rounded-full animate-gradient-pulse"></div>
                                <span className="text-gradient-sunset font-medium">{usageInfo.remainingPrompts} left</span>
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
                        className="w-full min-h-[140px] max-h-[200px] p-8 pr-20 bg-transparent border-0 resize-none focus:outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-lg leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                        rows={4}
                      />
                    
                      {/* Enhanced Submit Button */}
                      <button
                        onClick={handleCraftPrompt}
                        disabled={loading || !input.trim() || !!(usageInfo && !usageInfo.canGenerate)}
                        className="absolute right-4 bottom-4 group/btn"
                        title={loading ? "Generating..." : "Generate prompt"}
                      >
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" style={{background: 'linear-gradient(135deg, #ffc400 0%, #ff9100 25%, #ff530f 50%, #e62c6d 75%, #b25aff 100%)'}}>
                          {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <svg className="w-5 h-5 text-white transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                          )}
                        </div>
                      </button>
                    </div>
                  </div>
                  
                  {/* Input Footer */}
                  {/* <div className="flex justify-between items-center mt-4 px-4">
                    <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center space-x-1">
                        <kbd className="px-2 py-1 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded text-xs font-mono border border-slate-200 dark:border-slate-600">Enter</kbd>
                        <span>to send</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <kbd className="px-2 py-1 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded text-xs font-mono border border-slate-200 dark:border-slate-600">Shift+Enter</kbd>
                        <span>new line</span>
                      </span>
                    </div>
                    {input.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full animate-gradient-pulse"></div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                          {input.length} chars
                        </span>
                      </div>
                    )}
                  </div> */}
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
                        className="relative glass-gradient text-sm py-2 px-4 border border-slate-200/50 dark:border-slate-600/30 hover:border-transparent transition-all duration-300 group overflow-hidden"
                        disabled={loading}
                      >
                        <span className="relative z-10">{example}</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute inset-0 border border-transparent bg-gradient-to-r from-emerald-400 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-lg"></div>
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
