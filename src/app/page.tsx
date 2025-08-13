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
    <div className="flex flex-col h-full">
      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
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
            <ChatInput
              value=""
              onChange={() => {}}
              onSubmit={() => {}}
              disabled={true}
              placeholder="Generating complete..."
            />
          </>
        ) : (
          // Welcome Screen with centered input
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl mx-auto space-y-8">
              <div className="text-center space-y-6">
                <div className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium border border-blue-200 dark:border-blue-800">
                  <Zap className="h-4 w-4" />
                  <span>Transform ideas into powerful prompts</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white leading-tight">
                  Craft Perfect Prompts for <span className="text-blue-600 dark:text-blue-400">AI Tools</span>
                </h2>
                <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                  Enter your simple idea and watch it transform into a detailed, structured prompt that maximizes AI performance.
                </p>
              </div>

              {/* Usage Info */}
              {usageInfo && (
                <div className="flex items-center justify-center p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 max-w-md mx-auto shadow-sm">
                  <div className="text-center space-y-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {usageInfo.isAuthenticated ? 'Unlimited prompts available' : `${usageInfo.promptsUsed}/${usageInfo.maxPrompts} free prompts used`}
                    </span>
                    {!usageInfo.canGenerate && !usageInfo.isAuthenticated && (
                      <span className="block text-amber-600 dark:text-amber-400 font-medium text-sm">
                        Sign in for unlimited prompts
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Centered Chat Input */}
              <div className="w-full">
                <div className="relative">
                  <textarea
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value)
                      // Auto-resize the textarea
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
                    placeholder="What would you like to create? Describe your idea..."
                    disabled={loading || !!(usageInfo && !usageInfo.canGenerate)}
                    className="w-full min-h-[120px] max-h-[200px] p-6 border border-slate-200 dark:border-slate-700 rounded-2xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 text-lg leading-relaxed transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    rows={4}
                  />
                  
                  <button
                    onClick={handleCraftPrompt}
                    disabled={loading || !input.trim() || !!(usageInfo && !usageInfo.canGenerate)}
                    className="absolute right-4 bottom-4 p-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg group"
                    title={loading ? "Generating..." : "Generate prompt"}
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    )}
                  </button>
                </div>
                
                <div className="flex justify-between items-center mt-3 px-1">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Press Enter to send, Shift+Enter for new line
                  </span>
                  {input.length > 0 && (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {input.length} characters
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
