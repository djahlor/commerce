/**
 * PDF generation utilities using PDFKit
 * Provides wrapper functions for common PDF operations and specialized report templates
 */

import * as fs from 'fs';
import type { ActionState } from '../types/server-action-types';
// Import PDFKit correctly for TypeScript
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFDocument = require('pdfkit');

// Constants for styling
const COLORS = {
  primary: '#1E40AF', // Blue-800
  secondary: '#1F2937', // Gray-800
  accent: '#3B82F6', // Blue-500
  light: '#6B7280', // Gray-500
  background: '#F9FAFB', // Gray-50
  tertiary: '#fbbc04',
  text: '#202124',
  lightText: '#5f6368',
  lightGray: '#f8f9fa',
  darkGray: '#dadce0',
};

// Default document options
const DEFAULT_DOC_OPTIONS = {
  margins: {
    top: 72,
    bottom: 72,
    left: 72,
    right: 72,
  },
  size: 'A4',
};

type TableData = {
  headers: string[];
  rows: (string | number)[][];
};

type DocumentOptions = {
  margins?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  size?: string;
  info?: {
    Title?: string;
    Author?: string;
    Subject?: string;
    Keywords?: string;
  };
};

/**
 * Creates a new PDF document with standardized settings
 */
export function createPDFDocument(options: DocumentOptions = {}): ReturnType<typeof PDFDocument> {
  const docOptions = {
    ...DEFAULT_DOC_OPTIONS,
    ...options,
  };

  const doc = new PDFDocument(docOptions);
  
  // Set default font
  doc.font('Helvetica');
  doc.fontSize(12);
  doc.fillColor(COLORS.text);
  
  return doc;
}

/**
 * Adds a header to the PDF document
 */
export function addHeader(doc: ReturnType<typeof PDFDocument>, title: string, subtitle?: string): void {
  const startY = doc.y;
  
  // Add title
  doc.fontSize(24)
     .fillColor(COLORS.primary)
     .text(title, { align: 'center' });
  
  // Add subtitle if provided
  if (subtitle) {
    doc.fontSize(14)
       .fillColor(COLORS.lightText)
       .text(subtitle, { align: 'center' });
  }
  
  doc.moveDown(2);
  addHorizontalLine(doc);
  doc.moveDown(1);
}

/**
 * Adds a footer with page number to the document
 */
export function addFooter(doc: ReturnType<typeof PDFDocument>, text = ''): void {
  const bottomOfPage = doc.page.height - doc.page.margins.bottom;
  
  // Save the current position
  const currentY = doc.y;
  
  // Move to the bottom of the page
  doc.y = bottomOfPage - 20;
  
  // Add horizontal line
  addHorizontalLine(doc);
  
  // Add footer text and page number
  doc.fontSize(10)
     .fillColor(COLORS.lightText)
     .text(
       `${text} | Page ${doc.bufferedPageRange().start + 1}`,
       doc.page.margins.left,
       doc.y + 5,
       { align: 'center', width: doc.page.width - doc.page.margins.left - doc.page.margins.right }
     );
  
  // Restore the original position
  doc.y = currentY;
}

/**
 * Adds a horizontal line to the document
 */
export function addHorizontalLine(doc: ReturnType<typeof PDFDocument>, options = {}): void {
  const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  
  doc.moveTo(doc.page.margins.left, doc.y)
     .lineTo(doc.page.margins.left + width, doc.y)
     .strokeColor(COLORS.darkGray)
     .stroke();
  
  doc.moveDown(0.5);
}

/**
 * Adds a section with title and content
 */
export function addSection(doc: ReturnType<typeof PDFDocument>, title: string, content: string): void {
  // Add section title
  doc.fontSize(16)
     .fillColor(COLORS.primary)
     .text(title, { continued: false });
  
  doc.moveDown(0.5);
  
  // Add section content
  doc.fontSize(12)
     .fillColor(COLORS.text)
     .text(content, { align: 'left' });
  
  doc.moveDown(1);
}

/**
 * Adds a table to the document
 */
