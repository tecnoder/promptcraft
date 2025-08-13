import { supabase } from './supabase'
import { NextRequest } from 'next/server'
import { createHash } from 'crypto'
import { uuidv7 } from 'uuidv7'

export interface UsageLimit {
  canGenerate: boolean
  promptsUsed: number
  maxPrompts: number
  isAuthenticated: boolean
  resetTime?: Date
}

// Hash IP + User Agent for anonymous session identification
export function createAnonymousSessionId(ip: string, userAgent: string): string {
  return createHash('sha256').update(`${ip}:${userAgent}`).digest('hex')
}

export async function getClientIpAddress(request: NextRequest): Promise<string> {
  const res = await fetch("https://api.ipify.org/?format=json");
  const data = await res.json();
  console.log("ip", data.ip);
  return data.ip;
}

// Get client IP from request headers
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP
  }
  
  return '127.0.0.1'
}

// Check usage limits for authenticated users (unlimited)
export async function checkAuthenticatedUserUsage(userId: string): Promise<UsageLimit> {
  return {
    canGenerate: true, // Unlimited for authenticated users
    promptsUsed: 0,
    maxPrompts: 999999, // Effectively unlimited
    isAuthenticated: true
  }
}

// Check usage limits for anonymous users (1 prompt only)
export async function checkAnonymousUserUsage(sessionId: string): Promise<UsageLimit> {
  try {
    const { data, error } = await supabase
      .from('usage_tracking')
      .select('prompts_used')
      .eq('session_identifier', sessionId)
      .single()

    console.log("sessionId", sessionId);
    console.log("data", data);
    console.log("error", error);

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error checking anonymous usage:', error)
      return {
        canGenerate: true, // Allow first attempt on error
        promptsUsed: 0,
        maxPrompts: 1,
        isAuthenticated: false
      }
    }

    // If no record exists (PGRST116), user hasn't used any prompts yet
    if (error && error.code === 'PGRST116') {
      return {
        canGenerate: true,
        promptsUsed: 0,
        maxPrompts: 1,
        isAuthenticated: false
      }
    }

    const promptsUsed = data?.prompts_used || 0
    const maxPrompts = 1

    return {
      canGenerate: promptsUsed < maxPrompts,
      promptsUsed,
      maxPrompts,
      isAuthenticated: false
    }
  } catch (error) {
    console.error('Error in checkAnonymousUserUsage:', error)
    return {
      canGenerate: true, // Allow first attempt on error
      promptsUsed: 0,
      maxPrompts: 1,
      isAuthenticated: false
    }
  }
}

// Increment usage count for authenticated users (no-op since unlimited)
export async function incrementAuthenticatedUserUsage(userId: string): Promise<void> {
  // No tracking needed for authenticated users since they have unlimited prompts
  return
}

// Increment usage count for anonymous users
export async function incrementAnonymousUserUsage(sessionId: string): Promise<void> {
  try {
    const { data: existing, error: selectError } = await supabase
      .from('usage_tracking')
      .select('id, prompts_used')
      .eq('session_identifier', sessionId)
      .single()

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('Error selecting anonymous usage:', selectError)
      return
    }

    if (existing) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('usage_tracking')
        .update({ 
          prompts_used: existing.prompts_used + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)

      if (updateError) {
        console.error('Error updating anonymous usage:', updateError)
      }
    } else {
      // Create new record
      const { error: insertError } = await supabase
        .from('usage_tracking')
        .insert({
          id: uuidv7(),
          session_identifier: sessionId,
          prompts_used: 1
        })

      if (insertError) {
        console.error('Error inserting anonymous usage:', insertError)
      }
    }
  } catch (error) {
    console.error('Error in incrementAnonymousUserUsage:', error)
  }
}

// Get usage information for display
export async function getUsageInfo(request: NextRequest): Promise<UsageLimit> {
  try {
    // Check if user is authenticated
    const authHeader = request.headers.get('authorization')
    
    if (authHeader) {
      const { data: { user }, error } = await supabase.auth.getUser(
        authHeader.replace('Bearer ', '')
      )
      
      if (!error && user) {
        return await checkAuthenticatedUserUsage(user.id)
      }
    }
    
    // Handle anonymous user
    const ipAddress = await getClientIpAddress(request);

    const userAgent = request.headers.get('user-agent') || 'Unknown'
    const sessionId = createAnonymousSessionId(ipAddress, userAgent)
    console.log("sessionId", sessionId);

    return await checkAnonymousUserUsage(sessionId)
  } catch (error) {
    console.error('Error in getUsageInfo:', error)
    return {
      canGenerate: false,
      promptsUsed: 0,
      maxPrompts: 1,
      isAuthenticated: false
    }
  }
}
