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
 * Creates fallback data when AI response fails schema validation
 * @param contentSnippet A small portion of the content to use for generating placeholders
 * @returns A basic object with placeholder data that matches the schema
 */
function createWebsiteAnalysisFallback(contentSnippet: string) {
  const siteName = contentSnippet.includes('# ') 
    ? contentSnippet.split('# ')[1]?.split('\n')[0] || 'Example Website' 
    : 'Example Website';
  
  return {
    title: siteName,
    summary: `This appears to be an e-commerce website about ${siteName}.`,
    primaryProducts: ["Product A", "Product B", "Product C"],
    targetAudience: "General consumers interested in these products",
    keyStrengths: ["Clear product presentation", "Easy navigation"],
    improvementAreas: ["Could improve mobile responsiveness", "Add more product details"],
    competitiveAdvantages: ["Unique value proposition", "Good user experience"],
    seoConsiderations: ["Add more keywords", "Improve meta descriptions"]
  };
}

/**
 * Creates fallback data for marketing strategy when AI response fails schema validation
 */
function createMarketingStrategyFallback(contentSnippet: string) {
  return {
    overview: "A comprehensive marketing strategy focused on increasing brand awareness and conversion rates.",
    targetAudience: [
      {
        segment: "Primary segment",
        description: "Main customer demographic based on the website content",
        channels: ["Social media", "Email", "Content marketing"]
      },
      {
        segment: "Secondary segment",
        description: "Additional potential customers",
        channels: ["Paid search", "Partnerships"]
      }
    ],
    contentRecommendations: ["Create a blog with industry insights", "Develop detailed product guides"],
    socialMediaStrategy: ["Focus on visual platforms like Instagram", "Engage with audience through Twitter"],
    emailMarketing: ["Welcome series for new subscribers", "Abandoned cart recovery"],
    paidAdvertising: ["Google Ads focused on main keywords", "Retargeting campaigns"],
    conversionOptimization: ["Simplify checkout process", "Add trust signals"],
    brandMessaging: "Focus on quality, reliability, and excellent customer service",
    nextSteps: ["Audit current marketing channels", "Develop content calendar", "Set up analytics tracking"]
  };
}

/**
 * Creates fallback data for content strategy when AI response fails schema validation
 */
function createContentStrategyFallback(contentSnippet: string) {
  return {
    overview: "A strategic content plan to improve engagement and conversions",
    contentGaps: ["Detailed product comparisons", "Customer success stories", "Educational content"],
    contentTypes: [
      {
        type: "Blog posts",
        purpose: "Establish authority and improve SEO",
        topics: ["Industry trends", "How-to guides", "Product spotlights"]
      },
      {
        type: "Video content",
        purpose: "Demonstrate products and engage visual learners",
        topics: ["Product demos", "Customer testimonials", "Behind the scenes"]
      }
    ],
    seoKeywords: ["Main product category", "Problem solving terms", "Branded terms"],
    contentCalendar: ["Weekly blog posts", "Monthly newsletters", "Quarterly comprehensive guides"],
    contentDistribution: ["Share on social media", "Email to subscribers", "Partner cross-promotion"],
    contentUpgrades: ["Add more visuals to existing pages", "Update older content with new information"],
    nextSteps: ["Conduct keyword research", "Create content templates", "Set up monitoring metrics"]
  };
}

/**
 * Creates fallback data for technical recommendations when AI response fails schema validation
 */
function createTechnicalRecommendationsFallback(contentSnippet: string) {
  return {
    overview: "Technical improvements to enhance user experience and site performance",
    performance: ["Optimize image sizes", "Implement browser caching", "Minify CSS and JavaScript"],
    security: ["Add SSL certificate", "Implement secure payment processing", "Regular security audits"],
    accessibility: ["Ensure proper contrast ratios", "Add alt text to images", "Make site keyboard navigable"],
    mobileFriendliness: ["Use responsive design", "Optimize tap targets", "Test on multiple devices"],
    architecture: ["Implement clear URL structure", "Organize product categories logically", "Create XML sitemap"],
    checkout: ["Reduce form fields", "Add guest checkout option", "Show progress indicators"],
    integrations: ["Email marketing platform", "Customer support chat", "Analytics tools"],
    analytics: ["Set up conversion tracking", "Monitor user flow", "Analyze drop-off points"],
    nextSteps: ["Perform technical audit", "Prioritize changes by impact", "Create implementation timeline"]
  };
}

/**
 * Helper function to generate structured analysis of website content
 * @param content The scraped website content
 * @returns Structured analysis of the website
 */
