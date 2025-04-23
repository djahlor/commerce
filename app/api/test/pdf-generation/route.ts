import {
    addList,
    addSpacing,
    addSubtitle,
    addText,
    addTitle,
    createPDFDocument,
    finalizePDF
} from '@/lib/pdf';
import { SAMPLE_CONTENT } from '@/lib/test-data';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    console.log("PDF generation test route called");
    const startTime = performance.now();
    
    // Get parameters from request (tier and createTestData flag)
    const data = await request.json();
    const { tier = 'basic' } = data;
    
    console.log(`Creating PDF for tier: ${tier}`);
    
    // Create PDF document
    const doc = createPDFDocument();
    
    // Add content
    addTitle(doc, `Test PDF Document - ${tier.toUpperCase()} Tier`);
    addText(doc, "This is a test PDF document generated to verify PDF generation is working correctly.");
    
    addSubtitle(doc, "Sample Content");
    addText(doc, "Below is some sample content that would typically come from AI analysis:");
    
    addSpacing(doc);
    addSubtitle(doc, "Website Analysis");
    addText(doc, SAMPLE_CONTENT.websiteAnalysis.overview);
    
    addSpacing(doc);
    addSubtitle(doc, "Key Strengths");
    addList(doc, SAMPLE_CONTENT.websiteAnalysis.strengths);
    
    addSpacing(doc);
    addSubtitle(doc, "Improvement Areas");
    addList(doc, SAMPLE_CONTENT.websiteAnalysis.weaknesses);
    
    // Finalize PDF
    const pdfBuffer = await finalizePDF(doc);
    
    const endTime = performance.now();
    console.log(`PDF generated in ${Math.round(endTime - startTime)}ms`);
    
    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="test-pdf-${tier}.pdf"`,
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