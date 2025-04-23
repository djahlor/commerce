import { createOutputAction } from "@/actions/db/outputs-actions";
import { createPurchaseAction, updatePurchaseStatusAction } from "@/actions/db/purchases-actions";
import { createScrapedDataAction } from "@/actions/db/scraped-data-actions";
import { getSignedUrlAction, uploadPdfStorage } from "@/actions/storage/pdf-storage-actions";
import {
  createBlueprintReport,
  createContentReport,
  createMarketingReport,
  createPersonaReport,
  createSEOReport,
  createTechnicalReport
} from "@/lib/pdf";
import { NextResponse } from "next/server";

// Sample content for testing when not providing URL
const SAMPLE_CONTENT = `
# Example Website Content

## About Us
We are a leading provider of innovative solutions for businesses of all sizes. Our mission is to help our clients succeed through technology and outstanding service.

## Our Products
- Product A: An advanced solution for enterprise clients
- Product B: Perfect for small to medium businesses
- Product C: Our flagship consumer offering

## Testimonials
"This company transformed our business processes." - John Doe, CEO
"The support team is incredible and always ready to help." - Jane Smith, CTO

## Contact
Email: support@example.com
Phone: (555) 123-4567
`;

// Mock data for testing PDF generation
const MOCK_ANALYSIS_DATA = {
  title: "Example Website",
  summary: "A comprehensive business website offering products and services for various businesses.",
  primaryProducts: ["Product A", "Product B", "Product C"],
  targetAudience: "Business owners and decision makers across various industries",
  keyStrengths: ["Clear product offerings", "Strong testimonials", "Easy contact information"],
  improvementAreas: ["Add pricing information", "Include more detailed product descriptions", "Add a call to action"],
  competitiveAdvantages: ["Comprehensive solution offering", "Strong customer testimonials", "Professional appearance"],
  seoConsiderations: ["Add meta descriptions", "Improve keyword density", "Create more content pages"]
};

const MOCK_MARKETING_DATA = {
  overview: "The website provides a solid foundation but needs more strategic marketing elements.",
  targetAudienceSegments: ["Enterprise decision-makers", "SMB owners", "Individual consumers"],
  contentRecommendations: ["Create case studies", "Develop product comparison guides", "Add customer success stories"],
  socialMediaStrategy: "Focus on LinkedIn for B2B and Instagram for B2C with tailored content for each platform.",
  emailMarketingIdeas: ["Product update newsletter", "Industry insights digest", "Special offers campaign"],
  paidAdvertisingRecommendations: ["Google Ads targeting specific business solutions", "LinkedIn sponsored content"],
  conversionOptimizationSuggestions: ["Add clear CTAs", "Simplify contact forms", "Implement live chat"],
  brandMessaging: "Position as an innovative, reliable partner for business transformation",
  nextSteps: ["Develop content calendar", "Implement tracking for key metrics", "Create A/B testing plan"]
};

const MOCK_CONTENT_DATA = {
  overview: "The website needs a more robust content strategy to engage visitors and improve conversions.",
  identifiedContentGaps: ["Detailed product documentation", "Customer success stories", "Educational resources"],
  recommendedContentTypes: ["Blog posts", "Case studies", "Video tutorials", "Infographics"],
  seoKeywords: ["business solutions", "enterprise technology", "small business tools"],
  contentCalendarRecommendations: "Weekly blog posts, monthly case studies, quarterly industry reports",
  contentDistributionSuggestions: ["Email newsletter", "Social media sharing", "Industry publications"],
  contentUpgrades: ["Premium guides", "Templates", "Checklists for download"],
  nextSteps: ["Create content style guide", "Build resource library", "Develop lead magnet strategy"]
};

