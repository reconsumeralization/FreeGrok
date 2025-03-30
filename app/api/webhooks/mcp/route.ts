import { NextRequest, NextResponse } from 'next/server'
import {
  verifyWebhookMiddleware,
  isDuplicateSignature,
} from '@/lib/webhook-security'
import {
  enrichWebhookData,
  calculateConfidenceScore,
} from '@/lib/webhook-enrichment'

// Get webhook secret from environment variables
const WEBHOOK_SECRET =
  process.env.MCP_WEBHOOK_SECRET || 'default-secret-change-this'

// Stricter tolerance window as required by Amber - 5 minutes maximum
const TIMESTAMP_TOLERANCE = 300 // 5 minutes in seconds

/**
 * Secure webhook handler for processing MCP-related events
 *
 * Following David and Amber's standards for Webduh:
 * - Enforces strict timestamp validation (5 minute window)
 * - Prevents replay attacks through signature tracking
 * - Enriches data with required metadata structure
 */
export async function POST(req: NextRequest) {
  // 1. Verify webhook signature with strict timestamp validation
  const { isValid, payload, error } = await verifyWebhookMiddleware(
    req,
    WEBHOOK_SECRET,
    TIMESTAMP_TOLERANCE // Enforce Amber's 5-minute rule
  )

  if (!isValid) {
    console.error('Invalid webhook signature', error)
    return NextResponse.json(
      { error: 'Invalid webhook signature' },
      { status: 401 }
    )
  }

  // 2. Extract event details from payload
  const { event, data } = payload
  const signature = req.headers.get('x-webhook-signature') || ''
  const sourceDomain = new URL(
    req.headers.get('referer') || req.headers.get('origin') || 'unknown'
  ).hostname

  // 3. Check for duplicate webhook (prevent replay attacks)
  if (isDuplicateSignature(signature)) {
    console.warn('Duplicate webhook received', { event })
    return NextResponse.json(
      { message: 'Webhook already processed' },
      { status: 200 }
    )
  }

  // 4. Process different webhook events
  try {
    // Track processing time for logging
    const startTime = Date.now()
    let enrichedData: any = null

    switch (event) {
      case 'mcp.tool.execute':
        // Handle remote tool execution requests
        enrichedData = await handleToolExecution(data, sourceDomain)
        break

      case 'mcp.resource.update':
        // Handle resource update notifications
        enrichedData = await handleResourceUpdate(data, sourceDomain)
        break

      case 'mcp.session.created':
        // Handle new MCP session creation
        enrichedData = await handleSessionCreated(data, sourceDomain)
        break

      case 'mcp.session.completed':
        // Handle session completion
        enrichedData = await handleSessionCompleted(data, sourceDomain)
        break

      default:
        console.warn('Unhandled webhook event type', { event })
        return NextResponse.json(
          { message: `Unhandled event type: ${event}` },
          { status: 400 }
        )
    }

    const processingTime = Date.now() - startTime
    console.log(`Webhook processed in ${processingTime}ms`, {
      event,
      dataSize: JSON.stringify(data).length,
      enrichedSize: enrichedData ? JSON.stringify(enrichedData).length : 0,
    })

    // 5. Return success response with enriched data
    return NextResponse.json(
      {
        message: 'Webhook processed successfully',
        enriched_data: enrichedData,
        processing_time_ms: processingTime,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error processing webhook', {
      event,
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    return NextResponse.json(
      { error: 'Error processing webhook' },
      { status: 500 }
    )
  }
}

/**
 * Handle tool execution requests from external MCP services
 */
async function handleToolExecution(
  data: any,
  sourceDomain: string
): Promise<any> {
  const { toolName, parameters, sessionId } = data

  // Log the tool execution request
  console.log('Tool execution request', { toolName, sessionId })

  // Sources to attribute this data to
  const sources = [`${sourceDomain}/tool/${toolName}`]

  // Apply metadata enrichment to parameters
  const enrichedData = enrichWebhookData(parameters, sources, {
    defaultConfidenceScore: calculateConfidenceScore(sources, parameters),
    additionalSources: [`Session: ${sessionId || 'unknown'}`],
  })

  // Execute the tool based on the toolName
  // This could involve calling the functions in your MCP client
  // or interacting with your database

  // For example, if we're updating data in a grid:
  if (toolName === 'update_cell' && parameters.rowIndex !== undefined) {
    // Update cell data in your database
    // Example: await db.updateCell(parameters.rowIndex, parameters.columnId, parameters.value);
  }

  return enrichedData
}

/**
 * Handle resource update notifications
 */
async function handleResourceUpdate(
  data: any,
  sourceDomain: string
): Promise<any> {
  const { resourceId, contentType, content } = data

  // Log the resource update
  console.log('Resource update', { resourceId, contentType })

  // Sources to attribute this data to
  const sources = [`${sourceDomain}/resource/${resourceId}`]

  // Apply metadata enrichment to content
  const enrichedData = enrichWebhookData(
    typeof content === 'string' ? { content } : content,
    sources,
    {
      defaultConfidenceScore: calculateConfidenceScore(sources, content),
      additionalDetails: `Resource type: ${contentType || 'unknown'}`,
    }
  )

  // Update the resource in your system
  // Example: await db.updateResource(resourceId, enrichedData);

  return enrichedData
}

/**
 * Handle new MCP session creation events
 */
async function handleSessionCreated(
  data: any,
  sourceDomain: string
): Promise<any> {
  const { sessionId, userId, contextData } = data

  // Log the session creation
  console.log('MCP session created', { sessionId, userId })

  // Sources to attribute this data to
  const sources = [`${sourceDomain}/session/${sessionId}`]

  // Apply metadata enrichment
  const enrichedData = enrichWebhookData(
    {
      sessionId,
      userId,
      ...(contextData || {}),
    },
    sources,
    {
      defaultConfidenceScore: 90, // High confidence for system events
      additionalDetails: `Session started at ${new Date().toISOString()}`,
    }
  )

  // Store the session in your database or state management
  // Example: await db.createSession(sessionId, userId, enrichedData);

  return enrichedData
}

/**
 * Handle MCP session completion events
 */
async function handleSessionCompleted(
  data: any,
  sourceDomain: string
): Promise<any> {
  const { sessionId, stats } = data

  // Log the session completion
  console.log('MCP session completed', { sessionId, stats })

  // Sources to attribute this data to
  const sources = [`${sourceDomain}/session/${sessionId}/completed`]

  // Apply metadata enrichment
  const enrichedData = enrichWebhookData(
    {
      sessionId,
      stats: stats || {},
      completedAt: new Date().toISOString(),
    },
    sources,
    {
      defaultConfidenceScore: 95, // Very high confidence for completion events
      additionalDetails: `Session duration: ${
        stats?.durationMs || 'unknown'
      }ms`,
    }
  )

  // Update the session status in your database
  // Example: await db.completeSession(sessionId, enrichedData);

  return enrichedData
}
