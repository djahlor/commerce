/**
 * PDF generation utilities using PDFKit
 * Provides wrapper functions for common PDF operations and specialized report templates
 */
import PDFDocument from '@react-pdf/pdfkit';
import { Buffer } from 'buffer';

/**
 * Creates a new PDF document with standard settings
 */
export function createPDFDocument(): PDFKit.PDFDocument {
  return new PDFDocument({
    margins: {
      top: 50,
      bottom: 50,
      left: 50,
      right: 50
    },
    info: {
      Title: 'Website Analysis Report',
      Author: 'Commerce AI',
      Subject: 'Website Analysis',
      Keywords: 'ecommerce, analysis, report',
      Creator: 'PDF Generator',
    }
  });
}

/**
 * Adds a title to the PDF document
 */
export function addTitle(doc: PDFKit.PDFDocument, text: string): void {
  doc
    .font('Helvetica-Bold')
    .fontSize(24)
    .text(text, {
      align: 'center'
    });
  
  // Add some space after the title
  doc.moveDown(2);
}

/**
 * Adds a subtitle to the PDF document
 */
export function addSubtitle(doc: PDFKit.PDFDocument, text: string): void {
  doc
    .font('Helvetica-Bold')
    .fontSize(16)
    .text(text);
  
  // Add some space after the subtitle
  doc.moveDown(1);
}

/**
 * Adds regular text to the PDF document
 */
export function addText(doc: PDFKit.PDFDocument, text: string): void {
  doc
    .font('Helvetica')
    .fontSize(12)
    .text(text, {
      align: 'left'
    });
  
  // Add some space after the text
  doc.moveDown(1);
}

/**
 * Adds a bullet list to the PDF document
 */
export function addList(doc: PDFKit.PDFDocument, items: string[]): void {
  items.forEach(item => {
    doc
      .font('Helvetica')
      .fontSize(12)
      .text(`• ${item}`, {
        indent: 20,
        align: 'left'
      });
    
    // Add some space after each list item
    doc.moveDown(0.5);
  });
  
  // Add some additional space after the entire list
  doc.moveDown(0.5);
}

/**
 * Adds vertical spacing to the PDF document
 */
export function addSpacing(doc: PDFKit.PDFDocument, lines: number = 1): void {
  doc.moveDown(lines);
}

/**
 * Adds a table to the PDF document
 */
export function addTable(
  doc: PDFKit.PDFDocument, 
  headers: string[], 
  rows: string[][]
): void {
  const colWidth = 500 / headers.length;
  const tableTop = doc.y;
  let tableBottom = tableTop;

  // Draw headers
  doc
    .font('Helvetica-Bold')
    .fontSize(12);
  
  let currentY = tableTop;
  
  headers.forEach((header, i) => {
    doc.text(header, 50 + (i * colWidth), currentY, {
      width: colWidth,
      align: 'left'
    });
  });
  
  currentY += 20;
  tableBottom = currentY;
  
  // Draw rows
  doc
    .font('Helvetica')
    .fontSize(12);
  
  rows.forEach(row => {
    row.forEach((cell, i) => {
      doc.text(cell, 50 + (i * colWidth), currentY, {
        width: colWidth,
        align: 'left'
      });
      
      // Track the bottom of the table
      const textHeight = doc.heightOfString(cell, { width: colWidth });
      const cellBottom = currentY + textHeight;
      tableBottom = Math.max(tableBottom, cellBottom);
    });
    
    currentY = tableBottom + 10;
    tableBottom = currentY;
  });
  
  // Move to the bottom of the table
  doc.y = tableBottom + 10;
}

/**
 * Adds a page break to the PDF document
 */
export function addPageBreak(doc: PDFKit.PDFDocument): void {
  doc.addPage();
}

/**
 * Finalizes the PDF document and returns it as a Buffer
 */
export async function finalizePDF(doc: PDFKit.PDFDocument): Promise<Buffer> {
  return new Promise<Buffer>((resolve) => {
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.end();
  });
}

/**
 * Creates a Blueprint PDF report
 * @param analysis The website analysis data
 * @param purchaseId The ID of the purchase
 * @returns A Buffer containing the PDF document
 */
