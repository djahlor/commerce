# URL Handling Documentation

## Overview

This document explains how website URLs are collected, validated, and processed in the application. Website URLs are **required** for optimal analysis, and customers are strongly instructed to provide them during checkout.

## URL Collection Flow

1. **Checkout Process**: Customer website URLs are collected during checkout in the Polar.sh checkout flow.
   - Users are **required** to enter their website URL in the customer note field
   - Clear instructions with warning indicators are provided in the checkout metadata
   - Prominent messaging communicates that URL is necessary for complete analysis
   - No URL input is required on the product page or cart

2. **Webhook Processing**: When a webhook is received from Polar after successful payment:
   - The system extracts the URL from the `customer_note` field in the order data
   - URL validation is performed to ensure it's a valid website address
   - Admin notification is triggered if URL is missing
   - Orders with missing URLs are specially flagged with a `processing_missing_url` status
   - Fallback mechanisms are in place for continued processing

3. **PDF Generation**: The URL is used for generating analysis PDFs:
   - If URL is valid, it's used for AI analysis
   - If URL is missing, tier-based default content is used instead
   - The system still delivers PDFs with generic advice when URL is missing

## URL Validation Rules

The system validates URLs with the following rules:

1. Check if the URL is present in the `customer_note`
2. Apply regex matching to extract URL-like patterns from the note
3. Check if the URL starts with `http://` or `https://` and prepend `https://` if missing
4. Verify the URL format using the regex pattern: `/^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/`

## Missing URL Handling

When a URL is missing, the system takes these specific actions:

1. **Order Processing**:
   - The order is still processed (payment is valid)
   - The purchase record is created with a special status: `processing_missing_url`
   - Admins are notified via console logs (and eventually email/Slack)

2. **Admin Notification**:
   - An urgent notification is generated with the order ID and customer email
   - The notification flags the order for manual follow-up
   - Admin can contact the customer to request their website URL

3. **Content Generation**:
   - Generic, tier-appropriate content is used instead of website-specific analysis
   - PDFs are still generated with industry best practices
   - The final output is less personalized but still provides value

## Fallback Strategies

The system implements the following fallback strategies when URL is missing or invalid:

1. **Webhook Handler**:
   - If URL is missing in `customer_note`, an empty string is used
   - If URL is malformed, attempt to fix it by prepending `https://`
   - Detailed logging tracks URL source and validation steps for debugging
   - Special purchase status flags orders needing attention

2. **PDF Generation**:
   - If URL is missing, tier-based default content is used
   - If URL is malformed, attempt to fix it by prepending `https://`
   - Analysis continues with general e-commerce best practices if URL-specific analysis is not possible

## Debugging URL Issues

To debug URL-related issues:

1. Check server logs for warnings that start with `⚠️` and admin notifications
2. Look for log entries that include `URL source =` to see where the URL came from
3. Check for purchases with the `processing_missing_url` status
4. Verify Polar webhooks include `customer_note` when expected
5. Ensure customers are properly instructed to enter their website URL during checkout

## Recommended Testing

For testing the URL handling flow:

1. Complete a test checkout with various URL formats:
   - Standard URL: `https://example.com`
   - URL without protocol: `example.com`
   - URL with subdomains: `shop.example.com`
   - URL with path: `example.com/store`

2. Test empty or invalid URLs to verify fallback behavior:
   - Leave customer note empty (should trigger admin notification)
   - Enter non-URL text in the customer note

## Future Improvements

Potential improvements to consider for URL handling:

1. Implement a dedicated custom fields solution if Polar adds support for this feature
2. Add automatic URL validation on the checkout page
3. Enhance URL extraction with more sophisticated patterns
4. Implement URL verification to check if the site is accessible before processing
5. Create a customer follow-up process to obtain missing URLs
6. Add a dashboard UI for admins to view and manage orders with missing URLs 