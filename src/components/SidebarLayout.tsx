'use client'

import React, { useState, createContext, useContext, ReactNode, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthProvider'
import { PromptHistory } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { 
  Menu, 
  X, 
  Plus, 
  Clock, 
  ChevronRight, 
  FileText,
  Brain,
  MessageSquare
} from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { GoogleSignIn } from './GoogleSignIn'

interface SidebarContextType {
  isExpanded: boolean
  toggleSidebar: () => void
  setSidebarExpanded: (expanded: boolean) => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export const useSidebar = () => {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarLayout')
  }
  return context
}

interface SidebarLayoutProps {
  children: ReactNode
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { session } = useAuth()
  const router = useRouter()
  const [prompts, setPrompts] = useState<PromptHistory[]>([])
  const [loading, setLoading] = useState(false)

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
      // On mobile, keep sidebar collapsed by default
      if (window.innerWidth < 768) {
        setIsExpanded(false)
      }
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  const toggleSidebar = () => setIsExpanded(!isExpanded)
  const setSidebarExpanded = (expanded: boolean) => setIsExpanded(expanded)

  const fetchPromptHistory = useCallback(async () => {
    if (!session?.user?.id || loading) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('prompt_history')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) {
        console.error('Error fetching prompt history:', error)
      } else {
        setPrompts(data || [])
      }
    } catch (error) {
      console.error('Error in fetchPromptHistory:', error)
    } finally {
      setLoading(false)
    }
  }, [session?.user?.id, loading])

  // Fetch prompts when sidebar is expanded and user is logged in
  useEffect(() => {
    if (isExpanded && session?.user?.id) {
      fetchPromptHistory()
    }
  }, [isExpanded, session?.user?.id, fetchPromptHistory])

  const handlePromptClick = (promptId: string) => {
    router.push(`/prompt/${promptId}`)
  }

  const handleNewPrompt = () => {
    router.push('/')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  return (
    <SidebarContext.Provider value={{ isExpanded, toggleSidebar, setSidebarExpanded }}>
      <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
        {/* Mobile Backdrop */}
        {isMobile && isExpanded && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsExpanded(false)}
          />
        )}

        {/* Sidebar */}
        <div 
          className={`${
            isMobile 
              ? `fixed left-0 top-0 h-full z-50 transition-transform duration-300 ease-out ${
                  isExpanded ? 'translate-x-0' : '-translate-x-full'
                } w-80 flex flex-col`
              : `flex flex-col transition-all duration-300 ease-out ${
                  isExpanded ? 'w-80' : 'w-16'
                }`
          } bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 shadow-lg`}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
            <div className={`flex items-center space-x-3 transition-opacity duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
              <div className="relative group">
                <div className="relative bg-blue-600 p-2.5 rounded-xl shadow-lg">
                  <Brain className="h-6 w-6 text-white" />
                </div>
              </div>
              {isExpanded && (
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                    Promptemist
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    AI Prompt Engineering
                  </p>
                </div>
              )}
            </div>
            
            <button
              onClick={toggleSidebar}
              className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-200 group border border-slate-200 dark:border-slate-700"
              aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
            >
              <Menu className="h-5 w-5 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
            </button>
          </div>

          {/* New Prompt Button */}
          <div className="p-3">
            <button
              onClick={handleNewPrompt}
              className={`w-full flex items-center justify-center space-x-2 p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg group ${
                !isExpanded ? 'px-3' : 'px-4'
              }`}
            >
              <Plus className="h-5 w-5" />
              {isExpanded && <span className="font-medium">New Prompt</span>}
            </button>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-hidden">
            {!isExpanded ? (
              // Mini sidebar - just icons
              <div className="p-3 space-y-3">
                <div className="flex justify-center">
                  <div className="p-2 rounded-lg bg-slate-100/50 dark:bg-slate-800/50">
                    <Clock className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  </div>
                </div>
              </div>
            ) : (
              // Full sidebar - show history
              <div className="p-3">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-xl">
                    <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    History
                  </h2>
                </div>

                <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
                  {!session?.user ? (
                    <div className="text-center space-y-4 p-4">
                      <div className="relative">
                        <div className="relative bg-slate-100 dark:bg-slate-800 p-6 rounded-2xl">
                          <FileText className="h-12 w-12 text-slate-400 dark:text-slate-500 mx-auto" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                          Sign in to view history
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">
                          Sign in with Google to save and view your prompt history.
                        </p>
                      </div>
                    </div>
                  ) : loading ? (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="animate-pulse p-3 rounded-xl bg-slate-100/50 dark:bg-slate-800/50">
                          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-3/4 mb-2"></div>
                          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : prompts.length === 0 ? (
                    <div className="text-center space-y-4 p-4">
                      <div className="relative">
                        <div className="relative bg-slate-100 dark:bg-slate-800 p-6 rounded-2xl">
                          <FileText className="h-12 w-12 text-slate-400 dark:text-slate-500 mx-auto" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                          No prompts yet
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">
                          Start by crafting your first prompt. Your history will appear here.
                        </p>
                      </div>
                    </div>
                  ) : (
                    prompts.map((prompt) => (
                      <button
                        key={prompt.id}
                        onClick={() => handlePromptClick(prompt.id)}
                        className="w-full text-left p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 group border border-slate-200 dark:border-slate-700 hover:shadow-md"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-slate-900 dark:text-white text-sm line-clamp-1">
                            {prompt.title || 'Untitled Prompt'}
                          </h4>
                          <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors group-hover:translate-x-0.5" />
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                          {prompt.input_text}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400 dark:text-slate-500 bg-slate-100/50 dark:bg-slate-800/50 px-2 py-1 rounded-lg">
                            {formatDate(prompt.created_at)}
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Footer - Auth & Theme */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-700">
            <div className={`flex items-center ${isExpanded ? 'justify-between' : 'flex-col space-y-2'}`}>
              <GoogleSignIn />
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={`flex-1 flex flex-col overflow-hidden ${isMobile ? 'w-full' : ''}`}>
          {children}
        </div>
      </div>
    </SidebarContext.Provider>
  )
}
