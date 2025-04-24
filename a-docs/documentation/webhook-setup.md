# Polar Webhook Setup Guide

## Current Ngrok URL
Your current webhook URL for development is:
```
https://8505-117-2-58-241.ngrok-free.app/api/webhooks/polar
```

⚠️ **Note**: This URL will change each time you restart ngrok. Be sure to update your Polar webhook settings when you get a new URL.

## Setting Up Webhooks in Polar Dashboard

1. **Log in to your Polar Dashboard**
   - Visit https://polar.sh and log in to your account

2. **Navigate to Webhook Settings**
   - Go to your Dashboard
   - Click on "Developer Settings" or "API Settings"
   - Find the "Webhooks" section

3. **Add a New Webhook**
   - Click "Add Webhook" or similar button
   - Enter the webhook URL:
     ```
     https://8505-117-2-58-241.ngrok-free.app/api/webhooks/polar
     ```
   - Make sure to select the `order.succeeded` event type
   - Add your webhook secret (this should match the `POLAR_WEBHOOK_SECRET` environment variable)
   - Save the webhook configuration

## Testing Your Webhook

You can test the webhook using the provided test script:

```bash
# Test with the default localhost URL (if your Next.js server is running locally)
./scripts/test-polar-webhook.sh

# Or test with the ngrok URL
./scripts/test-polar-webhook.sh "https://8505-117-2-58-241.ngrok-free.app/api/webhooks/polar"
```

## Setting Up for Production

When deploying to production:

1. Update your webhook URL in the Polar Dashboard to point to your production URL:
   ```
   https://your-domain.com/api/webhooks/polar
   ```

2. Make sure your `POLAR_WEBHOOK_SECRET` environment variable is properly set in your production environment.

3. Check your server logs to confirm that webhooks are being received and processed correctly.

## Troubleshooting

If webhooks aren't working correctly:

1. Check that your ngrok tunnel is running
2. Verify that your Next.js development server is running
3. Ensure the webhook URL in the Polar Dashboard matches your current ngrok URL
4. Check that your webhook secret in Polar matches your `POLAR_WEBHOOK_SECRET` environment variable
5. Look at the server logs for any error messages 