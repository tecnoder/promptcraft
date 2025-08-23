'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthProvider'
import { PromptHistory } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import { ChatMessage, ChatContainer } from '@/components/ChatMessage'
import { 
  ArrowLeft, 
  Brain,
  Calendar,
  User,
  FileText
} from 'lucide-react'

export default function PromptDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { session, loading: authLoading } = useAuth()
  const [prompt, setPrompt] = useState<PromptHistory | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [regenerating, setRegenerating] = useState(false)
  const [regeneratedOutput, setRegeneratedOutput] = useState<string | null>(null)

  const promptId = params.id as string

  const fetchPrompt = async () => {
    if (!session?.user?.id || !promptId) {
      setError('Authentication required')
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('prompt_history')
        .select('*')
        .eq('id', promptId)
        .eq('user_id', session.user.id)
        .single()

      if (error) {
        console.error('Error fetching prompt:', error)
        setError('Prompt not found or access denied')
      } else {
        setPrompt(data)
      }
    } catch (error) {
      console.error('Error in fetchPrompt:', error)
      setError('Failed to load prompt')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Wait for auth to finish loading before making decisions
    if (authLoading) {
      return
    }

    // Only fetch if we don't already have the prompt data and session is ready
    if (session?.user?.id && promptId && !prompt && !error) {
      fetchPrompt()
    } else if (!session?.user?.id) {
      setError('Please sign in to view your prompts')
      setLoading(false)
    }
  }, [session?.user?.id, promptId, authLoading, prompt, error])



  const handleRegenerate = async () => {
    if (!prompt || regenerating) return

    setRegenerating(true)
    setRegeneratedOutput('')
    
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }
      
      const response = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers,
        body: JSON.stringify({ input: prompt.input_text }),
      })

      if (!response.ok) {
        throw new Error('Failed to regenerate prompt')
      }

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
            setRegeneratedOutput(accumulatedText)
            await new Promise(resolve => setTimeout(resolve, 10))
          }
        }
      } finally {
        reader.releaseLock()
      }

    } catch (error) {
      console.error('Error regenerating prompt:', error)
      setRegeneratedOutput('Error regenerating prompt. Please try again.')
    } finally {
      setRegenerating(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <FileText className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            {error}
          </h2>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-6 py-3 bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-700 hover:to-violet-700 text-white rounded-lg transition-colors"
          >
            Go Back to Craft
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-cyan-200/15 to-violet-200/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-cyan-200/10 to-violet-300/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-cyan-200/8 to-violet-200/8 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      {/* <header className="border-b border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl z-10 relative">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Back to craft"
              >
                <ArrowLeft className="h-6 w-6 text-slate-600 dark:text-slate-400" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-violet-500 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
                  <div className="relative bg-gradient-to-br from-cyan-600 to-violet-600 p-2.5 rounded-2xl shadow-lg">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gradient">
                    {prompt?.title || 'Prompt Details'}
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {prompt && formatDate(prompt.created_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header> */}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto relative">
        {prompt && (
          <ChatContainer>
            <ChatMessage 
              type="user" 
              content={prompt.input_text} 
              timestamp={new Date(prompt.created_at)}
            />
            <ChatMessage 
              type="assistant" 
              content={prompt.output_text} 
              timestamp={new Date(prompt.created_at)}
              onRegenerate={handleRegenerate}
            />
            {regeneratedOutput && (
              <ChatMessage 
                type="assistant" 
                content={regeneratedOutput} 
                timestamp={new Date()}
                isStreaming={regenerating}
                onRegenerate={!regenerating ? handleRegenerate : undefined}
              />
            )}
          </ChatContainer>
        )}
      </div>
    </div>
  )
}
