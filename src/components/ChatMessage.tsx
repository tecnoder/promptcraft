'use client'

import { ReactNode } from 'react'
import { User, Bot, Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface ChatMessageProps {
  type: 'user' | 'assistant'
  content: string
  timestamp?: Date
  isStreaming?: boolean
}

export function ChatMessage({ type, content, timestamp, isStreaming = false }: ChatMessageProps) {
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
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className={`flex w-full gap-3 md:gap-4 ${type === 'user' ? 'justify-end' : 'justify-start'} group animate-slide-up`}>
      {type === 'assistant' && (
        <div className="flex-shrink-0">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-200 -z-10"></div>
          </div>
        </div>
      )}
      
      <div className={`flex flex-col max-w-[85%] md:max-w-[80%] ${type === 'user' ? 'items-end' : 'items-start'}`}>
        <div
          className={`relative rounded-3xl px-6 py-4 shadow-sm hover:shadow-md transition-all duration-200 ${
            type === 'user'
              ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white'
              : 'bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm'
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
          
          {/* Decorative element for user messages */}
          {type === 'user' && (
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full opacity-70"></div>
          )}
        </div>
        
        <div className="flex items-center gap-3 mt-2 px-2">
          {timestamp && (
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {formatTime(timestamp)}
            </span>
          )}
          
          {type === 'assistant' && content && !isStreaming && (
            <button
              onClick={handleCopy}
              className="opacity-0 group-hover:opacity-100 transition-all duration-200 p-2 hover:bg-slate-100/80 dark:hover:bg-slate-700/80 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm hover:scale-110"
              title="Copy message"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>
      
      {type === 'user' && (
        <div className="flex-shrink-0">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-700 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200 border border-slate-200/50 dark:border-slate-600/50">
              <User className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-emerald-400/20 rounded-2xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-200 -z-10"></div>
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
    <div className="flex flex-col space-y-6 md:space-y-8 p-6 md:p-8 max-w-5xl mx-auto">
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
            className="w-full min-h-[60px] max-h-[200px] p-4 pr-16 border border-slate-200 dark:border-slate-700 rounded-2xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 text-base leading-relaxed transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            rows={1}
          />
          
          <button
            onClick={onSubmit}
            disabled={disabled || !value.trim() || loading}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md group"
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
