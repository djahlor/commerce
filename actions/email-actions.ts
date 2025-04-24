'use server';

import { SelectPurchase } from '@/db/schema/purchases-schema';
import { defaultFromEmail, resend } from '@/lib/resend';
import { ActionState } from '@/types';

// Email template types
type EmailTemplateType = 'download' | 'welcome' | 'receipt';

/**
 * Sends a download link email to a customer
 * 
 * @param email The customer's email address
 * @param outputs Array of outputs with download links
 * @param purchase The purchase record
 * @returns ActionState indicating success or failure
 */
export async function sendDownloadEmailAction(
  email: string,
  outputs: { type: string; downloadUrl: string }[],
  purchase: SelectPurchase
): Promise<ActionState<{ messageId: string }>> {
  try {
    const { data, error } = await resend.emails.send({
      from: defaultFromEmail,
      to: email,
      subject: 'Your E-Com Edge Kit Downloads',
      html: generateDownloadEmailHtml(email, outputs, purchase),
    });

    if (error) {
      console.error('Failed to send email:', error);
      return {
        isSuccess: false,
        message: `Failed to send email: ${error.message}`,
      };
    }

    return {
      isSuccess: true,
      message: 'Email sent successfully',
      data: { messageId: data?.id || '' },
    };
  } catch (error: any) {
    console.error('Error sending download email:', error);
    return {
      isSuccess: false,
      message: `Error sending email: ${error.message}`,
    };
  }
}

/**
 * Generates HTML content for download email
 */
function generateDownloadEmailHtml(
  email: string,
  outputs: { type: string; downloadUrl: string }[],
  purchase: SelectPurchase
): string {
  // Format the product types for nice display
  function formatProductType(type: string): string {
    return type
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Generate a button for each download
  const downloadButtons = outputs
    .map(
      output => `
      <tr>
        <td style="padding: 12px 0;">
          <div style="text-align: center;">
            <a href="${output.downloadUrl}" 
               style="display: inline-block; padding: 12px 20px; background-color: #4F46E5; 
                      color: white; text-decoration: none; border-radius: 5px; 
                      font-weight: 500; text-align: center; min-width: 200px;">
              Download ${formatProductType(output.type)}
            </a>
          </div>
        </td>
      </tr>
    `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your E-Com Edge Kit Downloads</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
                   line-height: 1.6; margin: 0; padding: 0; color: #333333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${process.env.NEXT_PUBLIC_APP_URL}/logo.png" alt="E-Com Edge Kit" style="max-width: 200px; height: auto;">
          </div>
          
          <h1 style="color: #111827; font-size: 24px; font-weight: 600; margin-bottom: 24px;">Your E-Com Edge Kit is Ready!</h1>
          
          <p style="margin-bottom: 16px;">Hi there,</p>
          
          <p style="margin-bottom: 16px;">Thank you for your purchase! Your E-Com Edge Kit for <strong>${purchase.url || 'your website'}</strong> has been generated and is ready for download.</p>
          
          <p style="margin-bottom: 24px;">Click the links below to download your reports:</p>
          
          <table style="width: 100%; border-collapse: collapse;">
            ${downloadButtons}
          </table>
          
          <div style="margin: 32px 0; text-align: center;">
            <p style="margin-bottom: 12px;">For your convenience, all your purchases are also available in your dashboard:</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
               style="display: inline-block; padding: 12px 20px; background-color: #111827; 
                      color: white; text-decoration: none; border-radius: 5px; 
                      font-weight: 500; text-align: center;">
              Go to Dashboard
            </a>
          </div>
          
          <p style="margin-bottom: 16px;">If you have any questions or need assistance, please reply to this email.</p>
          
          <p style="margin-bottom: 24px;">Best regards,<br>The E-Com Edge Kit Team</p>
          
          <div style="border-top: 1px solid #E5E7EB; padding-top: 20px; font-size: 12px; color: #6B7280; text-align: center;">
            <p>© ${new Date().getFullYear()} E-Com Edge Kit. All rights reserved.</p>
            <p>You're receiving this email because you purchased an E-Com Edge Kit.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Sends a welcome email to a new customer
 * Could be used for initial signup or first login
 */
export async function sendWelcomeEmailAction(
  email: string,
  name?: string
): Promise<ActionState<{ messageId: string }>> {
  try {
    const { data, error } = await resend.emails.send({
      from: defaultFromEmail,
      to: email,
      subject: 'Welcome to E-Com Edge Kit',
      html: `
        <div>
          <h1>Welcome to E-Com Edge Kit, ${name || 'there'}!</h1>
          <p>Thank you for joining us. We're excited to help optimize your e-commerce business.</p>
          <p>Visit your <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">dashboard</a> to get started.</p>
        </div>
      `,
    });

    if (error) {
      console.error('Failed to send welcome email:', error);
      return {
        isSuccess: false,
        message: `Failed to send welcome email: ${error.message}`,
      };
    }

    return {
      isSuccess: true,
      message: 'Welcome email sent successfully',
      data: { messageId: data?.id || '' },
    };
  } catch (error: any) {
    console.error('Error sending welcome email:', error);
    return {
      isSuccess: false,
      message: `Error sending welcome email: ${error.message}`,
    };
  }
}

/**
 * Sends a custom notification email
 * Can be used for various notifications like generation failures, updates, etc.
 */
export async function sendNotificationEmailAction(
  email: string,
  subject: string,
  message: string,
  ctaLink?: string,
  ctaText?: string
): Promise<ActionState<{ messageId: string }>> {
  try {
    let htmlContent = `
      <div>
        <h1>${subject}</h1>
        <p>${message}</p>
    `;

    if (ctaLink && ctaText) {
      htmlContent += `<p><a href="${ctaLink}" style="display: inline-block; padding: 10px 15px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px;">${ctaText}</a></p>`;
    }

    htmlContent += `</div>`;

    const { data, error } = await resend.emails.send({
      from: defaultFromEmail,
      to: email,
      subject,
      html: htmlContent,
    });

    if (error) {
      console.error('Failed to send notification email:', error);
      return {
        isSuccess: false,
        message: `Failed to send notification email: ${error.message}`,
      };
    }

    return {
      isSuccess: true,
      message: 'Notification email sent successfully',
      data: { messageId: data?.id || '' },
    };
  } catch (error: any) {
    console.error('Error sending notification email:', error);
    return {
      isSuccess: false,
      message: `Error sending notification email: ${error.message}`,
    };
  }
} 