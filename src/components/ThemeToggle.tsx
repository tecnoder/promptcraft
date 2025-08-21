'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="h-9 w-9 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 animate-pulse border border-slate-200/60 dark:border-slate-700/60" />
    )
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="relative group h-11 w-11 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 transition-all duration-200 flex items-center justify-center backdrop-blur-sm shadow-sm hover:shadow-md"
      aria-label="Toggle theme"
    >
      <div className="relative w-5 h-5">
        <Sun className={`h-5 w-5 text-slate-600 dark:text-slate-400 absolute inset-0 transition-all duration-300 ${
          theme === 'dark' ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
        }`} />
        <Moon className={`h-5 w-5 text-slate-600 dark:text-slate-400 absolute inset-0 transition-all duration-300 ${
          theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
        }`} />
      </div>
      
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-emerald-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10"></div>
      
      {/* Active indicator */}
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-200"></div>
    </button>
  )
}
