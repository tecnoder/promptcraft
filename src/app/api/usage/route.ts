import { NextRequest, NextResponse } from 'next/server'
import { getUsageInfo } from '@/lib/usage-tracking'

export async function GET(request: NextRequest) {
  try {
    const usageInfo = await getUsageInfo(request)
    
    return NextResponse.json({
      canGenerate: usageInfo.canGenerate,
      promptsUsed: usageInfo.promptsUsed,
      maxPrompts: usageInfo.maxPrompts,
      isAuthenticated: usageInfo.isAuthenticated,
      remainingPrompts: usageInfo.maxPrompts - usageInfo.promptsUsed
    })
  } catch (error) {
    console.error('Error getting usage info:', error)
    return NextResponse.json(
      { error: 'Failed to get usage information' },
      { status: 500 }
    )
  }
}
