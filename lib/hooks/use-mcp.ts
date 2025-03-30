import { useState, useEffect } from 'react'
import { getMCPClient, MCPTool } from '@/lib/mcp/client'

interface UseMCPOptions {
  onToolCall?: (toolName: string, params: any, result: any) => void
  onMessage?: (message: any) => void
  autoConnect?: boolean
}

/**
 * React hook for using the Model Context Protocol in components
 */
export function useMCP(options: UseMCPOptions = {}) {
  const [client, setClient] = useState<any>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [activeCells, setActiveCells] = useState<{ id: string; meta: any }[]>(
    []
  )

  // Connect to MCP server
  const connect = async () => {
    if (isConnected || isConnecting) return

    setIsConnecting(true)
    setError(null)

    try {
      const mcpClient = await getMCPClient()
      setClient(mcpClient)
      setIsConnected(true)

      // Add global message handler
      mcpClient.onMessage((message: any) => {
        if (options.onMessage) {
          options.onMessage(message)
        }
      })
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error('Failed to connect to MCP server')
      )
      console.error('MCP connection error:', err)
    } finally {
      setIsConnecting(false)
    }
  }

  // Disconnect from MCP server
  const disconnect = () => {
    if (client) {
      // Clean up registered handlers
      client.disconnect?.()
      setClient(null)
      setIsConnected(false)
    }
  }

  // Register a tool with the MCP client
  const registerTool = (tool: MCPTool) => {
    if (!client) return false

    try {
      client.registerTool(tool.name, async (params: any) => {
        // Execute the tool's function
        const result = await tool.execute(params)

        // Call the onToolCall callback if provided
        if (options.onToolCall) {
          options.onToolCall(tool.name, params, result)
        }

        return result
      })

      return true
    } catch (err) {
      console.error(`Error registering tool ${tool.name}:`, err)
      return false
    }
  }

  // Register multiple tools at once
  const registerTools = (tools: MCPTool[]) => {
    return tools.map((tool) => registerTool(tool))
  }

  // Send a prompt to the MCP server
  const sendPrompt = async (
    promptId: string,
    parameters: Record<string, any> = {}
  ) => {
    if (!client) throw new Error('MCP client not connected')

    try {
      return await client.sendPrompt({
        id: promptId,
        parameters,
      })
    } catch (err) {
      console.error(`Error sending prompt ${promptId}:`, err)
      throw err
    }
  }

  // Inhabit a cell or component with AI
  const inhabit = async (id: string, meta: any = {}) => {
    if (!client) throw new Error('MCP client not connected')

    try {
      // Check if already inhabited
      if (activeCells.some((cell) => cell.id === id)) {
        return false
      }

      // Add to active cells
      setActiveCells([...activeCells, { id, meta }])

      // Send inhabit prompt
      await sendPrompt('inhabit', {
        targetId: id,
        context: meta,
      })

      return true
    } catch (err) {
      console.error(`Error inhabiting ${id}:`, err)
      throw err
    }
  }

  // Release AI from a cell or component
  const release = async (id: string) => {
    if (!client) return false

    // Remove from active cells
    setActiveCells(activeCells.filter((cell) => cell.id !== id))

    // Send release prompt if client exists
    try {
      await sendPrompt('release', {
        targetId: id,
      })
      return true
    } catch (err) {
      console.error(`Error releasing ${id}:`, err)
      return false
    }
  }

  // Connect automatically if autoConnect is true
  useEffect(() => {
    if (options.autoConnect) {
      connect()
    }

    // Clean up on unmount
    return () => {
      disconnect()
    }
  }, [options.autoConnect])

  return {
    client,
    isConnected,
    isConnecting,
    error,
    activeCells,
    connect,
    disconnect,
    registerTool,
    registerTools,
    sendPrompt,
    inhabit,
    release,
  }
}
