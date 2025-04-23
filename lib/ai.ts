import { createOpenAI } from '@ai-sdk/openai';

/**
 * Configuration for the Vercel AI SDK OpenAI client
 * This client is used for text generation and analysis of scraped website content
 */

// Verify environment variables
if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

// Initialize OpenAI client with configuration
export const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  compatibility: 'strict', // Required for OpenAI API
});

/**
 * Helper function to generate structured analysis of website content
 * @param content The scraped website content
 * @returns Structured analysis of the website
 */
export async function analyzeWebsiteContent(content: string) {
  const { z } = await import('zod');
  const { generateText } = await import('ai');

  // Define schema for validation only
  const schema = z.object({
    title: z.string().describe('The title or name of the website'),
    summary: z.string().describe('A concise summary of what the website offers or sells'),
    primaryProducts: z.array(z.string()).describe('Main product categories or featured items'),
    targetAudience: z.string().describe('Who the website appears to target as customers'),
    keyStrengths: z.array(z.string()).describe('Notable positive aspects of the website'),
    improvementAreas: z.array(z.string()).describe('Areas where the website could be improved'),
    competitiveAdvantages: z.array(z.string()).describe('What sets this site apart from competitors'),
    seoConsiderations: z.array(z.string()).describe('SEO observations and potential improvements'),
  });

  // Use generateText from Vercel AI SDK
  const prompt = `
    Analyze this e-commerce website content thoroughly and return a JSON object with these fields:
    - title: The title or name of the website
    - summary: A concise summary of what the website offers or sells
    - primaryProducts: Array of main product categories or featured items
    - targetAudience: Who the website appears to target as customers
    - keyStrengths: Array of notable positive aspects of the website
    - improvementAreas: Array of areas where the website could be improved
    - competitiveAdvantages: Array of what sets this site apart from competitors
    - seoConsiderations: Array of SEO observations and potential improvements

    Content: ${content.slice(0, 8000)}...
    
    Format your response as valid JSON without any other text.
  `;

  // Use the JSON mode to get structured output directly
  const jsonResponse = await generateText({
    model: openai('gpt-4o'),
    prompt: prompt,
    maxTokens: 2000,
  });

  try {
    // @ts-ignore - Vercel AI SDK types are complex
    const result = JSON.parse(jsonResponse);
    return schema.parse(result);
  } catch (error) {
    console.error('Failed to parse AI response as JSON:', error);
    throw new Error('Could not generate website analysis');
  }
}

/**
 * Helper function to generate a plain text analysis
 * @param content The scraped website content
 * @param analysisType The type of analysis to generate (e.g., "SEO", "UX", "Marketing")
 * @returns Text analysis of the website
 */
export async function generateTextAnalysis(content: string, analysisType: string) {
  const { generateText } = await import('ai');

  return generateText({
    model: openai('gpt-4o'),
    prompt: `Generate a detailed ${analysisType} analysis of this e-commerce website. 
    Focus on key strengths, weaknesses, and specific recommendations for improvement.
    Content: ${content.slice(0, 8000)}...`,
    maxTokens: 2000,
  });
}

export default openai; 