'use server';

import { createTempCartAction } from '@/actions/db/temp-carts-actions';
import { polar } from '@/lib/polar/index';
import { ActionState } from '@/lib/types';
import { generateTempCartId } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

/**
 * Interface for cart items to be passed to the checkout action
 */
interface CartItem {
  productId: string; // Product ID from our local/Polar catalog
  quantity: number;
  price?: number; // Optional price for variable pricing
  url?: string; // Optional URL for the product
}

/**
 * Interface for cart data to be passed to the checkout action
 */
interface CartData {
  items: CartItem[];
  customerEmail?: string; // Optional customer email if known
}

// Add this type for direct product purchase
interface DirectPurchaseData {
  priceId: string
  url?: string
}

/**
 * Creates a checkout session in Polar and returns the checkout URL
 * Uses metadata to instruct customers to enter their website URL in the notes field
 * 
 * @param data DirectPurchaseData for direct product purchase or CartData for regular cart checkout
 * @returns ActionState with checkout URL in data if successful
 */
export async function createPolarCheckoutAction(data: DirectPurchaseData | CartData): Promise<ActionState<{ checkoutUrl: string }>> {
  try {
    // For direct product purchase (upsell)
    if ('priceId' in data) {
      // Create checkout with the single product as a product ID
      const checkout = await polar.checkouts.create({
        products: [data.priceId],
        metadata: {
          url: data.url || ''
        },
        successUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/success?order_id={CHECKOUT_SESSION_ID}`
      });
      
      return {
        isSuccess: true,
        data: {
          checkoutUrl: checkout.url
        }
      };
    }
    
    // For regular cart checkout
    if (!data.items || data.items.length === 0) {
      return {
        isSuccess: false,
        message: 'Cart is empty',
      };
    }

    // Generate a unique ID for this cart
    const tempCartId = generateTempCartId();
    
    // Extract URLs from cart items
    const urls: string[] = [];
    for (const item of data.items) {
      if (item.url && typeof item.url === 'string' && item.url.trim() !== '') {
        urls.push(item.url.trim());
      }
    }
    
    // Use the first URL as the main one
    const mainUrl = urls.length > 0 ? urls[0] : '';
    
    // Store cart data in temp_carts table for persistence
    const tempCartResult = await createTempCartAction(
      tempCartId,
      mainUrl,
      JSON.stringify({ items: data.items })
    );
    
    if (!tempCartResult.isSuccess) {
      console.error('Failed to create temp cart:', tempCartResult.message);
      // Continue with checkout, but log the error
    }

    // Get product IDs from cart items - ensure they are valid UUIDs
    const productIds = data.items.map(item => {
      // Ensure product ID is in the proper UUID format
      // It should already be a proper UUID from the mock product data
      return item.productId;
    });

    // Prepare metadata for the checkout
    const metadata: Record<string, string> = {
      tempCartId, // Pass the temp cart ID which can be used to retrieve data later
    };

    // If we have URLs, store the main one in metadata too for redundancy
    if (mainUrl) {
      metadata.url = mainUrl.substring(0, 255); // Limit to 255 chars if needed
    }

    // Success URL for redirecting after checkout
    const successUrl = new URL('/success', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').toString();

    console.log('Creating Polar checkout with product IDs:', productIds);

    // Create checkout session using Polar SDK 
    const checkout = await polar.checkouts.create({
      products: productIds,
      customerEmail: data.customerEmail,
      metadata,
      successUrl,
      allowDiscountCodes: true
    });

    // Revalidate any relevant paths
    revalidatePath('/cart');

    return {
      isSuccess: true,
      message: 'Checkout created successfully',
      data: {
        checkoutUrl: checkout.url,
      },
    };
  } catch (error) {
    console.error('Error creating Polar checkout:', error);
    return {
      isSuccess: false,
      message: error instanceof Error
        ? `Failed to create checkout: ${error.message}`
        : 'Failed to create checkout due to an unknown error',
    };
  }
} 