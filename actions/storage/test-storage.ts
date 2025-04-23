'use server';

import { ActionState } from '@/types';
import { deletePdfStorage, getSignedUrlAction, listPurchasePdfs, uploadPdfStorage } from './pdf-storage-actions';

/**
 * Test function to verify PDF storage functionality
 * This function performs:
 * 1. Upload of a test PDF
 * 2. Generation of a signed URL
 * 3. Listing of PDFs for the purchase
 * 4. (Optional) Deletion of the test PDF
 * 
 * @param purchaseId A test purchase ID
 * @param shouldDelete Whether to delete the test file after verification
 * @returns ActionState with test results
 */
export async function testPdfStorage(
  purchaseId: string = 'test-purchase-id',
  shouldDelete: boolean = false
): Promise<ActionState<{
  uploadResult: boolean;
  signedUrlResult: boolean;
  listResult: boolean;
  deleteResult?: boolean;
  filePath?: string;
  signedUrl?: string;
}>> {
  try {
    // Step 1: Create a simple test PDF (just a Buffer for testing purposes)
    const testFileName = `test-${Date.now()}.pdf`;
    const testContent = Buffer.from('Test PDF content for Supabase Storage');
    
    // Step 2: Upload the test PDF
    console.log('Uploading test PDF...');
    const uploadResult = await uploadPdfStorage(testContent, testFileName, purchaseId);
    
    if (!uploadResult.isSuccess || !uploadResult.data) {
      return {
        isSuccess: false,
        message: `Upload test failed: ${uploadResult.message}`
      };
    }
    
    const filePath = uploadResult.data.filePath;
    console.log('Upload successful. File path:', filePath);
    
    // Step 3: Generate a signed URL
    console.log('Generating signed URL...');
    const signedUrlResult = await getSignedUrlAction(filePath);
    
    if (!signedUrlResult.isSuccess || !signedUrlResult.data) {
      return {
        isSuccess: false,
        message: `Signed URL test failed: ${signedUrlResult.message}`
      };
    }
    
    const signedUrl = signedUrlResult.data.url;
    console.log('Signed URL generated:', signedUrl);
    
    // Step 4: List PDFs for the purchase
    console.log('Listing PDFs for purchase...');
    const listResult = await listPurchasePdfs(purchaseId);
    
    if (!listResult.isSuccess || !listResult.data) {
      return {
        isSuccess: false,
        message: `List PDFs test failed: ${listResult.message}`
      };
    }
    
    console.log('Listed files:', listResult.data.files);
    
    // Step 5: Delete the test PDF if requested
    let deleteResult: ActionState<void> | undefined = undefined;
    if (shouldDelete) {
      console.log('Deleting test PDF...');
      deleteResult = await deletePdfStorage(filePath);
      console.log('Delete result:', deleteResult.isSuccess ? 'Success' : 'Failed');
    }
    
    return {
      isSuccess: true,
      message: "PDF storage test completed successfully",
      data: {
        uploadResult: true,
        signedUrlResult: true,
        listResult: true,
        deleteResult: shouldDelete ? deleteResult!.isSuccess : undefined,
        filePath,
        signedUrl
      }
    };
  } catch (error) {
    console.error('Error in testPdfStorage:', error);
    return {
      isSuccess: false,
      message: `An unexpected error occurred during testing: ${error instanceof Error ? error.message : String(error)}`
    };
  }
} 