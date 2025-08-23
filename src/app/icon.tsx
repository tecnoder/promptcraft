import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
 
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'
 
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #ffc400 0%, #ff9100 25%, #ff530f 50%, #e62c6d 75%, #b25aff 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px',
        }}
      >
        {/* Brain/prompt symbol */}
        <div
          style={{
            width: '20px',
            height: '16px',
            background: 'white',
            borderRadius: '8px 8px 6px 6px',
            opacity: 0.95,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {/* Central dot */}
          <div
            style={{
              width: '4px',
              height: '4px',
              background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
              borderRadius: '50%',
              opacity: 0.6,
            }}
          />
        </div>
        
        {/* Sparks around */}
        <div
          style={{
            position: 'absolute',
            top: '4px',
            left: '2px',
            width: '2px',
            height: '2px',
            background: 'white',
            borderRadius: '50%',
            opacity: 0.8,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '6px',
            right: '2px',
            width: '1.5px',
            height: '1.5px',
            background: 'white',
            borderRadius: '50%',
            opacity: 0.7,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '4px',
            right: '3px',
            width: '1.8px',
            height: '1.8px',
            background: 'white',
            borderRadius: '50%',
            opacity: 0.75,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '5px',
            left: '1px',
            width: '1.2px',
            height: '1.2px',
            background: 'white',
            borderRadius: '50%',
            opacity: 0.6,
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  )
}