#!/bin/bash

# Get the webhook URL from command line or use default localhost
WEBHOOK_URL=${1:-"http://localhost:3000/api/webhooks/polar"}
WEBHOOK_SECRET=${POLAR_WEBHOOK_SECRET:-"test-secret"}

echo "Using webhook URL: $WEBHOOK_URL"
echo "Using webhook secret: $WEBHOOK_SECRET"

# Create a timestamp for the event
TIMESTAMP=$(date +%s)

# Create a sample payload for order.succeeded event
PAYLOAD='{
  "type": "order.succeeded",
  "id": "evt_test_'$TIMESTAMP'",
  "data": {
    "id": "ord_test_'$TIMESTAMP'",
    "email": "test@example.com",
    "total_amount": "99.00",
    "metadata": {
      "url": "https://test-ecommerce-site.com"
    },
    "line_items": [
      {
        "product_id": "base_kit",
        "quantity": 1,
        "unit_price": "99.00"
      }
    ]
  }
}'

echo "Sending payload:"
echo "$PAYLOAD" | jq || echo "$PAYLOAD"

# Calculate signature (this is a simplified version, not production-ready)
if command -v openssl &> /dev/null; then
  SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$WEBHOOK_SECRET" | awk '{print $NF}')
  echo "Generated signature: $SIGNATURE"
  
  # Send the request with curl
  curl -X POST "$WEBHOOK_URL" \
    -H "Content-Type: application/json" \
    -H "x-polar-signature: $SIGNATURE" \
    -d "$PAYLOAD"
else
  echo "Warning: openssl not found, sending without signature validation"
  curl -X POST "$WEBHOOK_URL" \
    -H "Content-Type: application/json" \
    -d "$PAYLOAD"
fi

echo -e "\nDone!" 