export function addTable(doc: ReturnType<typeof PDFDocument>, data: TableData): void {
  const { headers, rows } = data;
  
  // Calculate column width (equal distribution)
  const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const colWidth = width / headers.length;
  
  let startX = doc.page.margins.left;
  let startY = doc.y;
  
  // Draw header row
  doc.fontSize(12)
     .fillColor(COLORS.primary);
  
  headers.forEach((header, i) => {
    doc.text(header, startX + colWidth * i, startY, {
      width: colWidth,
      align: 'left',
    });
  });
  
  doc.moveDown();
  startY = doc.y;
  
  // Draw header separator
  doc.moveTo(doc.page.margins.left, startY - 10)
     .lineTo(doc.page.margins.left + width, startY - 10)
     .strokeColor(COLORS.darkGray)
     .stroke();
  
  // Draw rows
  doc.fillColor(COLORS.text);
  
  rows.forEach((row, rowIndex) => {
    // Alternate row background colors
    if (rowIndex % 2 === 0) {
      doc.rect(
        doc.page.margins.left,
        startY,
        width,
        20
      ).fill(COLORS.lightGray);
    }
    
    row.forEach((cell, cellIndex) => {
      doc.text(
        cell.toString(),
        startX + colWidth * cellIndex,
        startY + 5,
        {
          width: colWidth,
          align: 'left',
        }
      );
    });
    
    startY += 25;
    
    // Check if we need a new page
    if (startY > doc.page.height - doc.page.margins.bottom - 50) {
      doc.addPage();
      startY = doc.page.margins.top;
    }
  });
  
  doc.y = startY + 10;
}

/**
 * Adds an image to the document with specified dimensions
 */
export function addImage(doc: ReturnType<typeof PDFDocument>, imagePath: string, options: { width?: number; height?: number; align?: 'center' | 'right' } = {}): void {
  try {
    if (options.width || options.height) {
      // PDFKit expects x and y coordinates for positioning
      // Using undefined means it will use current cursor position
      const x = undefined; 
      const y = undefined;
      
      doc.image(imagePath, x, y, {
        fit: [options.width || 100, options.height || 100],
        align: options.align || 'center'
      });
    } else {
      const x = undefined;
      const y = undefined;
      
      doc.image(imagePath, x, y, {
        align: options.align || 'center'
      });
    }
    
    doc.moveDown();
  } catch (error) {
    console.error(`Error adding image from ${imagePath}:`, error);
    doc.text(`[Image could not be loaded: ${imagePath}]`);
    doc.moveDown();
  }
}

/**
 * Adds a bulleted or numbered list to the document
 */
export function addList(doc: ReturnType<typeof PDFDocument>, items: string[], numbered = false): void {
  items.forEach((item, index) => {
    const prefix = numbered ? `${index + 1}. ` : '• ';
    doc.text(prefix + item);
    doc.moveDown(0.5);
  });
  
  doc.moveDown(0.5);
}

/**
 * Adds a placeholder for a chart or complex visual
 * In a real implementation, this would use a charting library
 */
export function addChartPlaceholder(doc: ReturnType<typeof PDFDocument>, title: string, description: string): void {
  // Create a bordered box for the chart
  const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const height = 200;
  
  doc.rect(
    doc.page.margins.left,
    doc.y,
    width,
    height
  )
  .strokeColor(COLORS.darkGray)
  .stroke();
  
  // Add title
  doc.fontSize(14)
     .fillColor(COLORS.primary)
     .text(title, doc.page.margins.left + 10, doc.y - height + 15, { width: width - 20 });
  
  // Add description
  doc.fontSize(10)
     .fillColor(COLORS.lightText)
     .text(description, doc.page.margins.left + 10, doc.y - height + 40, { width: width - 20 });
  
  // Move position past the chart
  doc.y += 20;
}

/**
 * Saves the PDF document to a file
 */
export async function savePDF(doc: ReturnType<typeof PDFDocument>, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Create a write stream
    const stream = fs.createWriteStream(outputPath);
    
    // Pipe the PDF to the file
    doc.pipe(stream);
    
    // When the document is finalized, close the stream
    doc.end();
    
    // Handle stream events
    stream.on('finish', () => {
      resolve();
    });
    
    stream.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Generates a buffer containing the PDF data
 */
export async function generatePDFBuffer(doc: ReturnType<typeof PDFDocument>): Promise<Buffer> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    
    // Collect data chunks
    doc.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });
    
    // Finalize and resolve with the complete buffer
    doc.on('end', () => {
      const result = Buffer.concat(chunks);
      resolve(result);
    });
    
    // End the document to trigger the 'end' event
    doc.end();
  });
}

/**
 * Creates a blueprint report based on provided data
 */
