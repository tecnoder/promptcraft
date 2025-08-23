import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
 
export const size = {
  width: 180,
  height: 180,
}
export const contentType = 'image/png'
 
export default function AppleIcon() {
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
          borderRadius: '40px',
        }}
      >
        {/* Brain/prompt symbol - larger for Apple icon */}
        <div
          style={{
            width: '100px',
            height: '80px',
            background: 'white',
            borderRadius: '40px 40px 30px 30px',
            opacity: 0.95,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {/* Central highlight */}
          <div
            style={{
              width: '20px',
              height: '20px',
              background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
              borderRadius: '50%',
              opacity: 0.3,
            }}
          />
        </div>
        
        {/* Sparks around - larger and more spread out */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '15px',
            width: '12px',
            height: '12px',
            background: 'white',
            borderRadius: '50%',
            opacity: 0.8,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '25px',
            right: '15px',
            width: '9px',
            height: '9px',
            background: 'white',
            borderRadius: '50%',
            opacity: 0.7,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            width: '10px',
            height: '10px',
            background: 'white',
            borderRadius: '50%',
            opacity: 0.75,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '25px',
            left: '10px',
            width: '8px',
            height: '8px',
            background: 'white',
            borderRadius: '50%',
            opacity: 0.6,
          }}
        />
        
        {/* Additional sparks for fuller look */}
        <div
          style={{
            position: 'absolute',
            top: '50px',
            left: '5px',
            width: '6px',
            height: '6px',
            background: 'rgba(255, 255, 255, 0.5)',
            borderRadius: '50%',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '120px',
            right: '8px',
            width: '5px',
            height: '5px',
            background: 'rgba(255, 255, 255, 0.4)',
            borderRadius: '50%',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  )
}