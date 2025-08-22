'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { Tooltip } from './Tooltip'

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
    )
  }

  return (
    <Tooltip content={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="Toggle theme"
      >
        <div className="relative w-5 h-5">
          <Sun className={`w-5 h-5 text-slate-600 dark:text-slate-400 absolute inset-0 transition-all duration-200 ${
            theme === 'dark' ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
          }`} />
          <Moon className={`w-5 h-5 text-slate-600 dark:text-slate-400 absolute inset-0 transition-all duration-200 ${
            theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
          }`} />
        </div>
      </button>
    </Tooltip>
  )
}
