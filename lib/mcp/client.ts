import { experimental_createMCPClient as createMCPClient } from 'ai'

// Define TypeScript types for MCP primitives
export interface MCPResource {
  id: string
  type: string
  content: any
  mimeType: string
}

export interface MCPTool {
  name: string
  description: string
  parameters: Record<string, any>
  execute: (params: any) => Promise<any>
}

export interface MCPPrompt {
  id: string
  title: string
  description: string
  parameters: Record<string, any>
}

// Create a singleton MCP client instance
let mcpClient: any = null

/**
 * Initialize the MCP client with specific transport (stdio or SSE)
 */
export async function initMCPClient(options: {
  transport: 'stdio' | 'sse'
  command?: string
  args?: string[]
  url?: string
}) {
  if (mcpClient) {
    return mcpClient
  }

  const transportConfig =
    options.transport === 'stdio'
      ? {
          type: 'stdio',
          command: options.command || 'python',
          args: options.args || ['scripts/mcp_server.py'],
        }
      : {
          type: 'sse',
          url: options.url || '/api/mcp/server',
        }

  mcpClient = await createMCPClient({
    transport: transportConfig,
  })

  return mcpClient
}

/**
 * Get MCP client instance (initializes with default settings if not already initialized)
 */
export async function getMCPClient() {
  if (!mcpClient) {
    // Default to SSE transport in browser environment
    return initMCPClient({
      transport: 'sse',
      url: '/api/mcp/server',
    })
  }
  return mcpClient
}

/**
 * WebDuh Data Grid Tools - AI can "inhabit" spreadsheet cells and manipulate data
 */
export const dataGridTools: MCPTool[] = [
  {
    name: 'update_cell',
    description: 'Update a cell in the data grid with a new value',
    parameters: {
      rowIndex: { type: 'number', description: 'Row index (zero-based)' },
      columnId: { type: 'string', description: 'Column ID' },
      value: { type: 'any', description: 'New cell value' },
    },
    execute: async (params) => {
      const { rowIndex, columnId, value } = params
      // This would be handled by the component that registers this tool
      return { success: true, rowIndex, columnId, value }
    },
  },
  {
    name: 'add_row',
    description: 'Add a new row to the data grid',
    parameters: {
      rowData: { type: 'object', description: 'Data for the new row' },
    },
    execute: async (params) => {
      const { rowData } = params
      return { success: true, rowData }
    },
  },
  {
    name: 'add_column',
    description: 'Add a new column to the data grid',
    parameters: {
      columnName: { type: 'string', description: 'Name of the new column' },
      columnType: {
        type: 'string',
        description: 'Type of the column (text, number, date, select, media)',
      },
    },
    execute: async (params) => {
      const { columnName, columnType } = params
      return { success: true, columnName, columnType }
    },
  },
  {
    name: 'analyze_data',
    description: 'Analyze data in the grid and return insights',
    parameters: {
      columns: { type: 'array', description: 'Columns to analyze' },
      analysisType: {
        type: 'string',
        description: 'Type of analysis (summary, trends, correlations)',
      },
    },
    execute: async (params) => {
      const { columns, analysisType } = params
      // This would call into our data analysis service
      return {
        success: true,
        insights: `Analysis of ${columns.join(', ')} showing ${analysisType}`,
        visualizationType: 'chart', // This could trigger a chart rendering in the UI
      }
    },
  },
  {
    name: 'enrich_data',
    description: 'Enrich data using external sources',
    parameters: {
      columnId: { type: 'string', description: 'Column ID to use as source' },
      enrichmentType: {
        type: 'string',
        description:
          'Type of enrichment (company_info, person_details, location_data)',
      },
    },
    execute: async (params) => {
      const { columnId, enrichmentType } = params
      return {
        success: true,
        message: `Enriched data using ${enrichmentType}`,
        newColumns: ['enriched_column_1', 'enriched_column_2'],
      }
    },
  },
]

/**
 * WebDuh Chart Tools - AI can "inhabit" chart components
 */
export const chartTools: MCPTool[] = [
  {
    name: 'create_chart',
    description: 'Create a new chart visualization',
    parameters: {
      chartType: {
        type: 'string',
        description: 'Type of chart (bar, line, pie, scatter)',
      },
      dataSource: { type: 'object', description: 'Data source for the chart' },
      options: { type: 'object', description: 'Chart configuration options' },
    },
    execute: async (params) => {
      const { chartType, dataSource, options } = params
      return { success: true, chartType, dataSource, options }
    },
  },
  {
    name: 'update_chart',
    description: 'Update an existing chart',
    parameters: {
      chartId: { type: 'string', description: 'ID of the chart to update' },
      changes: { type: 'object', description: 'Changes to apply to the chart' },
    },
    execute: async (params) => {
      const { chartId, changes } = params
      return { success: true, chartId, changes }
    },
  },
]

/**
 * WebDuh Finance Tools - AI can "inhabit" finance numbers and transactions
 */
export const financeTools: MCPTool[] = [
  {
    name: 'calculate_roi',
    description: 'Calculate return on investment',
    parameters: {
      investment: { type: 'number', description: 'Initial investment amount' },
      returns: { type: 'number', description: 'Return amount' },
      timeframe: { type: 'number', description: 'Investment time in years' },
    },
    execute: async (params) => {
      const { investment, returns, timeframe } = params
      const roi = ((returns - investment) / investment) * 100
      return {
        success: true,
        roi,
        annualizedRoi: roi / timeframe,
        message: `ROI is ${roi.toFixed(2)}% over ${timeframe} years`,
      }
    },
  },
  {
    name: 'forecast_revenue',
    description: 'Generate revenue forecast based on historical data',
    parameters: {
      historicalData: { type: 'array', description: 'Historical revenue data' },
      forecastPeriods: {
        type: 'number',
        description: 'Number of periods to forecast',
      },
    },
    execute: async (params) => {
      const { historicalData, forecastPeriods } = params
      // This would use a forecasting algorithm
      const forecast = Array(forecastPeriods)
        .fill(0)
        .map((_, i) => ({
          period: `Future ${i + 1}`,
          value: Math.random() * 1000, // Placeholder for actual forecasting
        }))
      return { success: true, forecast }
    },
  },
]

// Register all tools with names
export const allTools = {
  ...Object.fromEntries(dataGridTools.map((tool) => [tool.name, tool])),
  ...Object.fromEntries(chartTools.map((tool) => [tool.name, tool])),
  ...Object.fromEntries(financeTools.map((tool) => [tool.name, tool])),
}
