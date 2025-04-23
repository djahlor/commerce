'use server';

import { analyzeWebsiteContent } from '@/lib/ai';
import { createBlueprintReport, createPersonaReport, createSEOReport } from '@/lib/pdf';
import { ActionState } from '@/types';
import { createOutputAction } from './db/outputs-actions';
import { getPurchaseByIdAction, updatePurchaseStatusAction } from './db/purchases-actions';
import { getScrapedDataByPurchaseIdAction } from './db/scraped-data-actions';
import { uploadPdfStorage } from './storage/pdf-storage-actions';

// PDF types that can be generated for different tiers
export type PDFType = 'blueprint' | 'personas' | 'seo' | 'marketing' | 'content' | 'technical';

/**
 * Core PDF generation action that orchestrates the entire flow:
 * 1. Load purchase and scraped data
 * 2. Generate appropriate PDF(s) based on tier
 * 3. Store PDFs in Supabase Storage
 * 4. Create output records
 * 5. Update purchase status
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
    
    // 5. Generate PDFs
    try {
      // Analyze content once for use in multiple PDFs
      const analysis = await analyzeWebsiteContent(content);
      
      // Generate each PDF
      for (const type of pdfTypesToGenerate) {
        // Generate the appropriate PDF based on type
        let pdfResult: ActionState<{ buffer: Buffer; filePath?: string }>;
        
        switch (type) {
          case 'blueprint':
            pdfResult = await createBlueprintReport(analysis, purchaseId);
            break;
          case 'personas':
            pdfResult = await createPersonaReport(analysis, purchaseId);
            break;
          case 'seo':
            pdfResult = await createSEOReport(analysis, purchaseId);
            break;
          // Additional PDF types will be implemented in step 13.5
          default:
            console.log(`Skipping unsupported PDF type: ${type}`);
            continue;
        }
        
        if (!pdfResult.isSuccess || !pdfResult.data?.buffer) {
          console.error(`Failed to generate ${type} PDF:`, pdfResult.message);
          continue;
        }
        
        // 6. Upload the PDF to Supabase Storage
        const fileName = `${type}-report-${Date.now()}.pdf`;
        const uploadResult = await uploadPdfStorage(
          pdfResult.data.buffer,
          fileName,
          purchaseId
        );
        
        if (!uploadResult.isSuccess || !uploadResult.data) {
          console.error(`Failed to upload ${type} PDF:`, uploadResult.message);
          continue;
        }
        
        const filePath = uploadResult.data.filePath;
        
        // 7. Create an output record
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
        }
      }
      
      // 8. Update purchase status based on outputs
      if (outputs.length > 0) {
        await updatePurchaseStatusAction(purchaseId, 'completed');
        return {
          isSuccess: true,
          message: `Successfully generated ${outputs.length} PDFs`,
          data: { outputs }
        };
      } else {
        await updatePurchaseStatusAction(purchaseId, 'generation_failed');
        return {
          isSuccess: false,
          message: 'Failed to generate any PDFs.'
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