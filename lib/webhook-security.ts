import crypto from 'crypto'

interface WebhookVerificationOptions {
  /**
   * The secret key used to verify the webhook signature
   */
  secret: string

  /**
   * The signature from the webhook request headers
   */
  signature: string

  /**
   * The raw request body as a string
   */
  payload: string

  /**
   * The timestamp from the webhook headers
   */
  timestamp: string

  /**
   * The maximum age of the webhook in seconds (default: 300 - 5 minutes)
   * Follows Amber's requirement for Webduh to reject webhooks older than 5 minutes
   */
  tolerance?: number
}

/**
 * Verifies a webhook signature and timestamp to protect against impersonation and replay attacks
 *
 * Security measures enforced as per David and Amber's Webduh requirements:
 * 1. Timestamp validation with configurable tolerance (default 5 min)
 * 2. HMAC-SHA256 signature verification
 * 3. Constant-time comparison to prevent timing attacks
 *
 * @returns {boolean} Whether the webhook is valid
 * @throws {Error} If the webhook is invalid
 */
export function verifyWebhookSignature({
  secret,
  signature,
  payload,
  timestamp,
  tolerance = 300, // Default 5 minutes as required by Amber for Webduh
}: WebhookVerificationOptions): boolean {
  // Step 1: Verify timestamp to prevent replay attacks
  const currentTimestamp = Math.floor(Date.now() / 1000)
  const webhookTimestamp = parseInt(timestamp, 10)

  // Check if timestamp is too old or in the future
  if (Math.abs(currentTimestamp - webhookTimestamp) > tolerance) {
    throw new Error(
      `Webhook timestamp is outside of the ${tolerance}s tolerance window`
    )
  }

  // Step 2: Compute the expected signature
  // Format: timestamp.payload
  const signedPayload = `${timestamp}.${payload}`
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex')

  // Step 3: Use constant-time comparison to prevent timing attacks
  try {
    // Ensure signatures are of equal length for proper comparison
    if (signature.length !== expectedSignature.length) {
      throw new Error('Webhook signature length mismatch')
    }

    if (
      !crypto.timingSafeEqual(
        Buffer.from(signature, 'utf8'),
        Buffer.from(expectedSignature, 'utf8')
      )
    ) {
      throw new Error('Webhook signature verification failed')
    }
  } catch (error) {
    // Handle any errors in the comparison process
    if (
      error instanceof Error &&
      error.message === 'Webhook signature length mismatch'
    ) {
      throw error
    }
    throw new Error('Webhook signature verification failed')
  }

  return true
}

/**
 * Middleware function to verify webhooks in a Next.js API route
 */
export async function verifyWebhookMiddleware(
  req: Request,
  secret: string,
  tolerance: number = 300 // Default to 5 minutes as per Amber's requirements
) {
  // Get signature and timestamp from headers
  const signature = req.headers.get('x-webhook-signature') || ''
  const timestamp = req.headers.get('x-webhook-timestamp') || ''

  // Get the raw request body
  const payload = await req.text()

  try {
    // Ensure required headers are present
    if (!signature || !timestamp) {
      throw new Error('Missing required webhook security headers')
    }

    verifyWebhookSignature({
      secret,
      signature,
      payload,
      timestamp,
      tolerance,
    })

    // Return the parsed JSON payload for convenience
    return {
      isValid: true,
      payload: JSON.parse(payload),
      error: null,
    }
  } catch (error) {
    return {
      isValid: false,
      payload: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Utility to generate a webhook signature (useful for testing)
 */
export function generateWebhookSignature(
  secret: string,
  payload: string,
  timestamp = Math.floor(Date.now() / 1000).toString()
): { signature: string; timestamp: string } {
  const signedPayload = `${timestamp}.${payload}`
  const signature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex')

  return { signature, timestamp }
}

/**
 * Stores seen signatures to prevent duplicate webhooks (extended replay protection)
 * Note: In production, this should use Redis or another distributed cache
 */
const seenSignatures = new Map<string, number>()

/**
 * Cleanup old signatures every hour
 */
const SIGNATURE_EXPIRY = 3600 // 1 hour
setInterval(() => {
  const now = Math.floor(Date.now() / 1000)
  for (const [signature, timestamp] of seenSignatures.entries()) {
    if (now - timestamp > SIGNATURE_EXPIRY) {
      seenSignatures.delete(signature)
    }
  }
}, 1000 * 60 * 10) // Run cleanup every 10 minutes

/**
 * Checks if a signature has been seen before (preventing duplicate webhooks)
 * This provides an additional layer of protection against replay attacks
 * beyond the timestamp validation
 */
export function isDuplicateSignature(signature: string): boolean {
  const now = Math.floor(Date.now() / 1000)

  if (seenSignatures.has(signature)) {
    return true
  }

  // Store the signature with the current timestamp
  seenSignatures.set(signature, now)
  return false
}

/**
 * Generate a secure webhook secret
 * Useful for creating new webhook endpoints
 */
export function generateWebhookSecret(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex')
}

/**
 * Check if the system clock is synchronized enough for reliable timestamp validation
 * Webduh requires accurate system time for webhook security
 */
export async function checkClockSync(): Promise<{
  isSynced: boolean
  drift: number
}> {
  try {
    // Fetch time from a reliable NTP-like service
    const response = await fetch('https://worldtimeapi.org/api/ip')
    const data = await response.json()

    // Calculate drift between local and server time
    const serverTime = new Date(data.utc_datetime).getTime()
    const localTime = Date.now()
    const drift = Math.abs(serverTime - localTime)

    // Consider synced if drift is less than 5 seconds
    return {
      isSynced: drift < 5000,
      drift,
    }
  } catch (error) {
    // If we can't check, assume the worst
    console.error('Failed to check clock synchronization:', error)
    return {
      isSynced: false,
      drift: -1,
    }
  }
}
