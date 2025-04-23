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

/**
 * Generates a detailed marketing strategy analysis based on website content
 * @param content The scraped website content
 * @returns Structured marketing strategy recommendations
 */
export async function analyzeMarketingStrategy(content: string) {
  const { z } = await import('zod');
  const { generateText } = await import('ai');

  // Define schema for validation
  const schema = z.object({
    overview: z.string().describe('High-level marketing strategy overview'),
    targetAudience: z.array(z.object({
      segment: z.string().describe('Name of customer segment'),
      description: z.string().describe('Description of this customer segment'),
      channels: z.array(z.string()).describe('Recommended marketing channels for this segment')
    })),
    contentRecommendations: z.array(z.string()).describe('Content marketing recommendations'),
    socialMediaStrategy: z.array(z.string()).describe('Social media marketing recommendations'),
    emailMarketing: z.array(z.string()).describe('Email marketing campaign ideas'),
    paidAdvertising: z.array(z.string()).describe('Paid advertising recommendations'),
    conversionOptimization: z.array(z.string()).describe('Conversion rate optimization suggestions'),
    brandMessaging: z.string().describe('Brand messaging and positioning recommendations'),
    nextSteps: z.array(z.string()).describe('Suggested next steps for implementation')
  });

  const prompt = `
    Analyze this e-commerce website content and develop a comprehensive marketing strategy.
    Return a JSON object with these fields:
    - overview: High-level marketing strategy overview
    - targetAudience: Array of audience segments with {segment, description, channels}
    - contentRecommendations: Array of content marketing recommendations
    - socialMediaStrategy: Array of social media marketing recommendations 
    - emailMarketing: Array of email marketing campaign ideas
    - paidAdvertising: Array of paid advertising recommendations
    - conversionOptimization: Array of conversion rate optimization suggestions
    - brandMessaging: Brand messaging and positioning recommendations
    - nextSteps: Array of suggested next steps for implementation
    
    Content: ${content.slice(0, 8000)}...
    
    Format your response as valid JSON without any other text.
  `;

  const jsonResponse = await generateText({
    model: openai('gpt-4o'),
    prompt: prompt,
    maxTokens: 2500,
  });

  try {
    // @ts-ignore
    const result = JSON.parse(jsonResponse);
    return schema.parse(result);
  } catch (error) {
    console.error('Failed to parse marketing strategy analysis:', error);
    throw new Error('Could not generate marketing strategy analysis');
  }
}

/**
 * Generates a detailed content strategy analysis based on website content
 * @param content The scraped website content
 * @returns Structured content strategy recommendations
 */
export async function analyzeContentStrategy(content: string) {
  const { z } = await import('zod');
  const { generateText } = await import('ai');

  // Define schema for validation
  const schema = z.object({
    overview: z.string().describe('High-level content strategy overview'),
    contentGaps: z.array(z.string()).describe('Identified content gaps on the website'),
    contentTypes: z.array(z.object({
      type: z.string().describe('Content type'),
      purpose: z.string().describe('Purpose of this content type'),
      topics: z.array(z.string()).describe('Suggested topics for this content type')
    })),
    seoKeywords: z.array(z.string()).describe('Recommended SEO keywords to target'),
    contentCalendar: z.array(z.string()).describe('Content calendar recommendations'),
    contentDistribution: z.array(z.string()).describe('Content distribution suggestions'),
    contentUpgrades: z.array(z.string()).describe('Recommendations for improving existing content'),
    nextSteps: z.array(z.string()).describe('Suggested next steps for implementation')
  });

  const prompt = `
    Analyze this e-commerce website content and develop a comprehensive content strategy.
    Return a JSON object with these fields:
    - overview: High-level content strategy overview
    - contentGaps: Array of identified content gaps on the website
    - contentTypes: Array of recommended content types with {type, purpose, topics}
    - seoKeywords: Array of recommended SEO keywords to target
    - contentCalendar: Array of content calendar recommendations
    - contentDistribution: Array of content distribution suggestions
    - contentUpgrades: Array of recommendations for improving existing content
    - nextSteps: Array of suggested next steps for implementation
    
    Content: ${content.slice(0, 8000)}...
    
    Format your response as valid JSON without any other text.
  `;

  const jsonResponse = await generateText({
    model: openai('gpt-4o'),
    prompt: prompt,
    maxTokens: 2500,
  });

  try {
    // @ts-ignore
    const result = JSON.parse(jsonResponse);
    return schema.parse(result);
  } catch (error) {
    console.error('Failed to parse content strategy analysis:', error);
    throw new Error('Could not generate content strategy analysis');
  }
}

/**
 * Generates a detailed technical recommendations analysis based on website content
 * @param content The scraped website content
 * @returns Structured technical recommendations
 */
export async function analyzeTechnicalRecommendations(content: string) {
  const { z } = await import('zod');
  const { generateText } = await import('ai');

  // Define schema for validation
  const schema = z.object({
    overview: z.string().describe('High-level technical overview'),
    performance: z.array(z.string()).describe('Website performance recommendations'),
    security: z.array(z.string()).describe('Security recommendations'),
    accessibility: z.array(z.string()).describe('Accessibility improvements'),
    mobileFriendliness: z.array(z.string()).describe('Mobile optimization recommendations'),
    architecture: z.array(z.string()).describe('Website architecture recommendations'),
    checkout: z.array(z.string()).describe('Checkout process improvements'),
    integrations: z.array(z.string()).describe('Recommended third-party integrations'),
    analytics: z.array(z.string()).describe('Analytics and tracking recommendations'),
    nextSteps: z.array(z.string()).describe('Prioritized technical tasks')
  });

  const prompt = `
    Analyze this e-commerce website content and develop comprehensive technical recommendations.
    Return a JSON object with these fields:
    - overview: High-level technical overview
    - performance: Array of website performance recommendations
    - security: Array of security recommendations
    - accessibility: Array of accessibility improvements
    - mobileFriendliness: Array of mobile optimization recommendations
    - architecture: Array of website architecture recommendations
    - checkout: Array of checkout process improvements
    - integrations: Array of recommended third-party integrations
    - analytics: Array of analytics and tracking recommendations
    - nextSteps: Array of prioritized technical tasks
    
    Content: ${content.slice(0, 8000)}...
    
    Format your response as valid JSON without any other text.
  `;

  const jsonResponse = await generateText({
    model: openai('gpt-4o'),
    prompt: prompt,
    maxTokens: 2500,
  });

  try {
    // @ts-ignore
    const result = JSON.parse(jsonResponse);
    return schema.parse(result);
  } catch (error) {
    console.error('Failed to parse technical recommendations analysis:', error);
    throw new Error('Could not generate technical recommendations');
  }
}

export default openai; 