export async function createBlueprintReport(analysis: any, purchaseId: string): Promise<Buffer> {
  try {
    // Create a document using our helper function, not directly
    const doc = createPDFDocument();
    
    // Add title and metadata
    addTitle(doc, `Website Blueprint: ${analysis.title}`);
    addSubtitle(doc, `Generated for Purchase ID: ${purchaseId}`);
    
    // Overview section
    addSubtitle(doc, "Website Overview");
    addText(doc, analysis.summary);
    
    // Primary Products
    addSubtitle(doc, "Primary Products/Services");
    addList(doc, analysis.primaryProducts || []);
    
    // Target Audience
    addSubtitle(doc, "Target Audience");
    addText(doc, analysis.targetAudience);
    
    // Key Strengths
    addSubtitle(doc, "Key Strengths");
    addList(doc, analysis.keyStrengths || []);
    
    // Improvement Areas
    addSubtitle(doc, "Areas for Improvement");
    addList(doc, analysis.improvementAreas || []);
    
    // Competitive Advantages
    addSubtitle(doc, "Competitive Advantages");
    addList(doc, analysis.competitiveAdvantages || []);
    
    // SEO Considerations
    addSubtitle(doc, "SEO Considerations");
    addList(doc, analysis.seoConsiderations || []);
    
    // Finalize and return the PDF
    return await finalizePDF(doc);
  } catch (error: any) {
    console.error("Error creating blueprint report:", error);
    throw new Error(`Failed to generate blueprint report: ${error.message}`);
  }
}

/**
 * Creates a Marketing Strategy PDF report
 * @param analysis The marketing strategy analysis data
 * @param purchaseId The ID of the purchase
 * @returns A Buffer containing the PDF document
 */
export async function createMarketingReport(analysis: any, purchaseId: string): Promise<Buffer> {
  try {
    const doc = createPDFDocument();
    
    // Add title and metadata
    addTitle(doc, "Marketing Strategy Report");
    addSubtitle(doc, `Generated for Purchase ID: ${purchaseId}`);
    
    // Overview section
    addSubtitle(doc, "Marketing Strategy Overview");
    addText(doc, analysis.overview);
    
    // Target Audience
    addSubtitle(doc, "Target Audience Analysis");
    
    if (Array.isArray(analysis.targetAudience)) {
      analysis.targetAudience.forEach((segment: any, index: number) => {
        addSubtitle(doc, `Segment ${index + 1}: ${segment.segment}`);
        addText(doc, segment.description);
        addSubtitle(doc, "Recommended Channels");
        addList(doc, segment.channels);
      });
    }
    
    // Content Recommendations
    addSubtitle(doc, "Content Marketing Recommendations");
    addList(doc, analysis.contentRecommendations || []);
    
    // Social Media Strategy
    addSubtitle(doc, "Social Media Strategy");
    addList(doc, analysis.socialMediaStrategy || []);
    
    // Email Marketing
    addSubtitle(doc, "Email Marketing");
    addList(doc, analysis.emailMarketing || []);
    
    // Paid Advertising
    addSubtitle(doc, "Paid Advertising");
    addList(doc, analysis.paidAdvertising || []);
    
    // Conversion Optimization
    addSubtitle(doc, "Conversion Optimization");
    addList(doc, analysis.conversionOptimization || []);
    
    // Brand Messaging
    addSubtitle(doc, "Brand Messaging");
    addText(doc, analysis.brandMessaging);
    
    // Next Steps
    addSubtitle(doc, "Next Steps");
    addList(doc, analysis.nextSteps || []);
    
    return await finalizePDF(doc);
  } catch (error: any) {
    console.error("Error creating marketing report:", error);
    throw new Error(`Failed to generate marketing report: ${error.message}`);
  }
}

/**
 * Creates a Content Strategy PDF report
 * @param analysis The content strategy analysis data
 * @param purchaseId The ID of the purchase
 * @returns A Buffer containing the PDF document
 */