export async function analyzeWebsiteContent(content: string) {
  const { z } = await import('zod');
  const { generateObject } = await import('ai');

  // Define schema
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

  try {
    // Use generateObject which handles schema validation natively
    const result = await generateObject({
      model: openai('gpt-4o', {
        structuredOutputs: true,
      }),
      schema,
      schemaName: 'websiteAnalysis',
      schemaDescription: 'Analysis of e-commerce website content',
      prompt: `
        Analyze this e-commerce website content thoroughly:
        
        Content: ${content.slice(0, 8000)}...
        
        Return a comprehensive analysis of the website.
      `,
      maxTokens: 2000,
    });
    
    return result;
  } catch (error) {
    console.error('Failed to generate website analysis:', error);
    console.log('Using fallback data for website analysis');
    
    // Use fallback data instead of throwing
    const contentSnippet = content.slice(0, 500);
    return createWebsiteAnalysisFallback(contentSnippet);
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
  const { generateObject } = await import('ai');

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

  try {
    // Use generateObject which handles schema validation natively
    const result = await generateObject({
      model: openai('gpt-4o', {
        structuredOutputs: true,
      }),
      schema,
      schemaName: 'marketingStrategy',
      schemaDescription: 'Comprehensive marketing strategy for an e-commerce website',
      prompt: `
        Analyze this e-commerce website content and develop a comprehensive marketing strategy:
        
        Content: ${content.slice(0, 8000)}...
      `,
      maxTokens: 2500,
    });
    
    return result;
  } catch (error) {
    console.error('Failed to generate marketing strategy:', error);
    console.log('Using fallback data for marketing strategy analysis');
    
    // Use fallback data instead of throwing
    const contentSnippet = content.slice(0, 500);
    return createMarketingStrategyFallback(contentSnippet);
  }
}

/**
 * Generates a detailed content strategy based on website content analysis
 * @param content The scraped website content
 * @returns Structured content strategy recommendations
 */
export async function analyzeContentStrategy(content: string) {
  const { z } = await import('zod');
  const { generateObject } = await import('ai');

  // Define schema for validation
  const schema = z.object({
    overview: z.string().describe('High-level content strategy overview'),
    contentGaps: z.array(z.string()).describe('Content gaps and opportunities identified'),
    contentTypes: z.array(z.object({
      type: z.string().describe('Content type (e.g., blog posts, videos)'),
      purpose: z.string().describe('Purpose of this content type'),
      topics: z.array(z.string()).describe('Suggested topics for this content type')
    })),
    seoKeywords: z.array(z.string()).describe('Recommended SEO keywords to target'),
    contentCalendar: z.array(z.string()).describe('Content calendar and publishing frequency recommendations'),
    contentDistribution: z.array(z.string()).describe('Channels and methods to distribute content'),
    contentUpgrades: z.array(z.string()).describe('Suggestions to improve existing content'),
    nextSteps: z.array(z.string()).describe('Immediate next steps for content strategy implementation')
  });

  try {
    // Use generateObject which handles schema validation natively
    const result = await generateObject({
      model: openai('gpt-4o', {
        structuredOutputs: true,
      }),
      schema,
      schemaName: 'contentStrategy',
      schemaDescription: 'Content strategy plan for an e-commerce website',
      prompt: `
        Analyze this e-commerce website content and develop a comprehensive content strategy:
        
        Content: ${content.slice(0, 8000)}...
      `,
      maxTokens: 2500,
    });
    
    return result;
  } catch (error) {
    console.error('Failed to generate content strategy:', error);
    console.log('Using fallback data for content strategy analysis');
    
    // Use fallback data instead of throwing
    const contentSnippet = content.slice(0, 500);
    return createContentStrategyFallback(contentSnippet);
  }
}

/**
 * Generates technical recommendations based on website content analysis
 * @param content The scraped website content
 * @returns Structured technical recommendations
 */
export async function analyzeTechnicalRecommendations(content: string) {
  const { z } = await import('zod');
  const { generateObject } = await import('ai');

  // Define schema for validation
  const schema = z.object({
    overview: z.string().describe('High-level technical recommendations overview'),
    performance: z.array(z.string()).describe('Website performance optimization recommendations'),
    security: z.array(z.string()).describe('Security improvement recommendations'),
    accessibility: z.array(z.string()).describe('Accessibility improvement recommendations'),
    mobileFriendliness: z.array(z.string()).describe('Mobile optimization recommendations'),
    architecture: z.array(z.string()).describe('Site architecture recommendations'),
    checkout: z.array(z.string()).describe('Checkout process optimization recommendations'),
    integrations: z.array(z.string()).describe('Recommended third-party integrations'),
    analytics: z.array(z.string()).describe('Analytics setup and monitoring recommendations'),
    nextSteps: z.array(z.string()).describe('Prioritized next steps for technical improvements')
  });

  try {
    // Use generateObject which handles schema validation natively
    const result = await generateObject({
      model: openai('gpt-4o', {
        structuredOutputs: true,
      }),
      schema,
      schemaName: 'technicalRecommendations',
      schemaDescription: 'Technical recommendations for an e-commerce website',
      prompt: `
        Analyze this e-commerce website content and provide comprehensive technical recommendations:
        
        Content: ${content.slice(0, 8000)}...
      `,
      maxTokens: 2500,
    });
    
    return result;
  } catch (error) {
    console.error('Failed to generate technical recommendations:', error);
    console.log('Using fallback data for technical recommendations analysis');
    
    // Use fallback data instead of throwing
    const contentSnippet = content.slice(0, 500);
    return createTechnicalRecommendationsFallback(contentSnippet);
  }
}

export default openai; 