'use server';

import { analyzeContentStrategy, analyzeMarketingStrategy, analyzeTechnicalRecommendations, analyzeWebsiteContent } from '@/lib/ai';
import { createBlueprintReport, createContentReport, createMarketingReport, createPersonaReport, createSEOReport, createTechnicalReport } from '@/lib/pdf';
import { ActionState } from '@/types';
import { createOutputAction } from './db/outputs-actions';
import { getPurchaseByIdAction, updatePurchaseStatusAction } from './db/purchases-actions';
import { getScrapedDataByPurchaseIdAction } from './db/scraped-data-actions';
import { sendDownloadEmailAction } from './email-actions';
import { createSignedUrl, uploadPdfStorage } from './storage/pdf-storage-actions';

// PDF types that can be generated for different tiers
export type PDFType = 'blueprint' | 'personas' | 'seo' | 'marketing' | 'content' | 'technical';

// Maximum number of retries for different operations
const MAX_AI_RETRIES = 2;
const MAX_PDF_RETRIES = 1;
const MAX_UPLOAD_RETRIES = 2;

/**
 * Core PDF generation action that orchestrates the entire flow:
 * 1. Load purchase and scraped data
 * 2. Generate appropriate PDF(s) based on tier
 * 3. Store PDFs in Supabase Storage
 * 4. Create output records
 * 5. Update purchase status
 * 6. Send email with download links
 * 
 * @param purchaseId The ID of the purchase to generate PDFs for
 * @param tier The tier of the purchase (determines which PDFs to generate)
 * @param types Optional array of specific PDF types to generate (if not specified, generates all for the tier)
 * @returns ActionState with information about the generated PDFs
 */
