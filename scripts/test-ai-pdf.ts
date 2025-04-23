import * as fs from 'fs';
import * as path from 'path';
import openai from '../lib/ai';
import {
    addList,
    addPageBreak,
    addSpacing,
    addSubtitle,
    addTable,
    addText,
    addTitle,
    createPDFDocument,
    finalizePDF
} from '../lib/pdf';

// Ensure output directory exists
const outputDir = path.join(process.cwd(), 'tmp');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

interface AnalysisResult {
  overview: string;
  performance: {
    summary: string;
    issues: string[];
    recommendations: string[];
  };
  seo: {
    summary: string;
    issues: string[];
    recommendations: string[];
  };
  security: {
    summary: string;
    issues: string[];
    recommendations: string[];
  };
  userExperience: {
    summary: string;
    issues: string[];
    recommendations: string[];
  };
  accessibility: {
    summary: string;
    issues: string[];
    recommendations: string[];
  };
}

// Mock data if AI call fails
const mockAnalysis: AnalysisResult = {
  overview: "The website shows potential but has several key areas that need immediate attention to improve performance, user experience, and conversion rates.",
  performance: {
    summary: "The site loads slowly with a First Contentful Paint of 3.2s, which is below industry standards.",
    issues: [
      "Heavy JavaScript files blocking rendering",
      "Unoptimized images throughout the site",
      "Too many HTTP requests on product pages"
    ],
    recommendations: [
      "Implement code splitting and lazy loading",
      "Optimize and compress images site-wide",
      "Implement resource hints (preload, prefetch)"
    ]
  },
  seo: {
    summary: "SEO implementation is basic with several missed opportunities for better search visibility.",
    issues: [
      "Missing meta descriptions on 40% of pages",
      "Duplicate title tags on product categories",
      "Poor internal linking structure"
    ],
    recommendations: [
      "Audit and implement unique meta descriptions",
      "Create a consistent title tag formula",
      "Improve internal linking with relevant anchor text"
    ]
  },
  security: {
    summary: "Several security vulnerabilities need addressing to protect customer data.",
    issues: [
      "Missing HTTPS on checkout pages",
      "Outdated third-party libraries with known vulnerabilities",
      "No Content Security Policy implemented"
    ],
    recommendations: [
      "Enable HTTPS site-wide with proper redirects",
      "Update all third-party dependencies",
      "Implement and test a Content Security Policy"
    ]
  },
  userExperience: {
    summary: "The user journey contains friction points that likely impact conversion rates.",
    issues: [
      "Checkout process requires too many steps",
      "Mobile navigation is difficult to use",
      "Product filtering is limited and slow"
    ],
    recommendations: [
      "Simplify checkout to 3 steps maximum",
      "Redesign mobile navigation for thumb-friendly usage",
      "Implement AJAX filtering with clear visual feedback"
    ]
  },
  accessibility: {
    summary: "The site fails several WCAG 2.1 AA requirements, limiting access for users with disabilities.",
    issues: [
      "Poor color contrast in navigation and CTAs",
      "Missing alt text on product images",
      "Form fields lack proper labels and instructions"
    ],
    recommendations: [
      "Increase contrast ratios to meet WCAG AA standards",
      "Add descriptive alt text to all images",
      "Implement properly associated labels for all form fields"
    ]
  }
};

async function runAIAnalysis(url: string): Promise<AnalysisResult> {
  try {
    console.log(`Getting AI analysis for ${url}...`);
    const { generateText } = await import('ai');
    
    const prompt = `You are an expert web analyst specializing in performance, SEO, security, UX, and accessibility. 
Analyze the provided website URL and create a comprehensive report. Your analysis must follow the exact JSON format below:

{
  "overview": "Brief 1-2 sentence overview of site's overall quality",
  "performance": {
    "summary": "Performance summary in 1-2 sentences",
    "issues": ["Issue 1", "Issue 2", "Issue 3"],
    "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"]
  },
  "seo": {
    "summary": "SEO summary in 1-2 sentences",
    "issues": ["Issue 1", "Issue 2", "Issue 3"],
    "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"]
  },
  "security": {
    "summary": "Security summary in 1-2 sentences",
    "issues": ["Issue 1", "Issue 2", "Issue 3"],
    "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"]
  },
  "userExperience": {
    "summary": "UX summary in 1-2 sentences",
    "issues": ["Issue 1", "Issue 2", "Issue 3"],
    "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"]
  },
  "accessibility": {
    "summary": "Accessibility summary in 1-2 sentences",
    "issues": ["Issue 1", "Issue 2", "Issue 3"],
    "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"]
  }
}

Analyze this website: ${url}. Provide a comprehensive technical analysis in the required JSON format.
Do NOT include any text outside the JSON. Response MUST be valid JSON.`;

    const jsonResponse = await generateText({
      model: openai('gpt-4o'),
      prompt: prompt,
      maxTokens: 2500,
    });

    // Parse and validate
    try {
      const analysis = typeof jsonResponse === 'object' && jsonResponse !== null 
        ? jsonResponse 
        : JSON.parse(jsonResponse as string);
      
      // Basic validation - make sure all required fields exist
      if (!analysis.overview ||
          !analysis.performance?.summary || !analysis.performance?.issues || !analysis.performance?.recommendations ||
          !analysis.seo?.summary || !analysis.seo?.issues || !analysis.seo?.recommendations ||
          !analysis.security?.summary || !analysis.security?.issues || !analysis.security?.recommendations ||
          !analysis.userExperience?.summary || !analysis.userExperience?.issues || !analysis.userExperience?.recommendations ||
          !analysis.accessibility?.summary || !analysis.accessibility?.issues || !analysis.accessibility?.recommendations) {
        throw new Error('Response missing required fields');
      }
      return analysis as AnalysisResult;
    } catch (error) {
      console.error('Error parsing AI response:', error);
      console.error('Raw response:', jsonResponse);
      throw new Error('Failed to parse AI response');
    }
  } catch (error) {
    console.error('Error in AI analysis:', error);
    console.log('Using mock data instead');
    return mockAnalysis;
  }
}

