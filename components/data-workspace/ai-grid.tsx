'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Progress } from '@/components/ui/progress'
import {
  ChevronDown,
  ChevronUp,
  Code,
  Filter,
  RefreshCw,
  Sparkles,
  AlertCircle,
  Info,
  Link2,
  Loader2,
} from 'lucide-react'
import {
  EnrichedRow,
  EnrichedCell,
  WebduhMetadata,
} from '@/lib/webhook-enrichment'

/**
 * Types for defining AI agent columns in the Grid Webduh
 */
interface AIAgentConfig {
  /** Unique identifier for the agent */
  id: string

  /** Display name for the column */
  name: string

  /** Instructions for the AI to follow when generating content */
  prompt: string

  /**
   * Input columns this agent requires
   * Can reference other columns with @ syntax
   */
  inputs: string[]

  /** API endpoint for the agent */
  endpoint?: string

  /** Additional features the agent supports */
  features?: {
    scraping?: boolean
    databaseAccess?: boolean
    calculationEngine?: boolean
    dataSummary?: boolean
  }

  /** Description of what this agent does (for users) */
  description?: string
}

/**
 * Props for the AIGrid component
 */
interface AIGridProps {
  /** Title for the grid */
  title: string

  /** Initial data rows */
  initialData?: EnrichedRow[]

  /** Configuration for AI agent columns */
  agentColumns: AIAgentConfig[]

  /** ID of the event source for this grid */
  sourceId?: string

  /** Whether to automatically run agents on new data */
  autoRunAgents?: boolean

  /** Maximum number of rows to display (for performance) */
  maxRows?: number

  /** Callback when data in the grid changes */
  onDataChange?: (data: EnrichedRow[]) => void

  /** Callback when an agent completes processing */
  onAgentComplete?: (agentId: string, rows: EnrichedRow[]) => void
}

/**
 * State for representing running agents
 */
interface AgentRunState {
  agentId: string
  progress: number
  status: 'idle' | 'running' | 'success' | 'error'
  message?: string
  startTime?: number
  endTime?: number
}

/**
 * The AIGrid component ("Grid Webduh") - AutoGrid-inspired AI-powered table
 *
 * Following Amber's requirements:
 * - Each column is an AI agent with specific behavior
 * - Results must include sources and confidence scores
 * - Cells show data enrichment status
 */
