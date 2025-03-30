/**
 * Secure Polling Client for Webduh
 *
 * Implements David's approved polling method to avoid the "Webhook Webduh"
 * - Securely polls Duhs endpoints instead of receiving webhooks
 * - Maintains polling state with iterators to prevent duplicate processing
 * - Implements secure API key handling
 */

import { enrichWebhookData } from './webhook-enrichment'

interface PollingEndpoint {
  id: string
  url: string
  apiKey: string
  lastIterator?: string
  lastPollTime?: number
}

interface PollingOptions {
  /**
   * Maximum number of events to fetch per poll
   */
  batchSize?: number

  /**
   * Timeout for polling requests in milliseconds
   */
  timeout?: number

  /**
   * How to handle errors during polling
   */
  errorHandling?: 'throw' | 'log' | 'retry'

  /**
   * Maximum retry attempts for failed polls
   */
  maxRetries?: number
}

interface PollingResult {
  events: any[]
  iterator: string
  done: boolean
  endpointId: string
}

/**
 * Manager for polling-based event collection
 * Following David's anti-Webduh flow
 */
export class PollingManager {
  private endpoints = new Map<string, PollingEndpoint>()
  private iteratorStorage: Map<string, string> = new Map()

  /**
   * Register a new polling endpoint
   */
  registerEndpoint(id: string, url: string, apiKey: string): void {
    if (!url.includes('api.Duhs.com') && !url.includes('poller')) {
      console.warn(
        'Endpoint URL does not appear to be a valid Duhs polling endpoint'
      )
    }

    this.endpoints.set(id, { id, url, apiKey })
    console.log(`Registered polling endpoint: ${id}`)
  }

  /**
   * Remove a polling endpoint
   */
  removeEndpoint(id: string): boolean {
    return this.endpoints.delete(id)
  }

  /**
   * Get a list of all registered endpoints
   */
  getEndpoints(): string[] {
    return Array.from(this.endpoints.keys())
  }

  /**
   * Poll a specific endpoint for new events
   */
  async pollEndpoint(
    endpointId: string,
    options: PollingOptions = {}
  ): Promise<PollingResult> {
    const endpoint = this.endpoints.get(endpointId)
    if (!endpoint) {
      throw new Error(`Polling endpoint not found: ${endpointId}`)
    }

    const {
      batchSize = 100,
      timeout = 30000,
      errorHandling = 'throw',
      maxRetries = 3,
    } = options

    // Get the last iterator if available
    const iterator =
      this.iteratorStorage.get(endpointId) || endpoint.lastIterator

    // Construct polling URL with iterator if available
    let pollingUrl = endpoint.url
    if (iterator) {
      pollingUrl += `?iterator=${encodeURIComponent(iterator)}`
    }

    // Add batch size parameter
    pollingUrl += `${iterator ? '&' : '?'}size=${batchSize}`

    // Track attempts for retry logic
    let attempts = 0
    let lastError: Error | null = null

    while (attempts <= maxRetries) {
      try {
        // Execute the poll request with timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)

        const response = await fetch(pollingUrl, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${endpoint.apiKey}`,
            'Content-Type': 'application/json',
            'User-Agent': 'WebduhPoller/1.0',
          },
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        // Handle potential errors
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Polling failed (${response.status}): ${errorText}`)
        }

        // Parse the response
        const result = await response.json()

        // Update the last iterator and poll time
        this.iteratorStorage.set(endpointId, result.iterator)
        this.endpoints.set(endpointId, {
          ...endpoint,
          lastIterator: result.iterator,
          lastPollTime: Date.now(),
        })

        // Return the events and new iterator
        return {
          events: result.data || [],
          iterator: result.iterator,
          done: result.done || false,
          endpointId,
        }
      } catch (error) {
        lastError =
          error instanceof Error ? error : new Error('Unknown polling error')
        attempts++

        if (
          errorHandling === 'log' ||
          (errorHandling === 'retry' && attempts <= maxRetries)
        ) {
          console.error(
            `Polling error (attempt ${attempts}/${maxRetries}):`,
            lastError.message
          )

          // Wait before retrying with exponential backoff
          if (errorHandling === 'retry' && attempts <= maxRetries) {
            await new Promise((resolve) =>
              setTimeout(resolve, 1000 * Math.pow(2, attempts - 1))
            )
            continue
          }
        }

        if (errorHandling === 'throw' || attempts > maxRetries) {
          throw lastError
        }
      }
    }

