# WebDuh Webhook Security

This document outlines the webhook security measures implemented in WebDuh to protect against impersonation and replay attacks.

## Why Secure Webhooks?

Webhooks are HTTP callbacks that deliver data to other applications in real-time. However, they present several security challenges:

1. **Impersonation Attacks**: Since webhooks are just HTTP requests from an external source, attackers can send fake webhooks to endpoints, impersonating legitimate services.

2. **Replay Attacks**: An attacker can intercept a valid webhook (with its signature) and replay it multiple times to trigger the same action repeatedly.

3. **Man-in-the-Middle Attacks**: Without proper security, webhooks could be intercepted and modified in transit.

## WebDuh's Security Approach

WebDuh uses a multi-layered approach to secure webhooks:

### 1. HMAC Signatures

Every webhook is signed using an HMAC-SHA256 signature generated from:
- A shared secret key (unique to each webhook destination)
- The request payload
- A timestamp of when the webhook was sent

The signature is included in the `x-webhook-signature` header.

### 2. Timestamp Verification

To prevent replay attacks, each webhook includes a timestamp in the `x-webhook-timestamp` header. The receiver verifies that:

- The timestamp is not too old (default: within the last 5 minutes)
- The timestamp is not in the future (which could indicate clock skew)

This ensures that even if an attacker captures a valid webhook, they cannot replay it after the time window expires.

### 3. Duplicate Detection

For additional protection against replay attacks within the valid time window, WebDuh maintains a short-term cache of recently seen webhook signatures. This prevents the same webhook from being processed multiple times.

## Implementation Details

### Sending Secure Webhooks

WebDuh sends webhooks with the following security headers:

```
x-webhook-signature: [HMAC signature]
x-webhook-timestamp: [Unix timestamp in seconds]
```

The signature is generated like this:

```typescript
const payload = JSON.stringify(webhookData);
const timestamp = Math.floor(Date.now() / 1000).toString();
const signedPayload = `${timestamp}.${payload}`;
const signature = createHmac('sha256', secret).update(signedPayload).digest('hex');
```

### Receiving Secure Webhooks

When receiving a webhook, WebDuh verifies it as follows:

1. Extract the `x-webhook-signature` and `x-webhook-timestamp` headers
2. Verify the timestamp is within the valid time window
3. Generate the expected signature using the shared secret
4. Compare the received signature with the expected signature using a constant-time comparison
5. Check if the signature has been seen recently (duplicate detection)
6. If all checks pass, process the webhook

## Registering Webhook Endpoints

External services can register webhook endpoints with WebDuh through the `/api/mcp/server?register_webhook` endpoint:

```typescript
// Example: Register a webhook endpoint
const response = await fetch('https://webduh.com/api/mcp/server?register_webhook', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    destinationId: 'unique-destination-id',
    callbackUrl: 'https://your-service.com/webhooks/mcp',
    clientSecret: 'your-shared-secret' // Optional, will use default if not provided
  })
});
```

## Webhook Security Best Practices

When working with webhooks in WebDuh:

1. **Keep secrets secure**: Never commit webhook secrets to version control or expose them in client-side code.

2. **Use HTTPS**: Always use HTTPS for webhook endpoints to prevent man-in-the-middle attacks.

3. **Validate all data**: Even after verifying signatures, validate the webhook payload data before processing.

4. **Implement idempotency**: Design webhook handlers to be idempotent (can be executed multiple times with the same result).

5. **Monitor for unusual activity**: Track webhook request patterns and alert on unusual volumes or failures.

6. **Set up NTP**: Ensure your servers use NTP to keep their clocks synchronized, as timestamp verification depends on accurate system clocks.

## Testing Webhook Security

WebDuh includes a test script to verify webhook security implementation:

```bash
ts-node scripts/test-webhook-security.ts
```

This script runs a series of tests to ensure that:
- Valid webhooks are accepted
- Invalid signatures are rejected
- Expired timestamps are rejected
- Future timestamps are rejected
- Incorrect secrets are rejected

## Webhook Events in WebDuh

WebDuh emits and listens for the following webhook events:

### MCP (Model Context Protocol) Events

| Event                    | Description                                     |
| ------------------------ | ----------------------------------------------- |
| `mcp.tool.execute`       | Triggered when an MCP tool is executed          |
| `mcp.resource.update`    | Triggered when an MCP resource is updated       |
| `mcp.session.created`    | Triggered when a new MCP session is created     |
| `mcp.session.completed`  | Triggered when an MCP session is completed      |
| `mcp.webhook.ping`       | Sent as a test when a new webhook is registered |
| `mcp.webhook.registered` | Confirmation that a webhook was registered      |
