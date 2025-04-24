'use server';

import { ActionState } from '@/types';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with storage capabilities
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Using service role key for admin access to storage
  {
    auth: {
      persistSession: false
    }
  }
);

// Default bucket for storing PDFs
const STORAGE_BUCKET = 'pdfs';

/**
 * Uploads a PDF buffer to Supabase Storage
 * @param pdfBuffer The PDF as a Buffer
 * @param fileName The name of the file
 * @param purchaseId The ID of the purchase to associate with the file
 * @returns ActionState with the file path if successful
 */
export async function uploadPdfStorage(
  pdfBuffer: Buffer,
  fileName: string,
  purchaseId: string
): Promise<ActionState<{ filePath: string }>> {
  try {
    // Create the file path: pdfs/{purchaseId}/{fileName}
    const filePath = `${purchaseId}/${fileName}`;

    // Upload the file to the pdfs bucket
    const { data, error } = await supabase
      .storage
      .from(STORAGE_BUCKET)
      .upload(filePath, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true // Overwrite if exists
      });

    if (error) {
      console.error('Supabase Storage upload error:', error);
      return {
        isSuccess: false,
        message: `Failed to upload PDF: ${error.message}`
      };
    }

    // Return the file path for future reference
    return {
      isSuccess: true,
      message: "PDF uploaded successfully",
      data: {
        filePath: data.path
      }
    };
  } catch (error) {
    console.error('Error in uploadPdfStorage:', error);
    return {
      isSuccess: false,
      message: "An unexpected error occurred. Please try again later."
    };
  }
}

/**
 * Generates a signed URL for downloading a PDF
 * @param filePath The path of the file in storage
 * @param expiresIn Optional expiration time in seconds (default: 1 hour)
 * @returns ActionState with the signed URL if successful
 */
export async function createSignedUrl(
  filePath: string,
  expiresIn = 3600 // Default expiration: 1 hour
): Promise<ActionState<{ signedUrl: string }>> {
  try {
    // Generate a signed URL with specified expiration
    const { data, error } = await supabase
      .storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error('Supabase signed URL error:', error);
      return {
        isSuccess: false,
        message: `Failed to generate download link: ${error.message}`
      };
    }

    if (!data || !data.signedUrl) {
      return {
        isSuccess: false,
        message: "Could not generate download link."
      };
    }

    return {
      isSuccess: true,
      message: "Signed URL generated successfully",
      data: {
        signedUrl: data.signedUrl
      }
    };
  } catch (error) {
    console.error('Error in createSignedUrl:', error);
    return {
      isSuccess: false,
      message: "An unexpected error occurred. Please try again later."
    };
  }
}

// Keeping this for backward compatibility
export const getSignedUrlAction = createSignedUrl;

/**
 * Deletes a PDF from Supabase Storage
 * @param filePath The path of the file in storage
 * @returns ActionState indicating success or failure
 */
export async function deletePdfStorage(
  filePath: string
): Promise<ActionState<void>> {
  try {
    const { error } = await supabase
      .storage
      .from(STORAGE_BUCKET)
      .remove([filePath]);

    if (error) {
      console.error('Supabase Storage delete error:', error);
      return {
        isSuccess: false,
        message: `Failed to delete PDF: ${error.message}`
      };
    }

    return {
      isSuccess: true,
      message: "PDF deleted successfully",
      data: undefined
    };
  } catch (error) {
    console.error('Error in deletePdfStorage:', error);
    return {
      isSuccess: false,
      message: "An unexpected error occurred. Please try again later."
    };
  }
}

/**
 * Lists all PDFs for a specific purchase
 * @param purchaseId The ID of the purchase
 * @returns ActionState with an array of file paths if successful
 */
export async function listPurchasePdfs(
  purchaseId: string
): Promise<ActionState<{ files: string[] }>> {
  try {
    const { data, error } = await supabase
      .storage
      .from(STORAGE_BUCKET)
      .list(purchaseId);

    if (error) {
      console.error('Supabase Storage list error:', error);
      return {
        isSuccess: false,
        message: `Failed to list PDFs: ${error.message}`
      };
    }

    // Extract file paths
    const files = data.map(file => `${purchaseId}/${file.name}`);

    return {
      isSuccess: true,
      message: "PDFs listed successfully",
      data: {
        files
      }
    };
  } catch (error) {
    console.error('Error in listPurchasePdfs:', error);
    return {
      isSuccess: false,
      message: "An unexpected error occurred. Please try again later."
    };
  }
} 