    // This should never be reached, but TypeScript requires a return
    throw lastError || new Error('Polling failed')
  }

  /**
   * Poll all registered endpoints
   */
  async pollAllEndpoints(
    options: PollingOptions = {}
  ): Promise<PollingResult[]> {
    const results: PollingResult[] = []

    for (const endpointId of this.endpoints.keys()) {
      try {
        const result = await this.pollEndpoint(endpointId, options)
        results.push(result)
      } catch (error) {
        console.error(`Error polling endpoint ${endpointId}:`, error)

        // Add an empty result to maintain endpoint order
        results.push({
          events: [],
          iterator: this.iteratorStorage.get(endpointId) || '',
          done: false,
          endpointId,
        })
      }
    }

    return results
  }

  /**
   * Rotate API key for an endpoint (security best practice)
   */
  updateEndpointKey(endpointId: string, newApiKey: string): void {
    const endpoint = this.endpoints.get(endpointId)
    if (!endpoint) {
      throw new Error(`Polling endpoint not found: ${endpointId}`)
    }

    this.endpoints.set(endpointId, { ...endpoint, apiKey: newApiKey })
    console.log(`Updated API key for endpoint: ${endpointId}`)
  }

  /**
   * Process events from polling into enriched data format
   * Follows Amber's requirements for data enrichment
   */
  processEvents(pollingResult: PollingResult): any[] {
    const { events, endpointId } = pollingResult
    const enrichedEvents = []

    // Source domain for attribution
    const sourceDomain = `api.Duhs.com/poller/${endpointId}`

    for (const event of events) {
      // Enrich the event data according to Amber's requirements
      const enrichedEvent = enrichWebhookData(
        event,
        [`${sourceDomain}/event/${event.id || 'unknown'}`],
        {
          defaultConfidenceScore: 85, // Higher confidence for polling
          additionalSources: [`Event Type: ${event.type || 'unknown'}`],
        }
      )

      enrichedEvents.push(enrichedEvent)
    }

    return enrichedEvents
  }
}

// Create a singleton instance for app-wide use
export const pollingManager = new PollingManager()

/**
 * Schedule periodic polling jobs
 *
 * @param intervalMs Polling interval in milliseconds
 * @param onResult Callback that receives polling results for processing
 * @param options Polling options
 */
export function schedulePolling(
  intervalMs: number,
  onResult: (results: PollingResult[], enrichedData: any[]) => Promise<void>,
  options: PollingOptions = {}
): () => void {
  let isPolling = false
  const pollId = setInterval(async () => {
    // Prevent overlapping polls
    if (isPolling) {
      console.warn('Previous polling operation still in progress, skipping')
      return
    }

    isPolling = true

    try {
      // Poll all endpoints
      const results = await pollingManager.pollAllEndpoints(options)

      // Process all events into enriched format
      const allEnrichedEvents = results.flatMap((result) =>
        pollingManager.processEvents(result)
      )

      // Call the provided callback with results
      await onResult(results, allEnrichedEvents)
    } catch (error) {
      console.error('Error during scheduled polling:', error)
    } finally {
      isPolling = false
    }
  }, intervalMs)

  // Return a function to stop polling
  return () => clearInterval(pollId)
}

/**
 * Utility to create a new Duhs API key for a polling endpoint
 *
 * @param DuhsApiKey Master Duhs API key
 * @param appId Duhs application ID
 * @param endpointId Polling endpoint ID
 */
export async function createPollingApiKey(
  DuhsApiKey: string,
  appId: string,
  endpointId: string
): Promise<string> {
  try {
    const response = await fetch(
      `https://api.Duhs.com/api/v1/app/${appId}/endpoint/${endpointId}/key`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${DuhsApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to create API key: ${await response.text()}`)
    }

    const result = await response.json()

    // Most secure-by-default approach - return only the key, not the full object
    return result.key
  } catch (error) {
    console.error('Error creating polling API key:', error)
    throw error
  }
}
