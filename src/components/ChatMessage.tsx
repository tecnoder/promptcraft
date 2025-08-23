'use client'

import { ReactNode } from 'react'
import { User, Bot, Copy, Check, RotateCcw } from 'lucide-react'
import { useState } from 'react'

interface ChatMessageProps {
  type: 'user' | 'assistant'
  content: string
  timestamp?: Date
  isStreaming?: boolean
  onRegenerate?: () => void
}

export function ChatMessage({ type, content, timestamp, isStreaming = false, onRegenerate }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!content) return

    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Error copying to clipboard:', error)
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    const diffInHours = Math.floor(diffInMinutes / 60)
    const diffInDays = Math.floor(diffInHours / 24)

    // If it's today
    if (diffInDays === 0) {
      if (diffInMinutes < 1) {
        return 'Just now'
      } else if (diffInMinutes < 60) {
        return `${diffInMinutes}min ago`
      } else {
        return `${diffInHours}hr ago`
      }
    }
    // If it's from a previous day, show date and time
    else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
  }

  return (
    <div className={`flex w-full gap-3 md:gap-4 ${type === 'user' ? 'justify-end' : 'justify-start'} group animate-slide-up`}>
      {type === 'assistant' && (
        <div className="flex-shrink-0">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-slate-600 dark:bg-slate-700 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
              <Bot className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      )}
      
      <div className={`flex flex-col max-w-[85%] md:max-w-[80%] ${type === 'user' ? 'items-end' : 'items-start'}`}>
        <div
          className={`relative rounded-3xl px-6 py-4 shadow-lg hover:shadow-xl transition-all duration-300 ${
            type === 'user'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700'
          }`}
        >
          {type === 'assistant' && isStreaming ? (
            <div className="flex items-center space-x-2">
              <div className="min-h-[1.5rem]">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                  {content}
                  <span className="inline-block w-2 h-5 bg-blue-500 ml-1 animate-pulse rounded-sm"></span>
                </pre>
              </div>
            </div>
          ) : (
            <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
              {content}
            </pre>
          )}
          
        </div>
        
        <div className="flex items-center gap-3 mt-2 px-2">
          {timestamp && (
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {formatTime(timestamp)}
            </span>
          )}
          
          {type === 'assistant' && content && !isStreaming && (
            <div className="flex items-center gap-2">
              {onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="transition-all duration-300 p-2 bg-gradient-to-r from-emerald-100 to-blue-100 dark:from-emerald-900/30 dark:to-blue-900/30 rounded-xl text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:scale-110 transform hover:shadow-lg border border-emerald-200/50 dark:border-emerald-700/30 hover:border-emerald-300 dark:hover:border-emerald-600"
                  title="Regenerate response"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={handleCopy}
                className="transition-all duration-300 p-2 bg-slate-100 dark:bg-slate-700 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:scale-110 transform hover:shadow-lg border border-slate-200 dark:border-slate-600"
                title="Copy message"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
      
      {type === 'user' && (
        <div className="flex-shrink-0">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-slate-400 dark:bg-slate-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
              <User className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface ChatContainerProps {
  children: ReactNode
}

export function ChatContainer({ children }: ChatContainerProps) {
  return (
    <div className="flex flex-col space-y-6 md:space-y-8 p-6 md:p-8 max-w-4xl mx-auto">
      {children}
    </div>
  )
}

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  disabled?: boolean
  placeholder?: string
  loading?: boolean
}

export function ChatInput({ 
  value, 
  onChange, 
  onSubmit, 
  disabled = false, 
  placeholder = "Type your message...",
  loading = false
}: ChatInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!disabled && value.trim()) {
        onSubmit()
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
    
    // Auto-resize the textarea
    const textarea = e.target
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px'
  }

  return (
    <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          <textarea
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full min-h-[60px] max-h-[200px] p-4 pr-16 border border-slate-200 dark:border-slate-700 rounded-2xl resize-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 text-base leading-relaxed transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            rows={1}
          />
          
          <button
            onClick={onSubmit}
            disabled={disabled || !value.trim() || loading}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-3 rounded-xl bg-cyan-600 text-white hover:bg-cyan-700 focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md group"
            title={loading ? "Generating..." : "Send message"}
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
          {value.length > 0 && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {value.length} characters
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