export async function createBlueprintReport(
  data: any,
  purchaseId?: string,
  outputPath?: string
): Promise<ActionState<{ buffer: Buffer; filePath?: string }>> {
  try {
    // Create a document
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 60, right: 60 },
      info: {
        Title: 'Website Blueprint',
        Author: 'Generated by Commerce',
      },
    });

    // Buffer to store PDF
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    
    // Add title and content
    addHeader(doc, 'Website Blueprint');
    addSection(doc, 'Overview', data.overview || 'No overview provided');

    // Add sections based on data
    if (data.audience) {
      addSection(doc, 'Target Audience', data.audience);
    }
    
    if (data.features) {
      addSection(doc, 'Key Features', data.features);
    }
    
    if (data.pages) {
      addSection(doc, 'Page Structure', data.pages);
    }
    
    if (data.design) {
      addSection(doc, 'Design Elements', data.design);
    }
    
    if (data.technology) {
      addSection(doc, 'Technology Stack', data.technology);
    }
    
    if (data.nextSteps) {
      addSection(doc, 'Next Steps', data.nextSteps);
    }

    // Add footer
    addFooter(doc);
    
    // Finalize the PDF
    doc.end();
    
    // Return the PDF as a buffer
    return new Promise<ActionState<{ buffer: Buffer; filePath?: string }>>((resolve) => {
      doc.on('end', async () => {
        const buffer = Buffer.concat(chunks);
        
        // If outputPath is provided, write to file
        if (outputPath) {
          try {
            await fs.promises.writeFile(outputPath, buffer);
            resolve({
              isSuccess: true,
              message: 'Blueprint report generated and saved successfully',
              data: { buffer, filePath: outputPath }
            });
          } catch (error) {
            console.error('Error writing PDF to file:', error);
            resolve({
              isSuccess: true,
              message: 'Blueprint report generated but could not be saved to file',
              data: { buffer }
            });
          }
        } else {
          resolve({
            isSuccess: true,
            message: 'Blueprint report generated successfully',
            data: { buffer }
          });
        }
      });
    });
  } catch (error) {
    console.error('Error generating blueprint report:', error);
    return {
      isSuccess: false,
      message: `Failed to generate blueprint report: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Creates a persona report based on provided data
 */
export async function createPersonaReport(
  data: any,
  purchaseId?: string,
  outputPath?: string
): Promise<ActionState<{ buffer: Buffer; filePath?: string }>> {
  try {
    // Create a document
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 60, right: 60 },
      info: {
        Title: 'Customer Persona',
        Author: 'Generated by Commerce',
      },
    });

    // Buffer to store PDF
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    
    // Add title
    addHeader(doc, 'Customer Persona');
    
    // Add persona overview
    if (data.name) {
      doc.fontSize(16).font('Helvetica-Bold').text(data.name, { align: 'center' });
      doc.moveDown();
    }
    
    // Add demographic information
    addSection(doc, 'Demographics', data.demographics || 'No demographic information provided');
    
    // Add goals and frustrations
    if (data.goals) {
      addSection(doc, 'Goals', data.goals);
    }
    
    if (data.frustrations) {
      addSection(doc, 'Pain Points', data.frustrations);
    }
    
    // Add shopping behavior
    if (data.shoppingBehavior) {
      addSection(doc, 'Shopping Behavior', data.shoppingBehavior);
    }
    
    // Add marketing channels
    if (data.marketingChannels) {
      addSection(doc, 'Marketing Channels', data.marketingChannels);
    }
    
    // Add message examples
    if (data.messageExamples) {
      addSection(doc, 'Messaging Examples', data.messageExamples);
    }

    // Add footer
    addFooter(doc);
    
    // Finalize the PDF
    doc.end();
    
    // Return the PDF as a buffer
    return new Promise<ActionState<{ buffer: Buffer; filePath?: string }>>((resolve) => {
      doc.on('end', async () => {
        const buffer = Buffer.concat(chunks);
        
        // If outputPath is provided, write to file
        if (outputPath) {
          try {
            await fs.promises.writeFile(outputPath, buffer);
            resolve({
              isSuccess: true,
              message: 'Persona report generated and saved successfully',
              data: { buffer, filePath: outputPath }
            });
          } catch (error) {
            console.error('Error writing PDF to file:', error);
            resolve({
              isSuccess: true,
              message: 'Persona report generated but could not be saved to file',
              data: { buffer }
            });
          }
        } else {
          resolve({
            isSuccess: true,
            message: 'Persona report generated successfully',
            data: { buffer }
          });
        }
      });
    });
  } catch (error) {
    console.error('Error generating persona report:', error);
    return {
      isSuccess: false,
      message: `Failed to generate persona report: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Creates an SEO report based on provided data
 */
export async function createSEOReport(
  data: any,
  purchaseId?: string,
  outputPath?: string
): Promise<ActionState<{ buffer: Buffer; filePath?: string }>> {
  try {
    // Create a document
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 60, right: 60 },
      info: {
        Title: 'SEO Report',
        Author: 'Generated by Commerce',
      },
    });

    // Buffer to store PDF
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    
    // Add title
    addHeader(doc, 'SEO Strategy Report');
    
    // Add overview
    addSection(doc, 'Overview', data.overview || 'No overview provided');
    
    // Add keyword analysis
    if (data.keywords) {
      addSection(doc, 'Keyword Analysis', data.keywords);
    }
    
    // Add on-page recommendations
    if (data.onPageSEO) {
      addSection(doc, 'On-Page SEO Recommendations', data.onPageSEO);
    }
    
    // Add content strategy
    if (data.contentStrategy) {
      addSection(doc, 'Content Strategy', data.contentStrategy);
    }
    
    // Add technical recommendations
    if (data.technicalSEO) {
      addSection(doc, 'Technical SEO Recommendations', data.technicalSEO);
    }
    
    // Add measurement and tracking
    if (data.measurement) {
      addSection(doc, 'Measurement & Tracking', data.measurement);
    }
    
    // Add next steps
    if (data.nextSteps) {
      addSection(doc, 'Next Steps', data.nextSteps);
    }

    // Add footer
    addFooter(doc);
    
    // Finalize the PDF
    doc.end();
    
    // Return the PDF as a buffer
    return new Promise<ActionState<{ buffer: Buffer; filePath?: string }>>((resolve) => {
      doc.on('end', async () => {
        const buffer = Buffer.concat(chunks);
        
        // If outputPath is provided, write to file
        if (outputPath) {
          try {
            await fs.promises.writeFile(outputPath, buffer);
            resolve({
              isSuccess: true,
              message: 'SEO report generated and saved successfully',
              data: { buffer, filePath: outputPath }
            });
          } catch (error) {
            console.error('Error writing PDF to file:', error);
            resolve({
              isSuccess: true,
              message: 'SEO report generated but could not be saved to file',
              data: { buffer }
            });
          }
        } else {
          resolve({
            isSuccess: true,
            message: 'SEO report generated successfully',
            data: { buffer }
          });
        }
      });
    });
  } catch (error) {
    console.error('Error generating SEO report:', error);
    return {
      isSuccess: false,
      message: `Failed to generate SEO report: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Creates a marketing strategy report based on provided data
 */
export async function createMarketingReport(
  data: any,
  purchaseId?: string,
  outputPath?: string
): Promise<ActionState<{ buffer: Buffer; filePath?: string }>> {
  try {
    // Create a document
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 60, right: 60 },
      info: {
        Title: 'Marketing Strategy Report',
        Author: 'Generated by Commerce',
      },
    });

    // Buffer to store PDF
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    
    // Add title
    addHeader(doc, 'Marketing Strategy Report');
    
    // Add overview
    addSection(doc, 'Overview', data.overview || 'No overview provided');
    
    // Add target audience
    if (data.targetAudience && Array.isArray(data.targetAudience)) {
      addSection(doc, 'Target Audience', 'The following customer segments have been identified:');
      
      data.targetAudience.forEach((audience: any, index: number) => {
        doc.font('Helvetica-Bold').text(`Segment ${index + 1}: ${audience.segment || 'Unnamed Segment'}`);
        doc.font('Helvetica').text(`Description: ${audience.description || 'No description provided'}`);
        
        if (audience.channels && Array.isArray(audience.channels)) {
          doc.text('Recommended Channels:');
          addList(doc, audience.channels);
        }
        
        doc.moveDown();
      });
    }
    
    // Add content recommendations
    if (data.contentRecommendations) {
      addSection(doc, 'Content Marketing Recommendations', '');
      addList(doc, data.contentRecommendations);
    }
    
    // Add social media strategy
    if (data.socialMediaStrategy) {
      addSection(doc, 'Social Media Strategy', '');
      addList(doc, data.socialMediaStrategy);
    }
    
    // Add email marketing
    if (data.emailMarketing) {
      addSection(doc, 'Email Marketing Campaigns', '');
      addList(doc, data.emailMarketing);
    }
    
    // Add paid advertising
    if (data.paidAdvertising) {
      addSection(doc, 'Paid Advertising Recommendations', '');
      addList(doc, data.paidAdvertising);
    }
    
    // Add conversion optimization
    if (data.conversionOptimization) {
      addSection(doc, 'Conversion Rate Optimization', '');
      addList(doc, data.conversionOptimization);
    }
    
    // Add brand messaging
    if (data.brandMessaging) {
      addSection(doc, 'Brand Messaging', data.brandMessaging);
    }
    
    // Add next steps
    if (data.nextSteps) {
      addSection(doc, 'Implementation Plan', '');
      addList(doc, data.nextSteps, true);
    }

    // Add footer
    addFooter(doc);
    
    // Finalize the PDF
    doc.end();
    
    // Return the buffer
    return new Promise((resolve) => {
      doc.on('end', () => {
        const buffer = Buffer.concat(chunks);
        
        // Save to file if outputPath is provided
        if (outputPath) {
          savePDF(doc, outputPath)
            .then(() => {
              resolve({
                isSuccess: true,
                message: "Marketing report generated successfully",
                data: {
                  buffer,
                  filePath: outputPath
                }
              });
            })
            .catch((err) => {
              console.error('Error saving marketing report:', err);
              resolve({
                isSuccess: true,
                message: "Marketing report generated but could not be saved to file",
                data: {
                  buffer
                }
              });
            });
        } else {
          resolve({
            isSuccess: true,
            message: "Marketing report generated successfully",
            data: {
              buffer
            }
          });
        }
      });
    });
  } catch (error) {
    console.error('Error creating marketing report:', error);
    return {
      isSuccess: false,
      message: `Failed to generate marketing report: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Creates a content strategy report based on provided data
 */
export async function createContentReport(
  data: any,
  purchaseId?: string,
  outputPath?: string
): Promise<ActionState<{ buffer: Buffer; filePath?: string }>> {
  try {
    // Create a document
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 60, right: 60 },
      info: {
        Title: 'Content Strategy Report',
        Author: 'Generated by Commerce',
      },
    });

    // Buffer to store PDF
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    
    // Add title
    addHeader(doc, 'Content Strategy Report');
    
    // Add overview
    addSection(doc, 'Overview', data.overview || 'No overview provided');
    
    // Add content gaps
    if (data.contentGaps) {
      addSection(doc, 'Identified Content Gaps', '');
      addList(doc, data.contentGaps);
    }
    
    // Add content types
    if (data.contentTypes && Array.isArray(data.contentTypes)) {
      addSection(doc, 'Recommended Content Types', 'The following content types are recommended:');
      
      data.contentTypes.forEach((contentType: any, index: number) => {
        doc.font('Helvetica-Bold').text(`${index + 1}. ${contentType.type || 'Unnamed Type'}`);
        doc.font('Helvetica').text(`Purpose: ${contentType.purpose || 'No purpose provided'}`);
        
        if (contentType.topics && Array.isArray(contentType.topics)) {
          doc.text('Suggested Topics:');
          addList(doc, contentType.topics);
        }
        
        doc.moveDown();
      });
    }
    
    // Add SEO keywords
    if (data.seoKeywords) {
      addSection(doc, 'SEO Keywords to Target', '');
      addList(doc, data.seoKeywords);
    }
    
    // Add content calendar
    if (data.contentCalendar) {
      addSection(doc, 'Content Calendar Recommendations', '');
      addList(doc, data.contentCalendar);
    }
    
    // Add content distribution
    if (data.contentDistribution) {
      addSection(doc, 'Content Distribution Strategy', '');
      addList(doc, data.contentDistribution);
    }
    
    // Add content upgrades
    if (data.contentUpgrades) {
      addSection(doc, 'Recommendations for Existing Content', '');
      addList(doc, data.contentUpgrades);
    }
    
    // Add next steps
    if (data.nextSteps) {
      addSection(doc, 'Implementation Plan', '');
      addList(doc, data.nextSteps, true);
    }

    // Add footer
    addFooter(doc);
    
    // Finalize the PDF
    doc.end();
    
    // Return the buffer
    return new Promise((resolve) => {
      doc.on('end', () => {
        const buffer = Buffer.concat(chunks);
        
        // Save to file if outputPath is provided
        if (outputPath) {
          savePDF(doc, outputPath)
            .then(() => {
              resolve({
                isSuccess: true,
                message: "Content report generated successfully",
                data: {
                  buffer,
                  filePath: outputPath
                }
              });
            })
            .catch((err) => {
              console.error('Error saving content report:', err);
              resolve({
                isSuccess: true,
                message: "Content report generated but could not be saved to file",
                data: {
                  buffer
                }
              });
            });
        } else {
          resolve({
            isSuccess: true,
            message: "Content report generated successfully",
            data: {
              buffer
            }
          });
        }
      });
    });
  } catch (error) {
    console.error('Error creating content report:', error);
    return {
      isSuccess: false,
      message: `Failed to generate content report: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Creates a technical recommendations report based on provided data
 */
export async function createTechnicalReport(
  data: any,
  purchaseId?: string,
  outputPath?: string
): Promise<ActionState<{ buffer: Buffer; filePath?: string }>> {
  try {
    // Create a document
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 60, right: 60 },
      info: {
        Title: 'Technical Recommendations Report',
        Author: 'Generated by Commerce',
      },
    });

    // Buffer to store PDF
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    
    // Add title
    addHeader(doc, 'Technical Recommendations Report');
    
    // Add overview
    addSection(doc, 'Overview', data.overview || 'No overview provided');
    
    // Add performance recommendations
    if (data.performance) {
      addSection(doc, 'Performance Optimization', '');
      addList(doc, data.performance);
    }
    
    // Add security recommendations
    if (data.security) {
      addSection(doc, 'Security Recommendations', '');
      addList(doc, data.security);
    }
    
    // Add accessibility recommendations
    if (data.accessibility) {
      addSection(doc, 'Accessibility Improvements', '');
      addList(doc, data.accessibility);
    }
    
    // Add mobile friendliness
    if (data.mobileFriendliness) {
      addSection(doc, 'Mobile Optimization', '');
      addList(doc, data.mobileFriendliness);
    }
    
    // Add architecture recommendations
    if (data.architecture) {
      addSection(doc, 'Website Architecture', '');
      addList(doc, data.architecture);
    }
    
    // Add checkout improvements
    if (data.checkout) {
      addSection(doc, 'Checkout Process Improvements', '');
      addList(doc, data.checkout);
    }
    
    // Add integration recommendations
    if (data.integrations) {
      addSection(doc, 'Recommended Integrations', '');
      addList(doc, data.integrations);
    }
    
    // Add analytics recommendations
    if (data.analytics) {
      addSection(doc, 'Analytics & Tracking', '');
      addList(doc, data.analytics);
    }
    
    // Add next steps
    if (data.nextSteps) {
      addSection(doc, 'Implementation Priorities', '');
      addList(doc, data.nextSteps, true);
    }

    // Add footer
    addFooter(doc);
    
    // Finalize the PDF
    doc.end();
    
    // Return the buffer
    return new Promise((resolve) => {
      doc.on('end', () => {
        const buffer = Buffer.concat(chunks);
        
        // Save to file if outputPath is provided
        if (outputPath) {
          savePDF(doc, outputPath)
            .then(() => {
              resolve({
                isSuccess: true,
                message: "Technical report generated successfully",
                data: {
                  buffer,
                  filePath: outputPath
                }
              });
            })
            .catch((err) => {
              console.error('Error saving technical report:', err);
              resolve({
                isSuccess: true,
                message: "Technical report generated but could not be saved to file",
                data: {
                  buffer
                }
              });
            });
        } else {
          resolve({
            isSuccess: true,
            message: "Technical report generated successfully",
            data: {
              buffer
            }
          });
        }
      });
    });
  } catch (error) {
    console.error('Error creating technical report:', error);
    return {
      isSuccess: false,
      message: `Failed to generate technical report: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

export default {
  createPDFDocument,
  addHeader,
  addFooter,
  addHorizontalLine,
  addSection,
  addTable,
  addImage,
  addList,
  addChartPlaceholder,
  savePDF,
  generatePDFBuffer,
  createBlueprintReport,
  createPersonaReport,
  createSEOReport,
  createMarketingReport,
  createContentReport,
  createTechnicalReport
}; 