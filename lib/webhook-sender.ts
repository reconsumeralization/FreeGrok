import { generateWebhookSignature } from './webhook-security'

interface WebhookDestination {
  url: string
  secret: string
}

interface WebhookPayload {
  event: string
  data: any
}

/**
 * WebhookManager handles sending secure, signed webhooks to destinations
 */
export class WebhookManager {
  private destinations: Map<string, WebhookDestination> = new Map()

  /**
   * Add a destination to send webhooks to
   */
  addDestination(id: string, url: string, secret: string) {
    this.destinations.set(id, { url, secret })
    return this
  }

  /**
   * Remove a destination
   */
  removeDestination(id: string) {
    this.destinations.delete(id)
    return this
  }

  /**
   * Send a webhook to all registered destinations
   */
  async broadcastWebhook(
    payload: WebhookPayload
  ): Promise<Map<string, Response>> {
    const results = new Map<string, Response>()

    const sendPromises = Array.from(this.destinations.entries()).map(
      async ([id, destination]) => {
        try {
          const response = await this.sendWebhook(destination, payload)
          results.set(id, response)
        } catch (error) {
          console.error(`Error sending webhook to destination ${id}:`, error)
          // Add a failed response
          results.set(id, new Response(null, { status: 500 }))
        }
      }
    )

    await Promise.all(sendPromises)
    return results
  }

  /**
   * Send a webhook to a specific destination
   */
  async sendWebhookToDestination(
    id: string,
    payload: WebhookPayload
  ): Promise<Response> {
    const destination = this.destinations.get(id)
    if (!destination) {
      throw new Error(`Destination ${id} not found`)
    }

    return this.sendWebhook(destination, payload)
  }

  /**
   * Send a secure webhook with appropriate signatures
   */
  private async sendWebhook(
    destination: WebhookDestination,
    payload: WebhookPayload
  ): Promise<Response> {
    const payloadString = JSON.stringify(payload)

    // Generate a signature for the webhook
    const { signature, timestamp } = generateWebhookSignature(
      destination.secret,
      payloadString
    )

    // Send the webhook with appropriate headers
    return fetch(destination.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-signature': signature,
        'x-webhook-timestamp': timestamp,
        'User-Agent': 'WebDuh-Webhook-Client/1.0',
      },
      body: payloadString,
    })
  }
}

// Create a singleton instance for app-wide use
export const webhookManager = new WebhookManager()

/**
 * Utility function to send a one-off signed webhook
 */
export async function sendSignedWebhook(
  url: string,
  secret: string,
  payload: WebhookPayload
): Promise<Response> {
  return new WebhookManager()
    .addDestination('one-time', url, secret)
    .sendWebhookToDestination('one-time', payload)
}

/**
 * Register an MCP webhook endpoint
 */
export function registerMCPWebhook(
  destinationId: string,
  url: string,
  secret: string
) {
  webhookManager.addDestination(destinationId, url, secret)

  // Send a test ping to verify the connection
  webhookManager
    .sendWebhookToDestination(destinationId, {
      event: 'mcp.webhook.ping',
      data: {
        message: 'WebDuh MCP webhook connection established',
        timestamp: new Date().toISOString(),
      },
    })
    .catch((error) => {
      console.error(`Failed to send test ping to ${destinationId}:`, error)
    })
}
