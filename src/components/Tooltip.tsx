'use client'

import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface TooltipProps {
  content: string
  children: React.ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
  disabled?: boolean
}

export function Tooltip({ 
  content, 
  children, 
  side = 'right', 
  delay = 300,
  disabled = false 
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const showTooltip = () => {
    if (disabled) return
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect()
        let x = 0
        let y = 0

        switch (side) {
          case 'top':
            x = rect.left + rect.width / 2
            y = rect.top - 8
            break
          case 'bottom':
            x = rect.left + rect.width / 2
            y = rect.bottom + 8
            break
          case 'left':
            x = rect.left - 8
            y = rect.top + rect.height / 2
            break
          case 'right':
            x = rect.right + 8
            y = rect.top + rect.height / 2
            break
        }

        setPosition({ x, y })
        setIsVisible(true)
      }
    }, delay)
  }

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const tooltipContent = isVisible && typeof window !== 'undefined' ? createPortal(
    <div
      className={`fixed z-[9999] px-3 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-medium rounded-lg shadow-lg border border-slate-700 dark:border-slate-300 pointer-events-none transition-opacity duration-200 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        left: side === 'right' ? position.x : side === 'left' ? position.x - 8 : position.x,
        top: side === 'top' ? position.y - 8 : side === 'bottom' ? position.y : position.y - 12,
        transform: side === 'top' || side === 'bottom' ? 'translateX(-50%)' : 'translateY(-50%)'
      }}
    >
      {content}
      <div
        className={`absolute w-2 h-2 bg-slate-900 dark:bg-slate-100 border border-slate-700 dark:border-slate-300 rotate-45 ${
          side === 'right' ? '-left-1 top-1/2 -translate-y-1/2 border-r-0 border-b-0' :
          side === 'left' ? '-right-1 top-1/2 -translate-y-1/2 border-l-0 border-t-0' :
          side === 'top' ? '-bottom-1 left-1/2 -translate-x-1/2 border-t-0 border-l-0' :
          '-top-1 left-1/2 -translate-x-1/2 border-b-0 border-r-0'
        }`}
      />
    </div>,
    document.body
  ) : null

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="inline-block"
      >
        {children}
      </div>
      {tooltipContent}
    </>
  )
}