export function AIGrid({
  title,
  initialData = [],
  agentColumns,
  sourceId = 'unknown',
  autoRunAgents = false,
  maxRows = 100,
  onDataChange,
  onAgentComplete,
}: AIGridProps) {
  // State for grid data and agent status
  const [rows, setRows] = useState<EnrichedRow[]>(initialData)
  const [runningAgents, setRunningAgents] = useState<
    Record<string, AgentRunState>
  >({})
  const [sortConfig, setSortConfig] = useState<{
    column: string
    direction: 'asc' | 'desc'
  } | null>(null)
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [expandAllMetadata, setExpandAllMetadata] = useState(false)

  // Column IDs including both data and agent columns
  const allColumnIds = useMemo(() => {
    const dataColumnIds = rows.length > 0 ? Object.keys(rows[0].cells) : []

    // Combine data columns with agent columns while avoiding duplicates
    const agentColumnIds = agentColumns.map((col) => col.id)
    return Array.from(new Set([...dataColumnIds, ...agentColumnIds]))
  }, [rows, agentColumns])

  // Map agent columns by ID for easy reference
  const agentColumnsMap = useMemo(() => {
    return agentColumns.reduce((acc, agent) => {
      acc[agent.id] = agent
      return acc
    }, {} as Record<string, AIAgentConfig>)
  }, [agentColumns])

  // Handle new data being added to the grid
  useEffect(() => {
    if (initialData.length > 0) {
      setRows((prev) => {
        // Merge new data with existing, avoiding duplicates by ID
        const existing = new Map(prev.map((row) => [row.id, row]))

        initialData.forEach((row) => {
          if (existing.has(row.id)) {
            // Update existing row
            const existingRow = existing.get(row.id)!
            existing.set(row.id, {
              ...existingRow,
              cells: { ...existingRow.cells, ...row.cells },
            })
          } else {
            // Add new row
            existing.set(row.id, row)
          }
        })

        return Array.from(existing.values())
      })

      // Auto-run agents if enabled
      if (autoRunAgents) {
        agentColumns.forEach((agent) => {
          runAgent(agent.id)
        })
      }
    }
  }, [initialData, autoRunAgents, agentColumns])

  // Filter and sort rows
  const displayRows = useMemo(() => {
    // Apply filters
    let filtered = rows

    if (Object.keys(filters).length > 0) {
      filtered = rows.filter((row) => {
        return Object.entries(filters).every(([column, filterValue]) => {
          const cell = row.cells[column]
          if (!cell || !filterValue) return true
          return cell.value.toLowerCase().includes(filterValue.toLowerCase())
        })
      })
    }

    // Apply sorting
    if (sortConfig) {
      filtered = [...filtered].sort((a, b) => {
        const aCell = a.cells[sortConfig.column]
        const bCell = b.cells[sortConfig.column]

        const aValue = aCell?.value || ''
        const bValue = bCell?.value || ''

        if (sortConfig.direction === 'asc') {
          return aValue.localeCompare(bValue)
        } else {
          return bValue.localeCompare(aValue)
        }
      })
    }

    // Limit the number of rows for performance
    return filtered.slice(0, maxRows)
  }, [rows, filters, sortConfig, maxRows])

  // Notify on data changes
  useEffect(() => {
    if (onDataChange) {
      onDataChange(rows)
    }
  }, [rows, onDataChange])

  // Handle sorting
  const handleSort = (column: string) => {
    setSortConfig((prev) => {
      if (prev?.column === column) {
        return {
          column,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        }
      }
      return { column, direction: 'asc' }
    })
  }

  // Handle filtering
  const handleFilterChange = (column: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [column]: value,
    }))
  }

  // Toggle expanded row
  const toggleRowExpanded = (rowId: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(rowId)) {
        newSet.delete(rowId)
      } else {
        newSet.add(rowId)
      }
      return newSet
    })
  }

  // Run an AI agent on the data
  const runAgent = async (agentId: string) => {
    const agent = agentColumnsMap[agentId]
    if (!agent) return

    // Track agent run state
    setRunningAgents((prev) => ({
      ...prev,
      [agentId]: {
        agentId,
        progress: 0,
        status: 'running',
        startTime: Date.now(),
      },
    }))

    // Process each row with this agent
    const updatedRows = [...rows]
    let processedCount = 0

    try {
      for (const [index, row] of updatedRows.entries()) {
        // Gather input data from required columns
        const inputs: Record<string, string> = {}

        for (const inputColumn of agent.inputs) {
          // Handle @ references to other columns
          if (inputColumn.startsWith('@')) {
            const referencedColumn = inputColumn.substring(1)
            const cellValue = row.cells[referencedColumn]?.value

            if (cellValue) {
              inputs[referencedColumn] = cellValue
            }
          } else if (row.cells[inputColumn]) {
            // Direct column reference
            inputs[inputColumn] = row.cells[inputColumn].value
          }
        }

        // Skip if required inputs are missing
        if (Object.keys(inputs).length < agent.inputs.length) {
          continue
        }

        try {
          // Mock API call to AI agent endpoint
          // In production, replace with actual API call to LLM or agent service
          const result = await mockAgentCall(agent, inputs)

          // Update row with agent results
          updatedRows[index] = {
            ...row,
            cells: {
              ...row.cells,
              [agent.id]: {
                value: result.value,
                metadata: result.metadata,
              },
            },
          }

          // Update progress
          processedCount++
          const progress = Math.round(
            (processedCount / updatedRows.length) * 100
          )

          setRunningAgents((prev) => ({
            ...prev,
            [agentId]: {
              ...prev[agentId],
              progress,
            },
          }))

          // Small delay to avoid UI freezing and to simulate real processing time
          await new Promise((resolve) => setTimeout(resolve, 100))
        } catch (error) {
          console.error(
            `Error processing row ${row.id} with agent ${agent.id}:`,
            error
          )
        }
      }

      // Update rows state with processed data
      setRows(updatedRows)

      // Update agent status to success
      setRunningAgents((prev) => ({
        ...prev,
        [agentId]: {
          ...prev[agentId],
          status: 'success',
          progress: 100,
          endTime: Date.now(),
          message: `Processed ${processedCount} rows`,
        },
      }))

      // Notify completion
      if (onAgentComplete) {
        onAgentComplete(agentId, updatedRows)
      }
    } catch (error) {
      console.error(`Error running agent ${agentId}:`, error)

      // Update agent status to error
      setRunningAgents((prev) => ({
        ...prev,
        [agentId]: {
          ...prev[agentId],
          status: 'error',
          endTime: Date.now(),
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      }))
    }
  }

  // Run all agents
  const runAllAgents = () => {
    agentColumns.forEach((agent) => {
      runAgent(agent.id)
    })
  }

  // Reset all filters
  const resetFilters = () => {
    setFilters({})
    setSortConfig(null)
  }

  // Toggle expanded state for all rows
  const toggleAllRows = () => {
    if (expandedRows.size === displayRows.length) {
      setExpandedRows(new Set())
    } else {
      setExpandedRows(new Set(displayRows.map((row) => row.id)))
    }
  }

  // Render cell with enriched metadata
  const renderCell = (cell: EnrichedCell | undefined, columnId: string) => {
    if (!cell) {
      // Cell has no data
      const isAgentColumn = agentColumnsMap[columnId]

      if (isAgentColumn) {
        // Agent column that hasn't been run yet
        return (
          <div className="flex items-center justify-center text-muted-foreground">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => runAgent(columnId)}
              disabled={!!runningAgents[columnId]?.status === 'running'}
            >
              {runningAgents[columnId]?.status === 'running' ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-1" />
              )}
              Run
            </Button>
          </div>
        )
      }

      return <span className="text-muted-foreground">—</span>
    }

    // Format confidence score indicator
    const getConfidenceColor = (score: number) => {
      if (score >= 90) return 'bg-green-500'
      if (score >= 70) return 'bg-blue-500'
      if (score >= 50) return 'bg-yellow-500'
      return 'bg-red-500'
    }

    return (
      <div className="space-y-1">
        <div className="font-medium">{cell.value}</div>

        {(expandAllMetadata || expandedRows.has(cell.metadata.id)) && (
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex items-center gap-1">
              <div
                className={`w-2 h-2 rounded-full ${getConfidenceColor(
                  cell.metadata.confidenceScore
                )}`}
              />
              <span>Confidence: {cell.metadata.confidenceScore}%</span>
            </div>

            {cell.metadata.sources && cell.metadata.sources.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {cell.metadata.sources.map((source, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="text-xs px-1 py-0"
                  >
                    {source.includes('http') ? (
                      <Link2 className="h-3 w-3 mr-1" />
                    ) : null}
                    {source.length > 20
                      ? `${source.substring(0, 18)}...`
                      : source}
                  </Badge>
                ))}
              </div>
            )}

            {cell.metadata.additionalDetails && (
              <div className="text-xs italic">
                {cell.metadata.additionalDetails}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">{title}</h2>

        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExpandAllMetadata(!expandAllMetadata)}
                >
                  <Info className="h-4 w-4 mr-1" />
                  {expandAllMetadata ? 'Hide Details' : 'Show All Details'}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {expandAllMetadata
                  ? 'Hide metadata for all cells'
                  : 'Show sources and confidence scores for all cells'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button
            variant="outline"
            size="sm"
            onClick={runAllAgents}
            disabled={Object.values(runningAgents).some(
              (a) => a.status === 'running'
            )}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Run All Agents
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={resetFilters}
            disabled={Object.keys(filters).length === 0 && !sortConfig}
          >
            <Filter className="h-4 w-4 mr-1" />
            Reset Filters
          </Button>

          <Badge variant="outline">{displayRows.length} rows</Badge>
        </div>
      </div>

      {/* Agent Status Bar */}
      {Object.keys(runningAgents).length > 0 && (
        <div className="space-y-2">
          {Object.values(runningAgents).map((agent) => (
            <div key={agent.agentId} className="space-y-1">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center">
                  <span className="font-medium mr-2">
                    {agentColumnsMap[agent.agentId]?.name || agent.agentId}
                  </span>
                  <Badge
                    variant={
                      agent.status === 'running'
                        ? 'secondary'
                        : agent.status === 'success'
                        ? 'default'
                        : agent.status === 'error'
                        ? 'destructive'
                        : 'outline'
                    }
                  >
                    {agent.status}
                  </Badge>
                </div>

                {agent.message && (
                  <span className="text-xs text-muted-foreground">
                    {agent.message}
                  </span>
                )}

                {agent.endTime && agent.startTime && (
                  <span className="text-xs text-muted-foreground">
                    {((agent.endTime - agent.startTime) / 1000).toFixed(2)}s
                  </span>
                )}
              </div>

              <Progress value={agent.progress} className="h-1" />
            </div>
          ))}
        </div>
      )}

      {/* Main Grid Table */}
      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleAllRows}
                  className="h-6 w-6 p-0"
                >
                  {expandedRows.size === displayRows.length ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </TableHead>

              {allColumnIds.map((columnId) => {
                const isAgentColumn = !!agentColumnsMap[columnId]

                return (
                  <TableHead key={columnId}>
                    <div className="space-y-1">
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => handleSort(columnId)}
                      >
                        <span
                          className={
                            isAgentColumn ? 'font-medium flex items-center' : ''
                          }
                        >
                          {isAgentColumn && (
                            <Sparkles className="h-3 w-3 mr-1" />
                          )}
                          {agentColumnsMap[columnId]?.name || columnId}
                        </span>

                        {sortConfig?.column === columnId &&
                          (sortConfig.direction === 'asc' ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          ))}
                      </div>

                      <Input
                        placeholder="Filter..."
                        value={filters[columnId] || ''}
                        onChange={(e) =>
                          handleFilterChange(columnId, e.target.value)
                        }
                        className="h-7 text-xs"
                      />

                      {isAgentColumn && (
                        <div className="flex justify-between items-center text-xs">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => runAgent(columnId)}
                            className="h-6 px-2 text-xs"
                            disabled={
                              !!runningAgents[columnId]?.status === 'running'
                            }
                          >
                            {runningAgents[columnId]?.status === 'running' ? (
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            ) : (
                              <RefreshCw className="h-3 w-3 mr-1" />
                            )}
                            Run
                          </Button>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2"
                                >
                                  <Info className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="space-y-1 max-w-md">
                                  <p className="font-medium">
                                    {agentColumnsMap[columnId]?.name}
                                  </p>
                                  <p className="text-xs">
                                    {agentColumnsMap[columnId]?.description}
                                  </p>
                                  <p className="text-xs italic">
                                    Inputs:{' '}
                                    {agentColumnsMap[columnId]?.inputs.join(
                                      ', '
                                    )}
                                  </p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      )}
                    </div>
                  </TableHead>
                )
              })}
            </TableRow>
          </TableHeader>

          <TableBody>
            {displayRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={allColumnIds.length + 1}
                  className="h-24 text-center"
                >
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              displayRows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleRowExpanded(row.id)}
                      className="h-6 w-6 p-0"
                    >
                      {expandedRows.has(row.id) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>

                  {allColumnIds.map((columnId) => (
                    <TableCell key={columnId}>
                      {renderCell(row.cells[columnId], columnId)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

/**
 * Mock API call to an AI agent (for demo purposes)
 * In production, this would be replaced with actual calls to AI services
 */
async function mockAgentCall(
  agent: AIAgentConfig,
  inputs: Record<string, string>
): Promise<{ value: string; metadata: WebduhMetadata }> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 700))

  // Generate mock response based on agent type and inputs
  let result = ''
  let confidenceScore = 70 + Math.round(Math.random() * 20)
  const sources = [`agent://${agent.id}`]

  switch (agent.id) {
    case 'companyInfo':
      if (inputs.domain) {
        const domain = inputs.domain.toLowerCase()
        if (domain.includes('linkedin')) {
          result = 'LinkedIn Corporation'
          confidenceScore = 95
          sources.push('https://linkedin.com/company/info')
        } else if (domain.includes('google')) {
          result = 'Alphabet Inc.'
          confidenceScore = 95
          sources.push('https://google.com/about')
        } else {
          result = `Company for ${domain}`
          confidenceScore = 60
        }
      } else {
        result = 'Unknown Company'
        confidenceScore = 30
      }
      break

    case 'riskScore':
      const amount = inputs.amount ? parseFloat(inputs.amount) : 0
      if (amount > 1000) {
        result = 'High Risk'
        confidenceScore = 85
      } else if (amount > 500) {
        result = 'Medium Risk'
        confidenceScore = 75
      } else {
        result = 'Low Risk'
        confidenceScore = 90
      }
      sources.push('internal://risk-model-v2.3')
      break

    case 'leadQualification':
      if (inputs.email && inputs.companyInfo) {
        const hasGoodDomain =
          inputs.email.includes('.com') ||
          inputs.email.includes('.org') ||
          inputs.email.includes('.io')

        if (hasGoodDomain && inputs.companyInfo.length > 5) {
          result = 'Qualified Lead'
          confidenceScore = 80
        } else {
          result = 'Needs Qualification'
          confidenceScore = 65
        }

        sources.push('crm://lead-scoring-algorithm')
        if (inputs.email) {
          sources.push(`email://${inputs.email.split('@')[1]}`)
        }
      } else {
        result = 'Insufficient Data'
        confidenceScore = 40
      }
      break

    default:
      // Generic response for other agent types
      result = `AI analysis based on ${Object.keys(inputs).join(', ')}`

      // Add random sources based on inputs
      Object.entries(inputs).forEach(([key, value]) => {
        if (value.includes('http')) {
          sources.push(value)
        } else if (value.includes('@')) {
          sources.push(`contact://${value}`)
        } else if (value.length > 10) {
          sources.push(`analysis://${key}`)
        }
      })
  }

  return {
    value: result,
    metadata: {
      sources,
      confidenceScore,
      additionalDetails: `Generated by agent ${
        agent.id
      } at ${new Date().toISOString()}`,
    },
  }
}
