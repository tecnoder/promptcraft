'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      // Store user data in our database when they sign in
      if (event === 'SIGNED_IN' && session?.user) {
        await storeUserData(session.user)
        await createUserSession(session.user.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const storeUserData = async (user: User) => {
    try {
      const { error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          name: user.user_metadata.full_name || user.email?.split('@')[0] || '',
          avatar_url: user.user_metadata.avatar_url || null,
          updated_at: new Date().toISOString(),
        })

      if (error) {
        console.error('Error storing user data:', error)
      }
    } catch (error) {
      console.error('Error storing user data:', error)
    }
  }

  const createUserSession = async (userId: string) => {
    try {
      // Get user agent and IP (IP will be handled server-side)
      const userAgent = navigator.userAgent

      const { error } = await supabase
        .from('user_sessions')
        .insert({
          user_id: userId,
          user_agent: userAgent,
          ip_address: '', // This will be populated server-side
        })

      if (error) {
        console.error(error);
        console.error('Error creating user session 83:', error)
      }
    } catch (error) {
      console.error(error);
      console.error('Error creating user session 87:', error)
    }
  }

  const signInWithGoogle = async () => {
    try {
      // Get the correct base URL for the current environment
      let baseUrl = window.location.origin

      console.log("in baseUrl 94", baseUrl);
      console.log("process.env.NODE_ENV", process.env.NODE_ENV);
      console.log("process.env.NEXT_PUBLIC_SITE_URL", process.env.NEXT_PUBLIC_SITE_URL);
      
      // In production, use the NEXT_PUBLIC_SITE_URL if available, otherwise fallback to current origin
      if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_SITE_URL) {
        baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
        console.log("in baseUrl 99", baseUrl);
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: baseUrl,
        },
      })

      console.log("data supabaseresponse", data);

      if (error) {
        console.error('Error signing in with Google:', error)
      }
    } catch (error) {
      console.error('Error signing in with Google:', error)
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error signing out:', error)
      }
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const value = {
    user,
    session,
    loading,
    signInWithGoogle,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
