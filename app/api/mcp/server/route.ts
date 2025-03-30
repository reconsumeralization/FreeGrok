import { NextRequest } from 'next/server'
import { experimental_createMCPServer as createMCPServer } from 'ai'
import { dataGridTools, chartTools, financeTools } from '@/lib/mcp/client'
import { StreamingTextResponse } from 'ai'
import { webhookManager } from '@/lib/webhook-sender'

// Get webhook secret from environment
const WEBHOOK_SECRET =
  process.env.MCP_WEBHOOK_SECRET || 'default-secret-change-this'

// Handle webhook notifications for tools executed via MCP
const notifyToolExecution = async (
  toolName: string,
  parameters: any,
  result: any
) => {
  await webhookManager.broadcastWebhook({
    event: 'mcp.tool.execute',
    data: {
      toolName,
      parameters,
      result,
      timestamp: new Date().toISOString(),
    },
  })
}

// MCP Server implementation
export async function POST(req: NextRequest) {
  // Check for webhook registration request
  const url = new URL(req.url)
  if (url.searchParams.has('register_webhook')) {
    return handleWebhookRegistration(req)
  }

  // Create MCP server with all our registered tools
  const mcpServer = createMCPServer({
    // Use all the tools we defined with webhook notifications
    tools: [
      ...dataGridTools.map((tool) => ({
        ...tool,
        execute: async (params: any) => {
          // Execute the original tool
          const result = await tool.execute(params)

          // Send webhook notification about the execution
          await notifyToolExecution(tool.name, params, result)

          return result
        },
      })),
      ...chartTools,
      ...financeTools,
    ],
    // Define resources that can be made available to the model
    resources: [
      {
        id: 'data_schema',
        type: 'json',
        content: JSON.stringify({
          tables: [
            {
              name: 'Contacts',
              columns: [
                { id: 'name', type: 'text', label: 'Name' },
                { id: 'email', type: 'text', label: 'Email' },
                { id: 'company', type: 'text', label: 'Company' },
                { id: 'role', type: 'text', label: 'Role' },
                { id: 'status', type: 'select', label: 'Status' },
                { id: 'lastContacted', type: 'date', label: 'Last Contacted' },
              ],
            },
            {
              name: 'Deals',
              columns: [
                { id: 'name', type: 'text', label: 'Deal Name' },
                { id: 'value', type: 'number', label: 'Value' },
                { id: 'company', type: 'text', label: 'Company' },
                { id: 'stage', type: 'select', label: 'Stage' },
                { id: 'closingDate', type: 'date', label: 'Closing Date' },
                { id: 'owner', type: 'text', label: 'Owner' },
              ],
            },
          ],
        }),
        mimeType: 'application/json',
      },
    ],
    // Define prompts that can be executed by the model
    prompts: [
      {
        id: 'data_analysis',
        title: 'Analyze Data',
        description: 'Analyze the provided data and suggest insights',
        parameters: {
          data: {
            type: 'string',
            description: 'Data to analyze in CSV or JSON format',
          },
          goal: {
            type: 'string',
            description: 'Analysis goal',
          },
        },
      },
      {
        id: 'generate_report',
        title: 'Generate Report',
        description: 'Generate a report based on the provided data',
        parameters: {
          data: {
            type: 'string',
            description: 'Data to use for the report in CSV or JSON format',
          },
          reportType: {
            type: 'string',
            description: 'Type of report to generate',
          },
        },
      },
      {
        id: 'inhabit',
        title: 'Inhabit Component',
        description: 'Request AI to inhabit a specific component',
        parameters: {
          targetId: {
            type: 'string',
            description: 'ID of the component to inhabit',
          },
          context: {
            type: 'object',
            description: 'Context data for the inhabitation',
          },
        },
      },
      {
        id: 'release',
        title: 'Release Component',
        description: 'Request AI to release a component',
        parameters: {
          targetId: {
            type: 'string',
            description: 'ID of the component to release',
          },
        },
      },
    ],
    // Add hooks for session events
    onSessionStart: async (sessionId) => {
      // Notify webhooks about session start
      await webhookManager.broadcastWebhook({
        event: 'mcp.session.created',
        data: {
          sessionId,
          timestamp: new Date().toISOString(),
        },
      })
    },
    onSessionEnd: async (sessionId, stats) => {
      // Notify webhooks about session end
      await webhookManager.broadcastWebhook({
        event: 'mcp.session.completed',
        data: {
          sessionId,
          stats,
          timestamp: new Date().toISOString(),
        },
      })
    },
  })

  // Process the request
  const response = await mcpServer.handleRequest({
    request: req,
  })

  // Return streaming response
  return new StreamingTextResponse(response.body as ReadableStream)
}

/**
 * Handle webhook registration requests
 */
async function handleWebhookRegistration(req: NextRequest) {
  try {
    // Ensure this is a POST request
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Parse request body
    const body = await req.json()
    const { callbackUrl, destinationId, clientSecret } = body

    // Validate required fields
    if (!callbackUrl || !destinationId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Register the webhook
    webhookManager.addDestination(
      destinationId,
      callbackUrl,
      clientSecret || WEBHOOK_SECRET
    )

    // Send test webhook
    try {
      await webhookManager.sendWebhookToDestination(destinationId, {
        event: 'mcp.webhook.registered',
        data: {
          message: 'Webhook registration successful',
          timestamp: new Date().toISOString(),
        },
      })
    } catch (error) {
      console.warn(`Failed to send test webhook to ${destinationId}:`, error)
      // Continue anyway, as registration was successful
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Webhook registered successfully',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error handling webhook registration:', error)

    return new Response(
      JSON.stringify({
        error: 'Failed to register webhook',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

// MCP Server only responds to POST requests
export async function GET() {
  return new Response('Method not allowed. Use POST for MCP server requests.', {
    status: 405,
  })
}
