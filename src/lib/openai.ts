import OpenAI from 'openai'

// Initialize OpenAI client only when needed
let openaiClient: OpenAI | null = null

const getOpenAIClient = () => {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set')
    }
    openaiClient = new OpenAI({ apiKey })
  }
  return openaiClient
}

export const generatePrompt = async (userInput: string): Promise<string> => {
  const metaPrompt = `You are a sophisticated prompt engineering assistant. Your task is to transform the user's simple request into a detailed, well-structured prompt that will produce optimal results when used with AI tools.

Transform the following user input into a professional, detailed prompt using this structure:

**Role:** Define the AI's role/expertise relevant to the request
**Objective:** Clear statement of what needs to be accomplished  
**Context:** Background information and use case details
**Technical Specifications:** Specific requirements, frameworks, technologies
**Acceptance Criteria:** Clear success criteria and requirements
**Output Format:** Specify exactly how the response should be formatted

Make the prompt comprehensive, actionable, and ready to copy-paste into any AI tool. Include all necessary technical details an AI would need to provide an excellent response.

User Input: "${userInput}"

Generate a well-structured prompt:`

  try {
    const openai = getOpenAIClient()
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert prompt engineer who creates detailed, structured prompts that maximize AI performance."
        },
        {
          role: "user",
          content: metaPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    })

    return completion.choices[0]?.message?.content || "Error generating prompt"
  } catch (error) {
    console.error('Error generating prompt:', error)
    throw new Error('Failed to generate prompt')
  }
}
