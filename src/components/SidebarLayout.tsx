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
  }, [session?.user?.id])

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
      <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 overflow-hidden">
        {/* Mobile Backdrop */}
        {isMobile && isExpanded && (
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
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
          } bg-white/95 dark:bg-slate-900/95 border-r border-slate-200/60 dark:border-slate-700/40 shadow-xl backdrop-blur-xl`}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200/40 dark:border-slate-700/30 bg-slate-50/50 dark:bg-slate-800/30">
            <div className={`flex items-center space-x-3 transition-all duration-300 ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
              <div className="relative group">
                <div className="relative bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 p-3 rounded-2xl shadow-sm group-hover:shadow-md transition-all duration-200">
                  <Brain className="h-6 w-6 text-white" />
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </div>
              </div>
              {isExpanded && (
                <div className="animate-slide-down">
                  <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    Promptemist
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-500 font-medium tracking-wide">
                    AI Prompt Engineering
                  </p>
                </div>
              )}
            </div>
            
            <button
              onClick={toggleSidebar}
              className="relative group p-3 hover:bg-slate-100/60 dark:hover:bg-slate-700/50 rounded-xl transition-all duration-200 border border-slate-200/40 dark:border-slate-600/30 backdrop-blur-sm"
              aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
            >
              <Menu className="h-5 w-5 text-slate-600 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-emerald-500/10 dark:from-blue-600/20 dark:to-emerald-600/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10"></div>
            </button>
          </div>

          {/* New Prompt Button */}
          <div className="p-4">
            <button
              onClick={handleNewPrompt}
              className={`w-full relative group overflow-hidden ${
                !isExpanded ? 'p-3' : 'p-4'
              }`}
            >
              <div className="absolute inset-0 btn-primary rounded-2xl group-hover:shadow-blue-500/50"></div>
              <div className="relative flex items-center justify-center space-x-3">
                <div className="relative">
                  <Plus className="h-5 w-5 transition-transform group-hover:rotate-90 duration-200" />
                </div>
                {isExpanded && (
                  <span className="font-semibold tracking-wide">New Prompt</span>
                )}
              </div>
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-white/20 to-blue-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out"></div>
            </button>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-hidden">
            {!isExpanded ? (
              // Mini sidebar - just icons
              <div className="p-4 space-y-4">
                <div className="flex justify-center">
                  <div className="relative group">
                    <div className="p-3 rounded-xl bg-slate-100/60 dark:bg-slate-800/50 border border-slate-200/40 dark:border-slate-600/30 backdrop-blur-sm group-hover:bg-slate-200/60 dark:group-hover:bg-slate-700/50 transition-all duration-200">
                      <Clock className="h-5 w-5 text-slate-600 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-500 transition-colors" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-emerald-500/10 dark:from-blue-600/20 dark:to-emerald-600/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10"></div>
                  </div>
                </div>
              </div>
            ) : (
              // Full sidebar - show history
              <div className="p-4">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="relative group">
                    <div className="p-3 bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-blue-900/20 dark:to-emerald-900/20 rounded-xl border border-blue-200/30 dark:border-blue-800/30 group-hover:shadow-md transition-all duration-200">
                      <Clock className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      History
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-500 font-medium">
                      Recent prompts
                    </p>
                  </div>
                </div>

                <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto custom-scrollbar">
                  {!session?.user ? (
                    <div className="text-center space-y-6 p-6">
                      <div className="relative animate-float">
                        <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800/60 dark:to-slate-800/80 p-8 rounded-3xl border border-slate-200/50 dark:border-slate-700/30">
                          <FileText className="h-16 w-16 text-slate-400 dark:text-slate-600 mx-auto" />
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-blue-400 to-emerald-400 dark:from-blue-600 dark:to-emerald-600 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                          Sign in to view history
                        </h3>
                        <p className="text-slate-600 dark:text-slate-500 text-sm leading-relaxed">
                          Sign in with Google to save and access your prompt history from anywhere.
                        </p>
                      </div>
                    </div>
                  ) : loading ? (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="card p-4 animate-pulse">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-3/4"></div>
                              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/2"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : prompts.length === 0 ? (
                    <div className="text-center space-y-6 p-6">
                      <div className="relative animate-float">
                        <div className="relative bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-blue-900/15 dark:to-emerald-900/15 p-8 rounded-3xl border border-blue-200/50 dark:border-blue-800/30">
                          <MessageSquare className="h-16 w-16 text-blue-400 dark:text-blue-600 mx-auto" />
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-emerald-400 to-blue-400 dark:from-emerald-600 dark:to-blue-600 rounded-full animate-ping"></div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                          No prompts yet
                        </h3>
                        <p className="text-slate-600 dark:text-slate-500 text-sm leading-relaxed">
                          Create your first prompt and it will appear here for easy access.
                        </p>
                      </div>
                    </div>
                  ) : (
                    prompts.map((prompt, index) => (
                      <button
                        key={prompt.id}
                        onClick={() => handlePromptClick(prompt.id)}
                        className="w-full text-left card-interactive p-4 group animate-slide-up"
                        style={{animationDelay: `${index * 50}ms`}}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-blue-900/30 dark:to-emerald-900/30 rounded-xl flex items-center justify-center border border-blue-200/40 dark:border-blue-800/30 group-hover:shadow-md transition-all duration-200">
                            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate">
                                {prompt.title || 'Untitled Prompt'}
                              </h4>
                              <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-500 transition-all duration-200 group-hover:translate-x-1 flex-shrink-0" />
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                              {prompt.input_text}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-400 dark:text-slate-500 bg-slate-100/60 dark:bg-slate-800/50 px-3 py-1 rounded-lg font-medium border border-slate-200/40 dark:border-slate-700/30">
                                {formatDate(prompt.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Footer - Auth & Theme */}
          <div className="p-4 border-t border-slate-200/40 dark:border-slate-700/30 bg-gradient-to-r from-slate-50/30 to-slate-100/30 dark:from-slate-800/20 dark:to-slate-900/20 backdrop-blur-sm">
            <div className={`flex items-center gap-3 ${isExpanded ? 'justify-between' : 'flex-col'}`}>
              <div className={isExpanded ? 'flex-1' : ''}>
                <GoogleSignIn />
              </div>
              <div className="flex-shrink-0">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={`flex-1 flex flex-col overflow-scroll ${isMobile ? 'w-full' : ''}`}>
          {children}
        </div>
      </div>
    </SidebarContext.Provider>
  )
}
