import React from 'react'

interface LogoProps {
  size?: number
  className?: string
  variant?: 'icon' | 'full' | 'favicon'
}

export function Logo({ size = 32, className = '', variant = 'icon' }: LogoProps) {
  if (variant === 'favicon') {
    return (
      <div 
        className={`bg-warm-solid border border-slate-200/50 dark:border-slate-600/30 ${className}`}
        style={{ 
          width: size, 
          height: size,
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <span 
            className="font-bold text-gradient-warm"
            style={{ 
              fontSize: size * 0.6,
            }}
          >
            PJ.
          </span>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`bg-warm-solid border border-slate-200/50 dark:border-slate-600/30 ${className} flex items-center justify-center rounded-sm`}
      style={{ 
        width: size, 
        height: size,
      }}
    >
      <div className="flex font-bold text-gradient-warm tracking-wider">PJ.</div>
      {/* <div className="absolute inset-0">
        <span 
          className="font-bold text-gradient-warm tracking-wider"
          style={{ 
            fontSize: size * 0.5,
            fontFamily: 'Inter, system-ui, sans-serif'
          }}
        >
          PJ.
        </span>
      </div> */}
    </div>
  )
}

export default Logo