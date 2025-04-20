import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  })

  return response.data[0].embedding
}

export async function analyzeArticle(article: {
  title: string
  content: string
  category?: string
}): Promise<{
  summary: string
  impact_score: number
  financial_impact: {
    score: number
    explanation: string
  }
  career_impact: {
    score: number
    explanation: string
  }
  personal_impact: {
    score: number
    explanation: string
  }
}> {
  const prompt = `
    Analyze the following news article and provide:
    1. A concise summary (max 2 sentences)
    2. An overall impact score from 0-100
    3. Financial impact assessment (score 0-10 and brief explanation)
    4. Career impact assessment (score 0-10 and brief explanation)
    5. Personal impact assessment (score 0-10 and brief explanation)

    Article Title: ${article.title}
    Article Category: ${article.category || "General"}
    Article Content: ${article.content}

    Format your response as JSON with the following structure:
    {
      "summary": "Concise summary here",
      "impact_score": 75,
      "financial_impact": {
        "score": 8,
        "explanation": "Brief explanation"
      },
      "career_impact": {
        "score": 6,
        "explanation": "Brief explanation"
      },
      "personal_impact": {
        "score": 4,
        "explanation": "Brief explanation"
      }
    }
  `

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are an AI assistant that analyzes news articles and provides impact assessments in JSON format.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: { type: "json_object" },
  })

  const content = response.choices[0].message.content
  if (!content) {
    throw new Error("Failed to analyze article")
  }

  return JSON.parse(content)
}
