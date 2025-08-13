import { supabase } from './supabase'
import { NextRequest } from 'next/server'
import { generatePromptTitle } from './openai'
import { getClientIpAddress } from './usage-tracking';

// Function to get client IP address from request
  // export function getClientIP(request: NextRequest): string {
  //   // Check various headers for the real IP
  //   const forwarded = request.headers.get('x-forwarded-for')
  //   const realIP = request.headers.get('x-real-ip')
  //   const cfConnectingIP = request.headers.get('cf-connecting-ip')
    
  //   if (forwarded) {
  //     return forwarded.split(',')[0].trim()
  //   }
    
  //   if (realIP) {
  //     return realIP
  //   }
    
  //   if (cfConnectingIP) {
  //     return cfConnectingIP
  //   }
    
  //   // For development, return localhost
  //   // In production, the headers should contain the real IP
  //   return request.ip || '127.0.0.1'
  // }

// Function to get user agent from request
export function getUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') || 'Unknown'
}

// Function to create or update user session with IP
export async function updateUserSession(userId: string, request: NextRequest): Promise<string | null> {
  try {
    const ipAddress = await getClientIpAddress(request);
    const userAgent = getUserAgent(request)
    
    // Get the most recent session for this user
    const { data: existingSessions, error: sessionError } = await supabase
      .from('user_sessions')
      .select('id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
    
    if (sessionError) {
      console.error('Error fetching user sessions:', sessionError)
      return null
    }
    
    // If there's a recent session (within last hour), update it with IP
    if (existingSessions && existingSessions.length > 0) {
      const sessionId = existingSessions[0].id
      
      const { error: updateError } = await supabase
        .from('user_sessions')
        .update({ 
          ip_address: ipAddress,
          user_agent: userAgent
        })
        .eq('id', sessionId)
      
      if (updateError) {
        console.error('Error updating session IP:', updateError)
      }
      
      return sessionId
    }
    
    // Create new session
    const { data: newSession, error: insertError } = await supabase
      .from('user_sessions')
      .insert({
        user_id: userId,
        user_agent: userAgent,
        ip_address: ipAddress,
      })
      .select('id')
      .single()
    
    if (insertError) {
      console.error('Error creating user session:', insertError)
      return null
    }
    
    return newSession?.id || null
  } catch (error) {
    console.error('Error in updateUserSession:', error)
    return null
  }
}

// Function to save prompt history with generated title
export async function savePromptHistory(
  userId: string,
  sessionId: string | null,
  inputText: string,
  outputText: string
): Promise<void> {
  try {
    // Generate a title for the prompt
    const title = await generatePromptTitle(inputText)
    
    const { error } = await supabase
      .from('prompt_history')
      .insert({
        user_id: userId,
        session_id: sessionId,
        input_text: inputText,
        output_text: outputText,
        title: title,
      })

    if (error) {
      console.error('Error saving prompt history:', error)
    }
  } catch (error) {
    console.error('Error in savePromptHistory:', error)
  }
}
