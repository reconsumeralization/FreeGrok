'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { getMCPClient } from '@/lib/mcp/client'

interface AIContextType {
  isConnected: boolean
  isAIEnabled: boolean
  enableAI: () => void
  disableAI: void
  activeCells: { id: string; meta: any }[]
  registerTool: (name: string, handler: (params: any) => Promise<any>) => void
  unregisterTool: (name: string) => void
}

const AIContext = createContext<AIContextType | null>(null)

export function AIProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<any>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isAIEnabled, setIsAIEnabled] = useState(false)
  const [activeCells, setActiveCells] = useState<{ id: string; meta: any }[]>(
    []
  )
  const [registeredTools, setRegisteredTools] = useState<
    Record<string, (params: any) => Promise<any>>
  >({})

  // Initialize MCP client
  useEffect(() => {
    if (isAIEnabled && !client) {
      const initMCP = async () => {
        try {
          const mcpClient = await getMCPClient()

          // Listen for cell activation/deactivation
          mcpClient.onMessage((message: any) => {
            if (message.type === 'inhabit' && message.targetId) {
              setActiveCells((prev) => [
                ...prev,
                { id: message.targetId, meta: message.context || {} },
              ])
            } else if (message.type === 'release' && message.targetId) {
              setActiveCells((prev) =>
                prev.filter((cell) => cell.id !== message.targetId)
              )
            }
          })

          setClient(mcpClient)
          setIsConnected(true)
        } catch (error) {
          console.error('Failed to initialize MCP client:', error)
          setIsConnected(false)
        }
      }

      initMCP()
    }
  }, [isAIEnabled, client])

  // Register all tools whenever they change
  useEffect(() => {
    if (client && isConnected) {
      // Register all tools
      Object.entries(registeredTools).forEach(([name, handler]) => {
        client.registerTool(name, handler)
      })
    }
  }, [client, isConnected, registeredTools])

  const enableAI = () => {
    setIsAIEnabled(true)
  }

  const disableAI = () => {
    setIsAIEnabled(false)
    // Close MCP connection if exists
    if (client) {
      setClient(null)
      setIsConnected(false)
      setActiveCells([])
    }
  }

  const registerTool = (
    name: string,
    handler: (params: any) => Promise<any>
  ) => {
    setRegisteredTools((prev) => ({
      ...prev,
      [name]: handler,
    }))

    // If already connected, register immediately
    if (client && isConnected) {
      client.registerTool(name, handler)
    }
  }

  const unregisterTool = (name: string) => {
    setRegisteredTools((prev) => {
      const updated = { ...prev }
      delete updated[name]
      return updated
    })

    // If connected, unregister from client
    if (client && isConnected) {
      client.unregisterTool?.(name)
    }
  }

  const value = {
    isConnected,
    isAIEnabled,
    enableAI,
    disableAI,
    activeCells,
    registerTool,
    unregisterTool,
  }

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>
}

export function useAI() {
  const context = useContext(AIContext)
  if (!context) {
    throw new Error('useAI must be used within an AIProvider')
  }
  return context
}
