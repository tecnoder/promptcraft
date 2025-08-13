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
    <div className={`flex w-full gap-2 md:gap-4 ${type === 'user' ? 'justify-end' : 'justify-start'} group`}>
      {type === 'assistant' && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shadow-lg">
            <Bot className="w-4 h-4 text-white" />
          </div>
        </div>
      )}
      
      <div className={`flex flex-col max-w-[85%] md:max-w-[80%] ${type === 'user' ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-4 py-3 shadow-lg ${
            type === 'user'
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700'
          }`}
        >
          {type === 'assistant' && isStreaming ? (
            <div className="flex items-center space-x-2">
              <div className="min-h-[1.5rem]">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                  {content}
                  <span className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse"></span>
                </pre>
              </div>
            </div>
          ) : (
            <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
              {content}
            </pre>
          )}
        </div>
        
        <div className="flex items-center gap-2 mt-1 px-1">
          {timestamp && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {formatTime(timestamp)}
            </span>
          )}
          
          {type === 'assistant' && content && !isStreaming && (
            <button
              onClick={handleCopy}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              title="Copy message"
            >
              {copied ? (
                <Check className="w-3 h-3 text-green-600" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          )}
        </div>
      </div>
      
      {type === 'user' && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center">
            <User className="w-4 h-4 text-slate-600 dark:text-slate-300" />
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
    <div className="flex flex-col space-y-4 md:space-y-6 p-4 md:p-6 max-w-4xl mx-auto">
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
