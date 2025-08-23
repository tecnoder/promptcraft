import { NextRequest, NextResponse } from 'next/server'
import { generatePromptStream } from '@/lib/openai'
import { supabase } from '@/lib/supabase'
import { updateUserSession, savePromptHistory } from '@/lib/user-tracking'
import { 
  getUsageInfo, 
  incrementAuthenticatedUserUsage, 
  incrementAnonymousUserUsage,
  getClientIP,
  createAnonymousSessionId,
  getClientIpAddress
} from '@/lib/usage-tracking'

export async function POST(request: NextRequest) {
  try {
    const { input } = await request.json()

    if (!input || typeof input !== 'string' || input.trim().length === 0) {
      return NextResponse.json(
        { error: 'Input is required and must be a non-empty string' },
        { status: 400 }
      )
    }

    if (input.trim().length > 2000) {
      return NextResponse.json(
        { error: 'Input is too long. Please keep it under 2000 characters.' },
        { status: 400 }
      )
    }

    // Check for valid origin to prevent external API access
    const origin = request.headers.get('origin')
    const host = request.headers.get('host')
    const referer = request.headers.get('referer')
    
    // Allow requests from same origin or when referer matches our domain
    const allowedOrigins = [
      `https://${host}`,
      `http://${host}`,
      'http://localhost:3000',
      'https://localhost:3000'
    ]
    
    const isValidOrigin = origin && allowedOrigins.includes(origin)
    const isValidReferer = referer && allowedOrigins.some(allowed => referer.startsWith(allowed))
    
    if (!isValidOrigin && !isValidReferer) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      )
    }

    // Check usage limits first
    const usageInfo = await getUsageInfo(request)
    
    if (!usageInfo.canGenerate) {
      const response = usageInfo.isAuthenticated 
        ? { 
            error: `You've reached your daily limit of ${usageInfo.maxPrompts} prompts. Please try again tomorrow.`,
            type: 'rate_limit'
          }
        : { 
            error: 'You\'ve used your free prompt. Please sign in to generate more prompts.',
            type: 'sign_in_required'
          }
      
      return NextResponse.json(response, { status: 429 })
    }

    // Get authorization header for Supabase auth
    const authHeader = request.headers.get('authorization')
    let userId: string | null = null
    let sessionId: string | null = null

    // If user is authenticated, verify and track their activity
    if (authHeader) {
      try {
        const { data: { user }, error } = await supabase.auth.getUser(
          authHeader.replace('Bearer ', '')
        )
        
        if (!error && user) {
          userId = user.id
          sessionId = await updateUserSession(userId, request)
          // Increment usage for authenticated user
          await incrementAuthenticatedUserUsage(userId)
        }
      } catch (authError) {
        // Continue without user tracking if auth fails
        console.log('Auth verification failed:', authError)
      }
    } else {
      // Increment usage for anonymous user
      const ipAddress = await getClientIpAddress(request);
      const userAgent = request.headers.get('user-agent') || 'Unknown'
      const anonymousSessionId = createAnonymousSessionId(ipAddress, userAgent)
      await incrementAnonymousUserUsage(anonymousSessionId)
    }

    // Generate streaming response
    const stream = await generatePromptStream(input.trim())
    
    // Create a new stream that both streams to client and collects for history
    let fullPrompt = ''
    
    const transformStream = new TransformStream({
      transform(chunk, controller) {
        // Decode the chunk
        const text = new TextDecoder().decode(chunk)
        fullPrompt += text
        
        // Forward the chunk to the client
        controller.enqueue(chunk)
      },
      async flush(controller) {
        // When streaming is complete, save to history immediately
        if (userId && fullPrompt.trim()) {
          try {
            await savePromptHistory(userId, sessionId, input.trim(), fullPrompt)
          } catch (error) {
            console.error('Error saving prompt history:', error)
          }
        }
        controller.terminate()
      }
    })
    
    // Pipe the original stream through our transform stream
    const responseStream = stream.pipeThrough(transformStream)
    
    // Return the transformed stream
    return new Response(responseStream)
  } catch (error) {
    console.error('Error in generate-prompt API:', error)
    
    return NextResponse.json(
      { error: 'Failed to generate prompt. Please try again later.' },
      { status: 500 }
    )
  }
}
