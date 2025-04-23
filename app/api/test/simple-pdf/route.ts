import { analyzeContentStrategy, analyzeMarketingStrategy, analyzeTechnicalRecommendations, analyzeWebsiteContent } from "@/lib/ai";
import {
    addList,
    addSpacing,
    addSubtitle,
    addText,
    addTitle,
    createPDFDocument,
    finalizePDF
} from '@/lib/pdf';
import { NextResponse } from "next/server";

// Sample content for testing
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

/**
 * API route for testing individual AI analysis functions
 * 
 * Accepts POST requests with JSON body:
 * {
 *   "analysisType": "website" | "marketing" | "content" | "technical",
 *   "content": "Optional custom content to analyze"
 * }
 */
export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Extract parameters with defaults
    const {
      analysisType = "website",
      content = SAMPLE_CONTENT,
    } = body;

    // Run the appropriate analysis function
    let result;
    let startTime = Date.now();

    try {
      if (analysisType === "website") {
        result = await analyzeWebsiteContent(content);
      } else if (analysisType === "marketing") {
        result = await analyzeMarketingStrategy(content);
      } else if (analysisType === "content") {
        result = await analyzeContentStrategy(content);
      } else if (analysisType === "technical") {
        result = await analyzeTechnicalRecommendations(content);
      } else {
        return NextResponse.json(
          { error: "Invalid analysis type" },
          { status: 400 }
        );
      }

      // Calculate performance metrics
      const duration = Date.now() - startTime;
      
      // Return success response with the analysis result
      return NextResponse.json({
        success: true,
        analysisType,
        duration: `${duration}ms`,
        result,
      });
    } catch (error: any) {
      // Return detailed error for debugging
      return NextResponse.json({
        success: false,
        analysisType,
        error: error.message,
        stack: error.stack,
        duration: `${Date.now() - startTime}ms`,
      }, { status: 500 });
    }
    
  } catch (error: any) {
    console.error("Error in simple PDF test endpoint:", error);
    return NextResponse.json(
      { error: "Failed to process test", details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    console.log("Simple PDF generation test route called");
    
    // Create PDF document
    const doc = createPDFDocument();
    
    // Add content
    addTitle(doc, "Test PDF Document");
    addText(doc, "This is a test PDF document generated to verify PDF generation is working correctly.");
    
    addSpacing(doc);
    addSubtitle(doc, "Test Section");
    addText(doc, "This section demonstrates the PDF generation capabilities.");
    
    addSpacing(doc);
    addSubtitle(doc, "Test List");
    addList(doc, [
      "Item 1: Testing basic functionality",
      "Item 2: Making sure PDF generation works",
      "Item 3: Verifying PDF buffer can be returned properly"
    ]);
    
    // Finalize PDF
    const pdfBuffer = await finalizePDF(doc);
    
    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="test-pdf.pdf"',
      },
    });
    
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF", details: (error as Error).message },
      { status: 500 }
    );
  }
} 