async function generatePDF(analysis: AnalysisResult, url: string): Promise<Buffer> {
  console.log('Generating PDF from analysis...');
  
  // Create PDF document
  const doc = createPDFDocument();
  
  // Add title and website info
  addTitle(doc, 'Website Analysis Report');
  addSubtitle(doc, url);
  
  addSpacing(doc, 1);
  
  // Overview
  addSubtitle(doc, 'Overview');
  addText(doc, analysis.overview);
  
  addSpacing(doc, 1);
  
  // Performance
  addSubtitle(doc, 'Performance Analysis');
  addText(doc, analysis.performance.summary);
  
  addText(doc, 'Issues:');
  addList(doc, analysis.performance.issues);
  
  addText(doc, 'Recommendations:');
  addList(doc, analysis.performance.recommendations);
  
  addPageBreak(doc);
  
  // SEO
  addSubtitle(doc, 'SEO Analysis');
  addText(doc, analysis.seo.summary);
  
  addText(doc, 'Issues:');
  addList(doc, analysis.seo.issues);
  
  addText(doc, 'Recommendations:');
  addList(doc, analysis.seo.recommendations);
  
  addSpacing(doc, 1);
  
  // Security
  addSubtitle(doc, 'Security Analysis');
  addText(doc, analysis.security.summary);
  
  addText(doc, 'Issues:');
  addList(doc, analysis.security.issues);
  
  addText(doc, 'Recommendations:');
  addList(doc, analysis.security.recommendations);
  
  addPageBreak(doc);
  
  // User Experience
  addSubtitle(doc, 'User Experience Analysis');
  addText(doc, analysis.userExperience.summary);
  
  addText(doc, 'Issues:');
  addList(doc, analysis.userExperience.issues);
  
  addText(doc, 'Recommendations:');
  addList(doc, analysis.userExperience.recommendations);
  
  addSpacing(doc, 1);
  
  // Accessibility
  addSubtitle(doc, 'Accessibility Analysis');
  addText(doc, analysis.accessibility.summary);
  
  addText(doc, 'Issues:');
  addList(doc, analysis.accessibility.issues);
  
  addText(doc, 'Recommendations:');
  addList(doc, analysis.accessibility.recommendations);
  
  // Summary table
  addPageBreak(doc);
  addSubtitle(doc, 'Summary of Findings');
  
  const headers = ['Category', 'Status', 'Priority'];
  const rows = [
    ['Performance', getStatusIndicator(analysis.performance.issues.length), getPriority(analysis.performance.issues.length)],
    ['SEO', getStatusIndicator(analysis.seo.issues.length), getPriority(analysis.seo.issues.length)],
    ['Security', getStatusIndicator(analysis.security.issues.length), getPriority(analysis.security.issues.length)],
    ['User Experience', getStatusIndicator(analysis.userExperience.issues.length), getPriority(analysis.userExperience.issues.length)],
    ['Accessibility', getStatusIndicator(analysis.accessibility.issues.length), getPriority(analysis.accessibility.issues.length)]
  ];
  
  addTable(doc, headers, rows);
  
  // Finalize PDF
  return await finalizePDF(doc);
}

// Helper functions for the summary table
function getStatusIndicator(issueCount: number): string {
  if (issueCount >= 3) return 'Needs Improvement';
  if (issueCount >= 1) return 'Moderate';
  return 'Good';
}

function getPriority(issueCount: number): string {
  if (issueCount >= 3) return 'High';
  if (issueCount >= 1) return 'Medium';
  return 'Low';
}

// Main function
async function main() {
  // URL to analyze
  const url = process.env.TEST_URL || 'https://example.com';
  
  try {
    // Run AI analysis
    const analysis = await runAIAnalysis(url);
    
    // Generate PDF
    const pdfBuffer = await generatePDF(analysis, url);
    
    // Save to file
    const outputPath = path.join(outputDir, 'website-analysis.pdf');
    fs.writeFileSync(outputPath, pdfBuffer);
    
    console.log(`PDF generated successfully and saved to: ${outputPath}`);
  } catch (error) {
    console.error('Error in test process:', error);
  }
}

// Run the test
main(); 