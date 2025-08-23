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
  MessageSquare,
  Settings,
  Search
} from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { GoogleSignIn } from './GoogleSignIn'
import { Tooltip } from './Tooltip'
import { Logo } from './Logo'

interface SidebarContextType {
  isExpanded: boolean
  toggleSidebar: () => void
  setSidebarExpanded: (expanded: boolean) => void
  refreshHistory: () => void
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
  const [searchQuery, setSearchQuery] = useState('')
  const { session } = useAuth()
  const router = useRouter()
  const [prompts, setPrompts] = useState<PromptHistory[]>([])
  const [loading, setLoading] = useState(false)

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkIsMobile = () => {
      const width = window.innerWidth
      setIsMobile(width < 768)
      // On desktop, keep sidebar expanded by default
      // On tablet and mobile, keep collapsed for more content space
      if (width >= 1024) {
        setIsExpanded(true)
      } else {
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
        .limit(50)

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

  // Fetch prompts when user is logged in
  useEffect(() => {
    if (session?.user?.id) {
      fetchPromptHistory()
    }
  }, [session?.user?.id, fetchPromptHistory])

  const handlePromptClick = (promptId: string) => {
    router.push(`/prompt/${promptId}`)
    if (isMobile) {
      setIsExpanded(false)
    }
  }

  const handleNewPrompt = () => {
    router.push('/')
    if (isMobile) {
      setIsExpanded(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
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
    // If it's from a previous day
    else if (diffInDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  // const filteredPrompts = prompts.filter(prompt => 
  //   prompt.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //   prompt.input_text.toLowerCase().includes(searchQuery.toLowerCase())
  // )
  const filteredPrompts = prompts

  return (
    <SidebarContext.Provider value={{ isExpanded, toggleSidebar, setSidebarExpanded, refreshHistory: fetchPromptHistory }}>
      <div className="flex h-screen bg-white dark:bg-slate-950">
        {/* Mobile Backdrop */}
        {isMobile && isExpanded && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsExpanded(false)}
          />
        )}

        {/* Fixed Mobile Header */}
        {isMobile && (
          <div className="fixed top-0 left-0 right-0 z-50 h-16 bg-white dark:bg-slate-950 flex items-center px-4">
            <button
              onClick={toggleSidebar}
              className="p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors touch-manipulation"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
            
            <div className="flex-1 flex items-center justify-center gap-2">
              <Logo size={24} />
              <h1 className="text-xl font-semibold">
                <span>PromptJedi</span>
              </h1>
            </div>
            
            <button
              onClick={handleNewPrompt}
              className="p-3 rounded-lg glass-gradient text-sm border-transparent hover:border-slate-300/40 dark:hover:border-slate-500/40 transition-all duration-300 group overflow-hidden touch-manipulation"
              aria-label="New prompt"
            >
              <Plus className="w-5 h-5 relative z-10 group-hover:scale-110 transition-transform duration-200" />
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 to-blue-500/10 opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-0 border border-transparent bg-gradient-to-r from-emerald-400 to-blue-500 opacity-20 group-hover:opacity-30 transition-opacity duration-300 rounded-lg"></div>
            </button>
          </div>
        )}

        {/* Sidebar */}
        <div 
          className={`${
            isMobile 
              ? `fixed left-0 top-0 h-full z-50 transition-transform duration-200 ease-out ${
                  isExpanded ? 'translate-x-0' : '-translate-x-full'
                } w-72 sm:w-80`
              : `transition-all duration-200 ease-out ${
                  isExpanded ? 'w-80' : 'w-16'
                }`
          } bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full`}
        >
          {/* Header */}
          <div className="flex items-center h-16 px-4 border-b border-slate-200 dark:border-slate-800 border-none">
            <div className="flex items-center space-x-3">
              <Tooltip content={isExpanded ? "Collapse sidebar" : "Expand sidebar"} disabled={isMobile}>
                <button
                  onClick={toggleSidebar}
                  className="p-3 md:p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors touch-manipulation"
                  aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
                >
                  <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
              </Tooltip>
              
            </div>
          </div>

          {/* Navigation - Flexible middle section */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* New Prompt Button - Only show on desktop when collapsed */}
            {!isMobile && (
              <div className="p-4">
                <Tooltip content="New prompt" disabled={isExpanded}>
                  <button
                    onClick={handleNewPrompt}
                    className={`${isExpanded ? 'inline-flex items-center gap-2 px-4 py-3 md:py-2' : 'w-full flex items-center justify-center p-3 md:p-2.5'} relative glass-gradient text-sm border-transparent hover:border-slate-300/40 dark:hover:border-slate-500/40 transition-all duration-300 group overflow-hidden rounded-lg touch-manipulation`}
                  >
                    <Plus className="w-4 h-4 relative z-10 group-hover:scale-110 transition-transform duration-200" />
                    {isExpanded && <span className="relative z-10">New prompt</span>}
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 to-blue-500/10 opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute inset-0 border border-transparent bg-gradient-to-r from-emerald-400 to-blue-500 opacity-20 group-hover:opacity-30 transition-opacity duration-300 rounded-lg"></div>
                  </button>
                </Tooltip>
              </div>
            )}

            {/* Navigation Icons (Collapsed) - Desktop only */}
            {!isExpanded && !isMobile && (
              <div className="px-4 space-y-2">
                <Tooltip content="History">
                  <button
                    onClick={() => setIsExpanded(true)}
                    className="w-full p-3 md:p-2.5 flex justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors touch-manipulation"
                  >
                    <Clock className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </button>
                </Tooltip>
              </div>
            )}

            {/* History Section - Always show when expanded or on mobile */}
            {(isExpanded || isMobile) && (
              <div className="flex-1 flex flex-col min-h-0 py-3">
                <div className="px-4 flex-shrink-0">
                  <div className="flex items-center gap-2 mb-3 px-3">
                    <h2 className="text-sm font-medium text-slate-900 dark:text-white">History</h2>
                  </div>
                </div>

                {/* Scrollable History Content */}
                <div className="flex-1 overflow-y-auto px-4 space-y-1 custom-scrollbar min-h-0">
                  {!session?.user ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FileText className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                        Sign in to save your prompts
                      </p>
                    </div>
                  ) : loading ? (
                    <div className="space-y-2">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="p-3 space-y-2">
                          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                          <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-2/3" />
                        </div>
                      ))}
                    </div>
                  ) : filteredPrompts.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                        <MessageSquare className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {searchQuery ? 'No prompts found' : 'No prompts yet'}
                      </p>
                    </div>
                  ) : (
                    filteredPrompts.map((prompt) => (
                      <button
                        key={prompt.id}
                        onClick={() => handlePromptClick(prompt.id)}
                        className="w-full text-left p-4 md:p-3 rounded-lg hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-pink-50/50 dark:hover:from-orange-950/20 dark:hover:to-pink-950/20 transition-all duration-300 group relative overflow-hidden border border-transparent hover:border-orange-200/30 dark:hover:border-orange-800/30 touch-manipulation"
                      >
                        <div className="flex items-center justify-between relative z-10">
                          <h3 className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1 flex-1 group-hover:text-gradient-warm transition-all duration-300">
                            {prompt.title || 'Untitled'}
                          </h3>
                          <ChevronRight className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:text-orange-500 transition-all duration-300 flex-shrink-0 transform group-hover:translate-x-1" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-400/5 to-pink-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 dark:border-slate-800 p-4">
            <div className={`flex gap-3 md:gap-2 ${isExpanded ? 'items-center' : 'flex-col items-center'}`}>
              <div className={isExpanded ? 'flex-1' : ''}>
                <GoogleSignIn />
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={`flex-1 flex flex-col overflow-hidden ${isMobile ? 'pt-16' : ''} relative`}>
          {/* Desktop Promptcraft Text - Floating immediately right of sidebar */}
          {!isMobile && (
            <div className="absolute top-4 left-6 z-10 flex items-center gap-3">
              <Logo size={32} />
              <h1 className="text-2xl font-bold">
                <span>PromptJedi</span>
              </h1>
            </div>
          )}
          {children}
        </div>
      </div>
    </SidebarContext.Provider>
  )
}
