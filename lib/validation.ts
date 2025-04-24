import { z } from 'zod';

/**
 * URL validation schema for e-commerce websites
 * Can be used both client-side and server-side
 */
export const urlSchema = z.object({
  url: z
    .string()
    .url('Please enter a valid URL')
    .min(5, 'URL must be at least 5 characters')
    .refine(
      (val) => val.startsWith('http://') || val.startsWith('https://'),
      'URL must start with http:// or https://'
    )
    // Optional: Add more sophisticated e-commerce URL validation if needed
    // .refine(
    //   (val) => {
    //     // Check for common e-commerce platforms or patterns
    //     const ecomPatterns = [
    //       /shopify\.com/i, 
    //       /myshopify\.com/i,
    //       /woocommerce/i,
    //       /shop\./i,
    //       /store\./i,
    //       /\.store/i,
    //       /\.shop/i,
    //       /magento/i,
    //       /bigcommerce/i,
    //     ];
    //     // Return true if it's a known e-commerce platform or if we can't determine
    //     return true; // Disabled for now to avoid false negatives
    //   }, 
    //   'Please enter an e-commerce website URL'
    // )
});

/**
 * Simplified validation function to check basic URL validity
 * @param url URL to validate
 * @returns Boolean indicating if URL is basically valid
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch (error) {
    return false;
  }
}

/**
 * Type definition for validated URL
 */
export type ValidatedUrl = z.infer<typeof urlSchema>;

// Common e-commerce platforms and identifiers
const ECOMMERCE_PLATFORMS = [
  // Major platforms
  'shopify.com',
  'myshopify.com',
  'bigcommerce.com',
  'woocommerce.com',
  'magento.com',
  'squarespace.com',
  'wix.com',
  'etsy.com',
  'square.site',
  'volusion.com',

  // Shopping carts
  'cart',
  'checkout',
  'basket',
  'shop',
  'store',
  
  // Large e-commerce platforms
  'amazon',
  'ebay',
  'walmart',
  'target',
  'bestbuy',
  'newegg'
];

// Common e-commerce URL patterns
const ECOMMERCE_PATTERNS = [
  /\/product(s)?\//, 
  /\/shop\//, 
  /\/store\//,
  /\/cart\//,
  /\/checkout\//,
  /\/product-category\//,
  /\/collections\//,
  /\/catalog\//
];

/**
 * Checks if a URL is likely an e-commerce website
 * @param url A valid URL string
 * @returns Object containing validation result and confidence score
 */
export function isEcommerceUrl(url: string): { 
  isEcommerce: boolean; 
  confidence: 'high' | 'medium' | 'low'; 
  reasons: string[] 
} {
  // Default response
  const result = {
    isEcommerce: false,
    confidence: 'low' as 'high' | 'medium' | 'low',
    reasons: [] as string[]
  };

  if (!isValidUrl(url)) {
    result.reasons.push('Invalid URL format');
    return result;
  }

  try {
    // Parse the URL to check its components
    const parsedUrl = new URL(url);
    const { hostname, pathname } = parsedUrl;
    
    // Counter for matching signals
    let signals = 0;
    
    // Check for e-commerce platforms in domain
    const domainMatches = ECOMMERCE_PLATFORMS.filter(platform => 
      hostname.includes(platform)
    );
    
    if (domainMatches.length > 0) {
      signals += 2;
      result.reasons.push(`Domain contains e-commerce platform: ${domainMatches.join(', ')}`);
    }
    
    // Check for e-commerce patterns in path
    const pathMatches = ECOMMERCE_PATTERNS.filter(pattern => 
      pattern.test(pathname)
    );
    
    if (pathMatches.length > 0) {
      signals += 2;
      result.reasons.push('URL path contains e-commerce patterns');
    }
    
    // Check TLD for .shop, .store, etc.
    if (hostname.endsWith('.shop') || hostname.endsWith('.store')) {
      signals += 1;
      result.reasons.push('Domain uses e-commerce related TLD');
    }

    // Determine confidence level and result based on signal count
    if (signals >= 3) {
      result.isEcommerce = true;
      result.confidence = 'high';
    } else if (signals >= 1) {
      result.isEcommerce = true;
      result.confidence = 'medium';
    } else {
      result.isEcommerce = false;
      result.confidence = 'low';
      result.reasons.push('No e-commerce indicators detected');
    }
    
    return result;
  } catch (error) {
    result.reasons.push(`Error analyzing URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return result;
  }
} 