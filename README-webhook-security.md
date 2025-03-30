# Webduh Webhook Security Implementation

This implementation follows David and Amber's specifications for secure and reliable webhooks in the Webduh project. This README provides an overview of the security measures implemented and how to work with them.

## Core Features

1. **Secure Signatures**: All webhooks are signed with HMAC-SHA256 using a shared secret
2. **Timestamp Validation**: Strict 5-minute window for webhook acceptance (Amber's requirement)
3. **Duplicate Detection**: Additional protection against replay attacks
4. **Data Enrichment**: All webhook payloads are transformed to include structured metadata
5. **Clock Synchronization**: Detection of system clock drift
6. **User Interface**: Components for webhook configuration and testing

## Usage Examples

### Receiving Webhooks

To receive webhooks securely in a Webduh API route:

```typescript
import { verifyWebhookMiddleware, isDuplicateSignature } from '@/lib/webhook-security'
import { enrichWebhookData } from '@/lib/webhook-enrichment'

// Get webhook secret from environment
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'default-secret-change-this'

export async function POST(req: Request) {
  // Verify webhook with 5-minute timestamp validation
  const { isValid, payload, error } = await verifyWebhookMiddleware(
    req,
    WEBHOOK_SECRET,
    300 // 5-minute window as required by Amber
  )

  if (!isValid) {
    console.error('Invalid webhook signature', error)
    return new Response(JSON.stringify({ error: 'Invalid webhook' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Check for duplicate webhook (prevent replay attacks)
  const signature = req.headers.get('x-webhook-signature') || ''
  if (isDuplicateSignature(signature)) {
    return new Response(JSON.stringify({ message: 'Webhook already processed' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Process the webhook data
  const { event, data } = payload

  // Enrich data with metadata (Amber's requirement)
  const enrichedData = enrichWebhookData(
    data,
    ['webhook_source'],
    { defaultConfidenceScore: 80 }
  )

  // Process enriched data...

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}
```

### Sending Webhooks

To send secure webhooks from Webduh to external services:

```typescript
import { webhookManager, sendSignedWebhook } from '@/lib/webhook-sender'

// Register a webhook destination
webhookManager.addDestination(
  'service-123',
  'https://example.com/webhooks',
  'your-shared-secret'
)

// Send a webhook
await webhookManager.sendWebhookToDestination(
  'service-123',
  {
    event: 'data.updated',
    data: {
      id: '123',
      name: 'Example Data',
      timestamp: new Date().toISOString()
    }
  }
)

// Or use the one-off function
await sendSignedWebhook(
  'https://example.com/webhooks',
  'your-shared-secret',
  {
    event: 'one-time-event',
    data: { message: 'Hello world' }
  }
)
```

### Testing Webhooks

The webhook verification component can be used to test webhook connections:

```tsx
import { WebhookVerification } from '@/components/webhook-verification'

export default function WebhookSettingsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Webhook Settings</h1>

      <WebhookVerification
        webhookUrl="https://your-service.com/webhooks"
        endpointId="your-service"
        onGenerateSecret={(secret) => {
          // Save the secret to your backend or display it to the user
          console.log('Generated secret:', secret)
        }}
      />
    </div>
  )
}
```

## Data Enrichment Format

As required by David and Amber, all webhook data is enriched with the following structure:

```json
{
  "row": {
    "cells": {
      "AI Startup": {
        "value": "Cognosys",
        "metadata": {
          "sources": ["URL1", "URL2"],
          "confidenceScore": 85,
          "additionalDetails": "Context about this data"
        }
      },
      "CEO": {
        "value": "Sully Omar",
        "metadata": {
          "sources": ["LinkedIn Profile"],
          "confidenceScore": 90,
          "additionalDetails": "Details about the CEO"
        }
      }
    },
    "id": "sr_SOMEID"
  },
  "processed_at": "2023-06-15T12:34:56Z",
  "webhook_id": "wh_123456"
}
```

## Webhook Security Best Practices

Following David's guidelines:

1. **Secret Management**: Store webhook secrets securely in environment variables
2. **HTTPS Only**: Never use unencrypted HTTP for webhook endpoints
3. **NTP Synchronization**: Ensure servers have accurate clocks (required for timestamp validation)
4. **Idempotency**: Design webhook handlers to be idempotent (safe to execute multiple times)
5. **Monitoring**: Track webhook activity for unusual patterns or failures

## Internal Implementation Details

- **Signature Generation**: HMAC-SHA256 based on timestamp and payload
- **Clock Sync Detection**: Automatically checks system clock synchronization
- **Duplicate Detection**: Uses an in-memory cache with automatic cleanup
- **Metadata Enrichment**: Automatically calculates confidence scores based on source quality
- **UI Components**: Provides visual feedback on webhook security status

## Documentation

For complete documentation, see [docs/webhook-security.md](docs/webhook-security.md)
