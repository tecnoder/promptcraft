'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthProvider'
import { LogIn, Loader2, User, LogOut } from 'lucide-react'
import { Tooltip } from './Tooltip'
import { useSidebar } from './SidebarLayout'

export function GoogleSignIn() {
  const { user, loading, signInWithGoogle, signOut } = useAuth()
  const [isSigningIn, setIsSigningIn] = useState(false)
  const { isExpanded } = useSidebar()

  const handleSignIn = async () => {
    setIsSigningIn(true)
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error('Sign in failed:', error)
    } finally {
      setIsSigningIn(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  if (loading) {
    return (
      <div className={`${isExpanded ? 'h-9 w-full' : 'h-9 w-9'} bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse`} />
    )
  }

  if (user) {
    return (
      <div className={`flex ${isExpanded ? 'items-center gap-2' : 'flex-col gap-2'}`}>
        <Tooltip content={user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'} disabled={isExpanded}>
          <div className={`flex items-center ${isExpanded ? 'gap-3 px-3 py-2 flex-1' : 'w-9 h-9 justify-center'} bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors`}>
            {user.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt={user.user_metadata?.full_name || user.email || 'User'}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 bg-slate-900 dark:bg-white rounded-full flex items-center justify-center">
                <User className="w-3 h-3 text-white dark:text-slate-900" />
              </div>
            )}
            {isExpanded && (
              <span className="text-sm font-medium text-slate-900 dark:text-white truncate flex-1">
                {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
              </span>
            )}
          </div>
        </Tooltip>
        
        <Tooltip content="Sign out" disabled={isExpanded}>
          <button
            onClick={handleSignOut}
            className={`${isExpanded ? 'p-2' : 'p-2 w-9 h-9'} rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center`}
            title="Sign out"
          >
            <LogOut className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </button>
        </Tooltip>
      </div>
    )
  }

  return (
    <Tooltip content="Sign in with Google" disabled={isExpanded}>
      <button
        onClick={handleSignIn}
        disabled={isSigningIn}
        className={`${
          isExpanded 
            ? 'w-full flex items-center justify-center gap-2 px-4 py-2.5' 
            : 'w-9 h-9 flex items-center justify-center'
        } bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isSigningIn ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {isExpanded && <span className="font-medium">Sign in</span>}
          </>
        )}
      </button>
    </Tooltip>
  )
}