const MOCK_TECHNICAL_DATA = {
  overview: "The website requires technical improvements to enhance performance and user experience.",
  performanceRecommendations: ["Image optimization", "JavaScript minification", "Implement caching"],
  securityRecommendations: ["Enable HTTPS", "Implement WAF", "Regular security audits"],
  accessibilityImprovements: ["Add alt text to images", "Improve contrast ratios", "Ensure keyboard navigation"],
  mobileOptimizationRecommendations: ["Responsive design improvements", "Touch-friendly navigation", "Reduce load times"],
  websiteArchitectureRecommendations: ["Simplify navigation", "Improve site structure", "Implement breadcrumbs"],
  checkoutImprovements: ["Reduce form fields", "Add progress indicators", "Offer guest checkout"],
  recommendedIntegrations: ["Live chat", "CRM system", "Marketing automation tools"],
  analyticsRecommendations: ["Set up goal tracking", "Implement event tracking", "Create custom dashboards"],
  prioritizedTasks: ["Speed optimization", "Mobile responsiveness", "Security enhancements"]
};

/**
 * Mock API route for testing the PDF generation pipeline with pre-defined data
 * This skips the OpenAI API calls and uses mock data instead
 * 
 * Accepts POST requests with JSON body:
 * {
 *   "tier": "basic" | "standard" | "premium", // Required
 * }
 */