export async function createContentReport(analysis: any, purchaseId: string): Promise<Buffer> {
  try {
    const doc = createPDFDocument();
    
    // Add title and metadata
    addTitle(doc, "Content Strategy Report");
    addSubtitle(doc, `Generated for Purchase ID: ${purchaseId}`);
    
    // Overview section
    addSubtitle(doc, "Content Strategy Overview");
    addText(doc, analysis.overview);
    
    // Content Gaps
    addSubtitle(doc, "Content Gaps and Opportunities");
    addList(doc, analysis.contentGaps || []);
    
    // Content Types
    addSubtitle(doc, "Recommended Content Types");
    
    if (Array.isArray(analysis.contentTypes)) {
      analysis.contentTypes.forEach((type: any, index: number) => {
        addSubtitle(doc, `${type.type}`);
        addText(doc, `Purpose: ${type.purpose}`);
        addSubtitle(doc, "Suggested Topics");
        addList(doc, type.topics);
        addSpacing(doc);
      });
    }
    
    // SEO Keywords
    addSubtitle(doc, "SEO Keywords to Target");
    addList(doc, analysis.seoKeywords || []);
    
    // Content Calendar
    addSubtitle(doc, "Content Calendar Recommendations");
    addList(doc, analysis.contentCalendar || []);
    
    // Content Distribution
    addSubtitle(doc, "Content Distribution Channels");
    addList(doc, analysis.contentDistribution || []);
    
    // Content Upgrades
    addSubtitle(doc, "Content Upgrade Recommendations");
    addList(doc, analysis.contentUpgrades || []);
    
    // Next Steps
    addSubtitle(doc, "Next Steps");
    addList(doc, analysis.nextSteps || []);
    
    return await finalizePDF(doc);
  } catch (error: any) {
    console.error("Error creating content report:", error);
    throw new Error(`Failed to generate content report: ${error.message}`);
  }
}

/**
 * Creates a Technical Recommendations PDF report
 * @param analysis The technical recommendations analysis data
 * @param purchaseId The ID of the purchase
 * @returns A Buffer containing the PDF document
 */
export async function createTechnicalReport(analysis: any, purchaseId: string): Promise<Buffer> {
  try {
    const doc = createPDFDocument();
    
    // Add title and metadata
    addTitle(doc, "Technical Recommendations Report");
    addSubtitle(doc, `Generated for Purchase ID: ${purchaseId}`);
    
    // Overview section
    addSubtitle(doc, "Technical Overview");
    addText(doc, analysis.overview);
    
    // Performance
    addSubtitle(doc, "Performance Optimization");
    addList(doc, analysis.performance || []);
    
    // Security
    addSubtitle(doc, "Security Recommendations");
    addList(doc, analysis.security || []);
    
    // Accessibility
    addSubtitle(doc, "Accessibility Improvements");
    addList(doc, analysis.accessibility || []);
    
    // Mobile Friendliness
    addSubtitle(doc, "Mobile Optimization");
    addList(doc, analysis.mobileFriendliness || []);
    
    // Architecture
    addSubtitle(doc, "Site Architecture");
    addList(doc, analysis.architecture || []);
    
    // Checkout Process
    addSubtitle(doc, "Checkout Process Optimization");
    addList(doc, analysis.checkout || []);
    
    // Integrations
    addSubtitle(doc, "Recommended Integrations");
    addList(doc, analysis.integrations || []);
    
    // Analytics
    addSubtitle(doc, "Analytics & Tracking");
    addList(doc, analysis.analytics || []);
    
    // Next Steps
    addSubtitle(doc, "Next Steps");
    addList(doc, analysis.nextSteps || []);
    
    return await finalizePDF(doc);
  } catch (error: any) {
    console.error("Error creating technical report:", error);
    throw new Error(`Failed to generate technical report: ${error.message}`);
  }
}

/**
 * Creates a Persona PDF report
 * Placeholder - implementation will come later
 */
export async function createPersonaReport(analysis: any, purchaseId: string): Promise<Buffer> {
  try {
    const doc = createPDFDocument();
    
    // Add title and metadata
    addTitle(doc, "Customer Persona Report");
    addSubtitle(doc, `Generated for Purchase ID: ${purchaseId}`);
    
    // Placeholder content
    addText(doc, "This is a placeholder for the customer persona report. The full implementation will come in a future update.");
    
    return await finalizePDF(doc);
  } catch (error: any) {
    console.error("Error creating persona report:", error);
    throw new Error(`Failed to generate persona report: ${error.message}`);
  }
}

/**
 * Creates an SEO Analysis PDF report
 * Placeholder - implementation will come later
 */
export async function createSEOReport(analysis: any, purchaseId: string): Promise<Buffer> {
  try {
    const doc = createPDFDocument();
    
    // Add title and metadata
    addTitle(doc, "SEO Analysis Report");
    addSubtitle(doc, `Generated for Purchase ID: ${purchaseId}`);
    
    // Placeholder content
    addText(doc, "This is a placeholder for the SEO analysis report. The full implementation will come in a future update.");
    
    return await finalizePDF(doc);
  } catch (error: any) {
    console.error("Error creating SEO report:", error);
    throw new Error(`Failed to generate SEO report: ${error.message}`);
  }
} 