export async function generatePDFAction(
  purchaseId: string,
  tier: string,
  types?: PDFType[]
): Promise<ActionState<{ outputs: { type: string, filePath: string }[] }>> {
  try {
    // 1. Get purchase information
    const purchaseResult = await getPurchaseByIdAction(purchaseId);
    if (!purchaseResult.isSuccess || !purchaseResult.data) {
      return {
        isSuccess: false,
        message: `Failed to retrieve purchase: ${purchaseResult.message}`
      };
    }
    
    const purchase = purchaseResult.data;
    const url = purchase.url;
    const customerEmail = purchase.customerEmail;
    
    // Update status to indicate generation is in progress
    await updatePurchaseStatusAction(purchaseId, 'processing');
    
    // 2. Get the scraped data for this purchase
    const scrapedDataResult = await getScrapedDataByPurchaseIdAction(purchaseId);
    if (!scrapedDataResult.isSuccess || !scrapedDataResult.data) {
      await updatePurchaseStatusAction(purchaseId, 'generation_failed');
      return {
        isSuccess: false,
        message: `Failed to retrieve scraped data: ${scrapedDataResult.message}`
      };
    }
    
    const scrapedData = scrapedDataResult.data;
    if (scrapedData.status !== 'completed') {
      await updatePurchaseStatusAction(purchaseId, 'generation_failed');
      return {
        isSuccess: false,
        message: 'Scraped data is not complete. Cannot generate PDFs.'
      };
    }
    
    // Extract the markdown content
    const scrapedContent = scrapedData.scrapedContent;
    if (!scrapedContent || typeof scrapedContent !== 'object' || !('markdown' in scrapedContent)) {
      await updatePurchaseStatusAction(purchaseId, 'generation_failed');
      return {
        isSuccess: false,
        message: 'No content available in scraped data.'
      };
    }
    
    const content = scrapedContent.markdown as string;
    if (!content) {
      await updatePurchaseStatusAction(purchaseId, 'generation_failed');
      return {
        isSuccess: false,
        message: 'Markdown content is empty.'
      };
    }
    
    // 3. Determine which PDFs to generate based on tier (if types not specified)
    const pdfTypesToGenerate = types || getPDFTypesForTier(tier);
    
    // 4. Initialize results array
    const outputs: { type: string, filePath: string }[] = [];
    const errors: string[] = [];
    
    // 5. Generate PDFs
    try {
      // Pre-analyze content for each type of report we need to generate
      // This way we can reuse analyses if a generation fails
      const analyses: Record<string, any> = {};
      
      // Process each report type
      for (const type of pdfTypesToGenerate) {
        // Generate or retrieve the appropriate analysis based on type
        try {
          analyses[type] = await getAnalysisForType(type, content, analyses);
        } catch (analysisError: any) {
          console.error(`Analysis failed for ${type} report:`, analysisError);
          errors.push(`Failed to analyze content for ${type} report: ${analysisError.message || 'Unknown error'}`);
          continue; // Skip to next report type
        }
        
        // Generate the appropriate PDF based on type with retries
        const pdfResult = await generatePDFWithRetry(type, analyses[type], purchaseId);
        
        if (!pdfResult.isSuccess || !pdfResult.data?.buffer) {
          console.error(`Failed to generate ${type} PDF:`, pdfResult.message);
          errors.push(`Failed to generate ${type} PDF: ${pdfResult.message}`);
          continue; // Skip to next report type
        }
        
        // Upload the PDF to Supabase Storage with retries
        const fileName = `${type}-report-${Date.now()}.pdf`;
        const uploadResult = await uploadPDFWithRetry(
          pdfResult.data.buffer,
          fileName,
          purchaseId
        );
        
        if (!uploadResult.isSuccess || !uploadResult.data) {
          console.error(`Failed to upload ${type} PDF:`, uploadResult.message);
          errors.push(`Failed to upload ${type} PDF: ${uploadResult.message}`);
          continue; // Skip to next report type
        }
        
        const filePath = uploadResult.data.filePath;
        
        // Create an output record
        const outputResult = await createOutputAction({
          purchaseId,
          type,
          filePath
        });
        
        if (outputResult.isSuccess && outputResult.data) {
          outputs.push({
            type,
            filePath
          });
        } else {
          errors.push(`Failed to record ${type} PDF output: ${outputResult.message}`);
        }
      }
      
      // Update purchase status based on outputs
      if (outputs.length > 0) {
        // If we have at least some outputs, consider it a success even if some failed
        await updatePurchaseStatusAction(purchaseId, 'completed');
        
        // Generate signed URLs for each output for the email
        const outputsWithUrls = await Promise.all(
          outputs.map(async (output) => {
            try {
              const signedUrlResult = await createSignedUrl(output.filePath);
              return {
                type: output.type,
                downloadUrl: signedUrlResult.isSuccess && signedUrlResult.data 
                  ? signedUrlResult.data.signedUrl 
                  : '#' // Fallback if URL creation fails
              };
            } catch (error) {
              console.error(`Failed to create signed URL for ${output.type}:`, error);
              return {
                type: output.type,
                downloadUrl: '#' // Fallback URL
              };
            }
          })
        );
        
        // Send download email with links to all generated PDFs
        if (customerEmail && outputsWithUrls.length > 0) {
          try {
            const emailResult = await sendDownloadEmailAction(
              customerEmail,
              outputsWithUrls,
              purchase
            );
            
            if (!emailResult.isSuccess) {
              console.warn(`Email sending failed but PDFs were generated: ${emailResult.message}`);
              // Non-critical error, don't fail the whole operation
            }
          } catch (emailError: any) {
            console.error('Failed to send download email:', emailError);
            // Non-critical error, don't fail the whole operation
          }
        }
        
        // If there were some errors but we still produced outputs
        if (errors.length > 0) {
          return {
            isSuccess: true,
            message: `Generated ${outputs.length}/${pdfTypesToGenerate.length} PDFs. Some reports had errors: ${errors.join('; ')}`,
            data: { outputs }
          };
        }
        
        return {
          isSuccess: true,
          message: `Successfully generated ${outputs.length} PDFs`,
          data: { outputs }
        };
      } else {
        // If no outputs were created, it's a failure
        await updatePurchaseStatusAction(purchaseId, 'generation_failed');
        
        // Optionally send failure notification email
        if (customerEmail) {
          try {
            await sendDownloadEmailAction(
              customerEmail,
              [], // No outputs
              purchase
            );
          } catch (emailError) {
            console.error('Failed to send failure notification email:', emailError);
            // Non-critical error, don't fail the whole operation
          }
        }
        
        return {
          isSuccess: false,
          message: `Failed to generate any PDFs. Errors: ${errors.join('; ')}`
        };
      }
      
    } catch (error: any) {
      console.error('Error during PDF generation:', error);
      await updatePurchaseStatusAction(purchaseId, 'generation_failed');
      return {
        isSuccess: false,
        message: `PDF generation failed: ${error.message || 'Unknown error'}`
      };
    }
    
  } catch (error: any) {
    console.error('Error in generatePDFAction:', error);
    // Try to update status if possible
    try {
      await updatePurchaseStatusAction(purchaseId, 'generation_failed');
    } catch (statusError) {
      console.error('Failed to update purchase status:', statusError);
    }
    
    return {
      isSuccess: false,
      message: `An unexpected error occurred: ${error.message || 'Unknown error'}`
    };
  }
}

/**
 * Helper function to determine which PDF types to generate based on tier
 */
function getPDFTypesForTier(tier: string): PDFType[] {
  switch (tier.toLowerCase()) {
    case 'basic':
    case 'starter':
      return ['blueprint'];
    case 'standard':
      return ['blueprint', 'personas', 'seo'];
    case 'premium':
    case 'complete':
      return ['blueprint', 'personas', 'seo', 'marketing', 'content', 'technical'];
    default:
      return ['blueprint'];
  }
}

/**
 * Performs content analysis for a specific report type
 * Reuses existing analyses when possible to avoid redundant AI calls
 */
