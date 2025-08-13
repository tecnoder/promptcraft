'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthProvider'
import { LogIn, Loader2, User, LogOut, X } from 'lucide-react'

export function GoogleSignIn() {
  const { user, loading, signInWithGoogle, signOut } = useAuth()
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const handleSignIn = async () => {
    setIsSigningIn(true)
    try {
      await signInWithGoogle()
      setShowModal(false)
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
      <div className="h-10 w-24 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
    )
  }

  if (user) {
    return (
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-3 px-3 py-2 bg-white/80 dark:bg-slate-800/80 rounded-lg border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm">
          {user.user_metadata?.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url}
              alt={user.user_metadata?.full_name || user.email || 'User'}
              className="h-6 w-6 rounded-full"
            />
          ) : (
            <div className="h-6 w-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <User className="h-3 w-3 text-white" />
            </div>
          )}
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 max-w-28 truncate">
            {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
          </span>
        </div>
        
        <button
          onClick={handleSignOut}
          className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 rounded-lg border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-sm transition-all"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center space-x-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700/80 text-slate-900 dark:text-white border border-slate-200/60 dark:border-slate-700/60 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md backdrop-blur-sm"
      >
        <LogIn className="h-4 w-4" />
        <span>Sign In</span>
      </button>

      {/* Modal */}
      {showModal && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
            onClick={() => setShowModal(false)}
          />

          {/* Modal Content */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full border border-slate-200/60 dark:border-slate-700/60 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-200/60 dark:border-slate-700/60">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Sign in to Promptemist
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div className="text-center space-y-2">
                  <p className="text-slate-600 dark:text-slate-400">
                    Get unlimited prompts and save your history
                  </p>
                </div>

                {/* Google Sign In Button */}
                <button
                  onClick={handleSignIn}
                  disabled={isSigningIn}
                  className="w-full relative group flex items-center justify-center space-x-3 px-6 py-4 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600 rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-0 group-hover:opacity-10 transition-opacity"></div>
                  
                  {isSigningIn ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <div className="relative">
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                      </div>
                      <span>Continue with Google</span>
                    </>
                  )}
                </button>

                <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                  By signing in, you agree to our terms of service and privacy policy.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
