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
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-3 px-4 py-2.5 glass dark:glass-dark rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all duration-200">
          {user.user_metadata?.avatar_url ? (
            <div className="relative">
              <img
                src={user.user_metadata.avatar_url}
                alt={user.user_metadata?.full_name || user.email || 'User'}
                className="h-7 w-7 rounded-xl object-cover border-2 border-white/50 dark:border-slate-700/50"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full border border-white dark:border-slate-800"></div>
            </div>
          ) : (
            <div className="relative">
              <div className="h-7 w-7 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-sm">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full border border-white dark:border-slate-800"></div>
            </div>
          )}
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 max-w-28 truncate">
            {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
          </span>
        </div>
        
        <button
          onClick={handleSignOut}
          className="relative group p-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm transition-all duration-200 shadow-sm hover:shadow-md"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10"></div>
        </button>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="relative group flex items-center space-x-3 px-6 py-3 glass dark:glass-dark hover:bg-white/90 dark:hover:bg-slate-700/90 text-slate-900 dark:text-white border border-slate-200/50 dark:border-slate-700/50 rounded-2xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md backdrop-blur-sm overflow-hidden"
      >
        <LogIn className="h-5 w-5 relative z-10" />
        <span className="relative z-10">Sign In</span>
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-emerald-500/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out"></div>
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-emerald-400/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10"></div>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-scale-in">
            <div className="bg-white/95 dark:bg-slate-900/95 rounded-3xl shadow-lg max-w-md w-full border border-slate-200/50 dark:border-slate-700/50 overflow-hidden backdrop-blur-xl">
              {/* Header */}
              <div className="flex items-center justify-between p-8 border-b border-slate-200/50 dark:border-slate-700/50">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Welcome Back
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Sign in to Promptemist
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="relative group p-3 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 rounded-2xl transition-all duration-200 border border-slate-200/50 dark:border-slate-700/50"
                >
                  <X className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10"></div>
                </button>
              </div>

              {/* Content */}
              <div className="p-8 space-y-6">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-emerald-100 dark:from-blue-900/40 dark:to-emerald-900/40 rounded-3xl flex items-center justify-center mx-auto border border-blue-200/50 dark:border-blue-800/50 animate-float">
                    <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    Get unlimited prompts and save your history across all your devices
                  </p>
                </div>

                {/* Google Sign In Button */}
                <button
                  onClick={handleSignIn}
                  disabled={isSigningIn}
                  className="w-full relative group overflow-hidden"
                >
                  <div className="btn-primary p-4 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                    {isSigningIn ? (
                      <>
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span className="text-lg font-semibold">Signing in...</span>
                      </>
                    ) : (
                      <>
                        <div className="relative">
                          <svg className="h-6 w-6" viewBox="0 0 24 24">
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
                        </div>
                        <span className="text-lg font-semibold">Continue with Google</span>
                      </>
                    )}
                  </div>
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out"></div>
                </button>

                <p className="text-xs text-slate-500 dark:text-slate-400 text-center leading-relaxed">
                  By signing in, you agree to our{' '}
                  <span className="text-blue-600 dark:text-blue-400 font-medium">terms of service</span>
                  {' '}and{' '}
                  <span className="text-blue-600 dark:text-blue-400 font-medium">privacy policy</span>.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
