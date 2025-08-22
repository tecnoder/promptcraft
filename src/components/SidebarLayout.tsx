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
      setIsMobile(window.innerWidth < 768)
      // On desktop, keep sidebar expanded by default
      if (window.innerWidth >= 768) {
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
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffInHours < 24 * 7) {
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

        {/* Sidebar */}
        <div 
          className={`${
            isMobile 
              ? `fixed left-0 top-0 h-full z-50 transition-transform duration-200 ease-out ${
                  isExpanded ? 'translate-x-0' : '-translate-x-full'
                } w-80`
              : `transition-all duration-200 ease-out ${
                  isExpanded ? 'w-80' : 'w-16'
                }`
          } bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col`}
        >
          {/* Header */}
          <div className="flex items-center h-16 px-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-3">
              <Tooltip content={isExpanded ? "Collapse sidebar" : "Expand sidebar"} disabled={isMobile}>
                <button
                  onClick={toggleSidebar}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
                >
                  <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
              </Tooltip>
              
              <div className={`transition-all duration-200 ${
                isExpanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'
              }`}>
                <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Promptcraft
                </h1>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* New Prompt Button */}
            <div className="p-4">
              <Tooltip content="New prompt" disabled={isExpanded || isMobile}>
                <button
                  onClick={handleNewPrompt}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-cyan-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                    !isExpanded ? 'justify-center' : ''
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  {isExpanded && <span className="font-medium">New prompt</span>}
                </button>
              </Tooltip>
            </div>

            {/* Navigation Icons (Collapsed) */}
            {!isExpanded && (
              <div className="px-4 space-y-2">
                <Tooltip content="History">
                  <button
                    onClick={() => setIsExpanded(true)}
                    className="w-full p-2.5 flex justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Clock className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </button>
                </Tooltip>
                <Tooltip content="Settings">
                  <button className="w-full p-2.5 flex justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </button>
                </Tooltip>
              </div>
            )}

            {/* History Section (Expanded) */}
            {isExpanded && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="px-4">
                  <div className="flex items-center gap-2 mb-3 px-3">
                    {/* <Clock className="w-4 h-4 text-slate-600 dark:text-slate-400" /> */}
                    <h2 className="text-sm font-medium text-slate-900 dark:text-white">History</h2>
                  </div>
                  
                  {/* {session?.user && prompts.length > 0 && (
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search prompts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm placeholder-slate-400 focus:outline-none"
                      />
                    </div>
                  )} */}
                </div>

                <div className="flex-1 overflow-y-auto px-4 space-y-1 custom-scrollbar">
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
                        className="w-full text-left p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1 flex-1">
                            {prompt.title || 'Untitled'}
                          </h3>
                          <ChevronRight className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 dark:border-slate-800 p-4">
            <div className={`flex gap-2 ${isExpanded ? 'items-center' : 'flex-col items-center'}`}>
              <div className={isExpanded ? 'flex-1' : ''}>
                <GoogleSignIn />
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </SidebarContext.Provider>
  )
}