export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Extract parameters with defaults
    const {
      url = "https://example.com",
      tier = "premium", // basic, standard, or premium
    } = body;

    // Create a test purchase record
    const purchaseResult = await createPurchaseAction({
      polarOrderId: `mock-test-${Date.now()}`,
      email: "test@example.com",
      amount: tier === "basic" ? 29 : tier === "standard" ? 49 : 99,
      status: "processing",
      url,
      tier,
    });

    if (!purchaseResult.isSuccess || !purchaseResult.data) {
      return NextResponse.json(
        { error: "Failed to create test purchase", details: purchaseResult.message },
        { status: 500 }
      );
    }

    const purchaseId = purchaseResult.data.id;

    // Create test scraped data
    const scrapedDataResult = await createScrapedDataAction({
      purchaseId,
      url,
      contentType: "markdown",
      scrapedContent: {
        markdown: SAMPLE_CONTENT,
        html: `<div>${SAMPLE_CONTENT}</div>`,
        sourceMethod: "test"
      },
      status: "completed",
    });

    if (!scrapedDataResult.isSuccess || !scrapedDataResult.data) {
      return NextResponse.json(
        { error: "Failed to create test scraped data", details: scrapedDataResult.message },
        { status: 500 }
      );
    }

    // Now manually generate PDFs based on the tier
    const outputs = [];
    let errors = [];

    try {
      // Generate the specific PDFs for this tier
      if (tier === "basic" || tier === "standard" || tier === "premium") {
        // Blueprint Report
        const blueprintPdf = await createBlueprintReport(MOCK_ANALYSIS_DATA, purchaseId);
        const blueprintPath = `blueprint-report.pdf`;
        const blueprintUploadResult = await uploadPdfStorage(blueprintPdf, blueprintPath, purchaseId);
        
        if (blueprintUploadResult.isSuccess && blueprintUploadResult.data) {
          const outputResult = await createOutputAction({
            purchaseId,
            type: "blueprint",
            filePath: blueprintUploadResult.data.filePath,
          });
          
          if (outputResult.isSuccess && outputResult.data) {
            outputs.push(outputResult.data);
          }
        }
      }
      
      if (tier === "standard" || tier === "premium") {
        // SEO Report
        const seoPdf = await createSEOReport(MOCK_ANALYSIS_DATA, purchaseId);
        const seoPath = `seo-report.pdf`;
        const seoUploadResult = await uploadPdfStorage(seoPdf, seoPath, purchaseId);
        
        if (seoUploadResult.isSuccess && seoUploadResult.data) {
          const outputResult = await createOutputAction({
            purchaseId,
            type: "seo",
            filePath: seoUploadResult.data.filePath,
          });
          
          if (outputResult.isSuccess && outputResult.data) {
            outputs.push(outputResult.data);
          }
        }
        
        // Personas Report
        const personasPdf = await createPersonaReport(MOCK_ANALYSIS_DATA, purchaseId);
        const personasPath = `personas-report.pdf`;
        const personasUploadResult = await uploadPdfStorage(personasPdf, personasPath, purchaseId);
        
        if (personasUploadResult.isSuccess && personasUploadResult.data) {
          const outputResult = await createOutputAction({
            purchaseId,
            type: "personas",
            filePath: personasUploadResult.data.filePath,
          });
          
          if (outputResult.isSuccess && outputResult.data) {
            outputs.push(outputResult.data);
          }
        }
      }
      
      if (tier === "premium") {
        // Marketing Report
        const marketingPdf = await createMarketingReport(MOCK_MARKETING_DATA, purchaseId);
        const marketingPath = `marketing-report.pdf`;
        const marketingUploadResult = await uploadPdfStorage(marketingPdf, marketingPath, purchaseId);
        
        if (marketingUploadResult.isSuccess && marketingUploadResult.data) {
          const outputResult = await createOutputAction({
            purchaseId,
            type: "marketing",
            filePath: marketingUploadResult.data.filePath,
          });
          
          if (outputResult.isSuccess && outputResult.data) {
            outputs.push(outputResult.data);
          }
        }
        
        // Content Report
        const contentPdf = await createContentReport(MOCK_CONTENT_DATA, purchaseId);
        const contentPath = `content-report.pdf`;
        const contentUploadResult = await uploadPdfStorage(contentPdf, contentPath, purchaseId);
        
        if (contentUploadResult.isSuccess && contentUploadResult.data) {
          const outputResult = await createOutputAction({
            purchaseId,
            type: "content",
            filePath: contentUploadResult.data.filePath,
          });
          
          if (outputResult.isSuccess && outputResult.data) {
            outputs.push(outputResult.data);
          }
        }
        
        // Technical Report
        const technicalPdf = await createTechnicalReport(MOCK_TECHNICAL_DATA, purchaseId);
        const technicalPath = `technical-report.pdf`;
        const technicalUploadResult = await uploadPdfStorage(technicalPdf, technicalPath, purchaseId);
        
        if (technicalUploadResult.isSuccess && technicalUploadResult.data) {
          const outputResult = await createOutputAction({
            purchaseId,
            type: "technical",
            filePath: technicalUploadResult.data.filePath,
          });
          
          if (outputResult.isSuccess && outputResult.data) {
            outputs.push(outputResult.data);
          }
        }
      }
      
      // Update purchase status to completed
      await updatePurchaseStatusAction(purchaseId, "completed");
      
    } catch (e) {
      console.error("Error generating PDFs:", e);
      errors.push(String(e));
      
      // Update purchase status to failed
      await updatePurchaseStatusAction(purchaseId, "failed");
    }
    
    if (outputs.length === 0) {
      return NextResponse.json(
        { error: "PDF generation failed", details: `Failed to generate any PDFs. Errors: ${errors.join("; ")}` },
        { status: 500 }
      );
    }

    // Generate signed URLs for the outputs
    const signedUrls = await Promise.all(
      outputs.map(async (output) => {
        const urlResult = await getSignedUrlAction(output.filePath);
        return {
          type: output.type,
          path: output.filePath,
          url: urlResult.isSuccess && urlResult.data ? urlResult.data.url : null,
        };
      })
    );

    // Return success response with all the relevant information
    return NextResponse.json({
      success: true,
      message: "PDF generation completed successfully",
      purchaseId,
      outputs,
      signedUrls,
    });
    
  } catch (error) {
    console.error("Error in mock PDF generation test endpoint:", error);
    return NextResponse.json(
      { error: "Failed to process PDF generation test", details: String(error) },
      { status: 500 }
    );
  }
} 