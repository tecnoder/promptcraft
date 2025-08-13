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
      className="relative group h-9 w-9 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 transition-all duration-200 flex items-center justify-center backdrop-blur-sm"
      aria-label="Toggle theme"
    >
      <div className="relative w-4 h-4">
        <Sun className={`h-4 w-4 text-slate-600 dark:text-slate-400 absolute inset-0 transition-all duration-300 ${
          theme === 'dark' ? 'rotate-90 scale-0' : 'rotate-0 scale-100'
        }`} />
        <Moon className={`h-4 w-4 text-slate-600 dark:text-slate-400 absolute inset-0 transition-all duration-300 ${
          theme === 'dark' ? 'rotate-0 scale-100' : '-rotate-90 scale-0'
        }`} />
      </div>
    </button>
  )
}
