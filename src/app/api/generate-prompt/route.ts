import { NextRequest, NextResponse } from 'next/server'
import { generatePrompt } from '@/lib/openai'

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

    const prompt = await generatePrompt(input.trim())

    return NextResponse.json({ prompt })
  } catch (error) {
    console.error('Error in generate-prompt API:', error)
    
    return NextResponse.json(
      { error: 'Failed to generate prompt. Please try again later.' },
      { status: 500 }
    )
  }
}