async function getAnalysisForType(type: PDFType, content: string, existingAnalyses: Record<string, any>): Promise<any> {
  try {
    switch (type) {
      case 'blueprint':
        // If we already analyzed the basic website content, reuse it
        if (!existingAnalyses.blueprint) {
          existingAnalyses.blueprint = await retryOperation(
            () => analyzeWebsiteContent(content),
            MAX_AI_RETRIES,
            'website content analysis'
          );
        }
        return existingAnalyses.blueprint;
        
      case 'personas':
        // Personas can use the same data as blueprint
        if (!existingAnalyses.blueprint) {
          existingAnalyses.blueprint = await retryOperation(
            () => analyzeWebsiteContent(content),
            MAX_AI_RETRIES,
            'website content analysis'
          );
        }
        return existingAnalyses.blueprint;
        
      case 'seo':
        // SEO can use the same data as blueprint but with some additional fields
        if (!existingAnalyses.blueprint) {
          existingAnalyses.blueprint = await retryOperation(
            () => analyzeWebsiteContent(content),
            MAX_AI_RETRIES,
            'website content analysis'
          );
        }
        return existingAnalyses.blueprint;
        
      case 'marketing':
        // Marketing needs specific analysis
        if (!existingAnalyses.marketing) {
          existingAnalyses.marketing = await retryOperation(
            () => analyzeMarketingStrategy(content),
            MAX_AI_RETRIES,
            'marketing strategy analysis'
          );
        }
        return existingAnalyses.marketing;
        
      case 'content':
        // Content needs specific analysis
        if (!existingAnalyses.content) {
          existingAnalyses.content = await retryOperation(
            () => analyzeContentStrategy(content),
            MAX_AI_RETRIES,
            'content strategy analysis'
          );
        }
        return existingAnalyses.content;
        
      case 'technical':
        // Technical needs specific analysis
        if (!existingAnalyses.technical) {
          existingAnalyses.technical = await retryOperation(
            () => analyzeTechnicalRecommendations(content),
            MAX_AI_RETRIES,
            'technical recommendations analysis'
          );
        }
        return existingAnalyses.technical;
        
      default:
        throw new Error(`Unsupported PDF type: ${type}`);
    }
  } catch (error: any) {
    console.error(`Error getting analysis for ${type}:`, error);
    throw error;
  }
}

/**
 * Retries the PDF generation process with the specified number of attempts
 */
async function generatePDFWithRetry(
  type: PDFType,
  analysis: any,
  purchaseId: string
): Promise<ActionState<{ buffer: Buffer; filePath?: string }>> {
  return retryOperation(
    async () => {
      try {
        let pdfBuffer: Buffer;
        
        // Generate the PDF based on type
        switch (type) {
          case 'blueprint':
            pdfBuffer = await createBlueprintReport(analysis, purchaseId);
            break;
          case 'personas':
            pdfBuffer = await createPersonaReport(analysis, purchaseId);
            break;
          case 'seo':
            pdfBuffer = await createSEOReport(analysis, purchaseId);
            break;
          case 'marketing':
            pdfBuffer = await createMarketingReport(analysis, purchaseId);
            break;
          case 'content':
            pdfBuffer = await createContentReport(analysis, purchaseId);
            break;
          case 'technical':
            pdfBuffer = await createTechnicalReport(analysis, purchaseId);
            break;
          default:
            return {
              isSuccess: false,
              message: `Unknown PDF type: ${type}`
            };
        }
        
        return {
          isSuccess: true,
          message: `Successfully generated ${type} PDF`,
          data: {
            buffer: pdfBuffer
          }
        };
      } catch (error: any) {
        console.error(`Error generating ${type} PDF:`, error);
        return {
          isSuccess: false,
          message: `Error generating ${type} PDF: ${error.message || 'Unknown error'}`
        };
      }
    },
    MAX_PDF_RETRIES,
    `${type} PDF generation`
  );
}

/**
 * Uploads a PDF with retry logic
 */
async function uploadPDFWithRetry(
  buffer: Buffer,
  fileName: string,
  purchaseId: string
): Promise<ActionState<{ filePath: string }>> {
  return retryOperation(
    () => uploadPdfStorage(buffer, fileName, purchaseId),
    MAX_UPLOAD_RETRIES,
    'PDF upload'
  );
}

/**
 * Generic retry operation with exponential backoff
 */
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number,
  operationName: string
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`Retrying ${operationName} (attempt ${attempt}/${maxRetries})...`);
        // Exponential backoff
        const delay = 1000 * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      return await operation();
    } catch (error) {
      lastError = error;
      console.error(`${operationName} failed (attempt ${attempt + 1}/${maxRetries + 1}):`, error);
    }
  }
  
  throw lastError || new Error(`All ${maxRetries + 1} attempts for ${operationName} failed`);
} 