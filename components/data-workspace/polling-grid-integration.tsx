'use client'

import { useState, useEffect, useCallback } from 'react'
import { AIGrid } from './ai-grid'
import {
  pollingManager,
  schedulePolling,
  PollingResult,
} from '@/lib/polling-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { EnrichedRow } from '@/lib/webhook-enrichment'
import {
  Settings,
  PlayCircle,
  PauseCircle,
  Clock,
  RotateCw,
  Save,
  PlusCircle,
  Trash2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'

/**
 * Configuration for a Poll-to-Grid integration
 */
interface PollGridConfig {
  id: string
  name: string
  pollingSources: {
    id: string
    url: string
    apiKey: string
  }[]
  gridAgents: {
    id: string
    name: string
    prompt: string
    inputs: string[]
    description?: string
  }[]
  pollIntervalMs: number
}

/**
 * Props for the PollToGridIntegration component
 */
interface PollToGridIntegrationProps {
  initialConfig?: PollGridConfig
  onConfigSave?: (config: PollGridConfig) => void
}

/**
 * The Polling Grid Integration component
 *
 * Combines Duhs's Polling Endpoints with AutoGrid-inspired AI-powered tables
 * Following David and Amber's anti-Webduh approach
 */
export function PollToGridIntegration({
  initialConfig,
  onConfigSave,
}: PollToGridIntegrationProps) {
  const [config, setConfig] = useState<PollGridConfig>(
    initialConfig || {
      id: `grid_${Date.now().toString(36)}`,
      name: 'New Data Grid',
      pollingSources: [],
      gridAgents: [],
      pollIntervalMs: 60000, // 1 minute default
    }
  )

  const [isPolling, setIsPolling] = useState(false)
  const [lastPollTime, setLastPollTime] = useState<Date | null>(null)
  const [pollStats, setPollStats] = useState<{
    totalEvents: number
    failedPolls: number
    successfulPolls: number
  }>({
    totalEvents: 0,
    failedPolls: 0,
    successfulPolls: 0,
  })

  const [gridData, setGridData] = useState<EnrichedRow[]>([])
  const [activeTab, setActiveTab] = useState('data')

  // Stop polling on unmount
  const [stopPollingFn, setStopPollingFn] = useState<(() => void) | null>(null)

  useEffect(() => {
    return () => {
      if (stopPollingFn) {
        stopPollingFn()
      }
    }
  }, [stopPollingFn])

  // Initialize polling sources
  useEffect(() => {
    if (config.pollingSources.length > 0) {
      // Register all polling endpoints
      config.pollingSources.forEach((source) => {
        pollingManager.registerEndpoint(source.id, source.url, source.apiKey)
      })
    }

    // Cleanup when config changes
    return () => {
      config.pollingSources.forEach((source) => {
        pollingManager.removeEndpoint(source.id)
      })
    }
  }, [config.pollingSources])

  // Handle poll results
  const handlePollResults = useCallback(
    async (results: PollingResult[], enrichedData: any[]) => {
      // Update last poll time
      setLastPollTime(new Date())

      // Count events
      const totalEvents = results.reduce(
        (total, result) => total + result.events.length,
        0
      )

      // Update poll stats
      setPollStats((prev) => ({
        totalEvents: prev.totalEvents + totalEvents,
        failedPolls:
          prev.failedPolls +
          results.filter((r) => r.events.length === 0).length,
        successfulPolls:
          prev.successfulPolls +
          results.filter((r) => r.events.length > 0).length,
      }))

      // Add new data to the grid
      if (enrichedData.length > 0) {
        setGridData((prev) => [...prev, ...enrichedData])
      }
    },
    []
  )

  // Start polling
  const startPolling = useCallback(() => {
    if (config.pollingSources.length === 0) {
      console.warn('No polling sources configured')
      return
    }

    // Stop any existing polling
    if (stopPollingFn) {
      stopPollingFn()
    }

    // Start new polling schedule
    const stopFn = schedulePolling(config.pollIntervalMs, handlePollResults, {
      errorHandling: 'retry',
      maxRetries: 3,
    })

    setStopPollingFn(() => stopFn)
    setIsPolling(true)
  }, [
    config.pollIntervalMs,
    config.pollingSources.length,
    handlePollResults,
    stopPollingFn,
  ])

  // Stop polling
  const stopPolling = useCallback(() => {
    if (stopPollingFn) {
      stopPollingFn()
      setStopPollingFn(null)
    }
    setIsPolling(false)
  }, [stopPollingFn])

  // Manually trigger a poll
  const pollNow = useCallback(async () => {
    try {
      // Poll all endpoints
      const results = await pollingManager.pollAllEndpoints()

      // Process events into enriched data
      const allEnrichedEvents = results.flatMap((result) =>
        pollingManager.processEvents(result)
      )

      // Handle the results
      await handlePollResults(results, allEnrichedEvents)
    } catch (error) {
      console.error('Error polling manually:', error)
    }
  }, [handlePollResults])

  // Add a new polling source
  const addPollingSource = () => {
    setConfig((prev) => ({
      ...prev,
      pollingSources: [
        ...prev.pollingSources,
        {
          id: `poll_${Date.now().toString(36)}`,
          url: '',
          apiKey: '',
        },
      ],
    }))
  }

  // Update a polling source
  const updatePollingSource = (index: number, field: string, value: string) => {
    setConfig((prev) => {
      const newSources = [...prev.pollingSources]
      newSources[index] = {
        ...newSources[index],
        [field]: value,
      }
      return {
        ...prev,
        pollingSources: newSources,
      }
    })
  }

  // Remove a polling source
  const removePollingSource = (index: number) => {
    setConfig((prev) => {
      const newSources = [...prev.pollingSources]
      // Remove the source from polling manager
      pollingManager.removeEndpoint(newSources[index].id)
      // Remove from config
      newSources.splice(index, 1)
      return {
        ...prev,
        pollingSources: newSources,
      }
    })
  }

  // Add a new grid agent
  const addGridAgent = () => {
    setConfig((prev) => ({
      ...prev,
      gridAgents: [
        ...prev.gridAgents,
        {
          id: `agent_${Date.now().toString(36)}`,
          name: 'New Agent',
          prompt: 'Analyze the input data and provide insights',
          inputs: [],
          description: 'A new AI agent for data analysis',
        },
      ],
    }))
  }

  // Update a grid agent
  const updateGridAgent = (index: number, field: string, value: any) => {
    setConfig((prev) => {
      const newAgents = [...prev.gridAgents]
      newAgents[index] = {
        ...newAgents[index],
        [field]: value,
      }
      return {
        ...prev,
        gridAgents: newAgents,
      }
    })
  }

  // Remove a grid agent
  const removeGridAgent = (index: number) => {
    setConfig((prev) => {
      const newAgents = [...prev.gridAgents]
      newAgents.splice(index, 1)
      return {
        ...prev,
        gridAgents: newAgents,
      }
    })
  }

  // Save configuration
  const saveConfig = () => {
    if (onConfigSave) {
      onConfigSave(config)
    }
  }

  // Clear grid data
  const clearGridData = () => {
    setGridData([])
    setPollStats({
      totalEvents: 0,
      failedPolls: 0,
      successfulPolls: 0,
    })
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{config.name}</CardTitle>
              <CardDescription>
                Anti-Webduh Polling + Grid Integration
              </CardDescription>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {lastPollTime
                    ? `Last poll: ${lastPollTime.toLocaleTimeString()}`
                    : 'No polls yet'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {isPolling ? (
                  <Button variant="outline" size="sm" onClick={stopPolling}>
                    <PauseCircle className="h-4 w-4 mr-2" />
                    Pause Polling
                  </Button>
                ) : (
                  <Button variant="default" size="sm" onClick={startPolling}>
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Start Polling
                  </Button>
                )}

                <Button variant="outline" size="sm" onClick={pollNow}>
                  <RotateCw className="h-4 w-4 mr-2" />
                  Poll Now
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="data">Data Grid</TabsTrigger>
              <TabsTrigger value="sources">
                Polling Sources
                <Badge className="ml-2" variant="outline">
                  {config.pollingSources.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="agents">
                Grid Agents
                <Badge className="ml-2" variant="outline">
                  {config.gridAgents.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="data" className="mt-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2">
                  <Badge variant="outline">
                    Events: {pollStats.totalEvents}
                  </Badge>
                  <Badge variant="outline">
                    Polls: {pollStats.successfulPolls} successful /{' '}
                    {pollStats.failedPolls} failed
                  </Badge>
                </div>

                <Button variant="outline" size="sm" onClick={clearGridData}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Data
                </Button>
              </div>

              <AIGrid
                title={config.name}
                initialData={gridData}
                agentColumns={config.gridAgents}
                autoRunAgents={true}
                onDataChange={(data) => setGridData(data)}
              />
            </TabsContent>

            <TabsContent value="sources" className="mt-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">
                    Polling Sources Configuration
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addPollingSource}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Source
                  </Button>
                </div>

                <div className="space-y-6">
                  {config.pollingSources.length === 0 ? (
                    <div className="text-center py-6 border rounded-md bg-muted/40">
                      <p className="text-muted-foreground">
                        No polling sources configured
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={addPollingSource}
                        className="mt-2"
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Your First Source
                      </Button>
                    </div>
                  ) : (
                    config.pollingSources.map((source, index) => (
                      <div
                        key={source.id}
                        className="border rounded-md p-4 space-y-4"
                      >
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">Source #{index + 1}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removePollingSource(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid gap-4">
                          <div className="grid grid-cols-4 gap-4">
                            <div className="space-y-2 col-span-1">
                              <Label htmlFor={`source-id-${index}`}>ID</Label>
                              <Input
                                id={`source-id-${index}`}
                                value={source.id}
                                onChange={(e) =>
                                  updatePollingSource(
                                    index,
                                    'id',
                                    e.target.value
                                  )
                                }
                                placeholder="Source ID"
                                readOnly
                              />
                            </div>

                            <div className="space-y-2 col-span-3">
                              <Label htmlFor={`source-url-${index}`}>
                                Polling URL
                              </Label>
                              <Input
                                id={`source-url-${index}`}
                                value={source.url}
                                onChange={(e) =>
                                  updatePollingSource(
                                    index,
                                    'url',
                                    e.target.value
                                  )
                                }
                                placeholder="https://api.Duhs.com/api/v1/app/.../poller/..."
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`source-apikey-${index}`}>
                              API Key
                            </Label>
                            <Input
                              id={`source-apikey-${index}`}
                              value={source.apiKey}
                              onChange={(e) =>
                                updatePollingSource(
                                  index,
                                  'apiKey',
                                  e.target.value
                                )
                              }
                              placeholder="sk_poll_..."
                              type="password"
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="poll-interval">
                      Poll Interval (milliseconds)
                    </Label>
                    <Input
                      id="poll-interval"
                      type="number"
                      value={config.pollIntervalMs}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          pollIntervalMs: parseInt(e.target.value, 10),
                        }))
                      }
                      min={5000}
                    />
                    <p className="text-xs text-muted-foreground">
                      Recommended: 60000ms (1 minute) or higher to avoid rate
                      limits
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="agents" className="mt-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">
                    Grid Agents Configuration
                  </h3>
                  <Button variant="outline" size="sm" onClick={addGridAgent}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Agent
                  </Button>
                </div>

                <div className="space-y-6">
                  {config.gridAgents.length === 0 ? (
                    <div className="text-center py-6 border rounded-md bg-muted/40">
                      <p className="text-muted-foreground">
                        No grid agents configured
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={addGridAgent}
                        className="mt-2"
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Your First Agent
                      </Button>
                    </div>
                  ) : (
                    config.gridAgents.map((agent, index) => (
                      <div
                        key={agent.id}
                        className="border rounded-md p-4 space-y-4"
                      >
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">{agent.name}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeGridAgent(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid gap-4">
                          <div className="grid grid-cols-4 gap-4">
                            <div className="space-y-2 col-span-1">
                              <Label htmlFor={`agent-id-${index}`}>ID</Label>
                              <Input
                                id={`agent-id-${index}`}
                                value={agent.id}
                                onChange={(e) =>
                                  updateGridAgent(index, 'id', e.target.value)
                                }
                                placeholder="Agent ID"
                                readOnly
                              />
                            </div>

                            <div className="space-y-2 col-span-3">
                              <Label htmlFor={`agent-name-${index}`}>
                                Name
                              </Label>
                              <Input
                                id={`agent-name-${index}`}
                                value={agent.name}
                                onChange={(e) =>
                                  updateGridAgent(index, 'name', e.target.value)
                                }
                                placeholder="Agent Name"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`agent-description-${index}`}>
                              Description
                            </Label>
                            <Input
                              id={`agent-description-${index}`}
                              value={agent.description || ''}
                              onChange={(e) =>
                                updateGridAgent(
                                  index,
                                  'description',
                                  e.target.value
                                )
                              }
                              placeholder="What this agent does"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`agent-prompt-${index}`}>
                              Agent Prompt
                            </Label>
                            <textarea
                              id={`agent-prompt-${index}`}
                              value={agent.prompt}
                              onChange={(e) =>
                                updateGridAgent(index, 'prompt', e.target.value)
                              }
                              placeholder="Instructions for the AI"
                              className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`agent-inputs-${index}`}>
                              Input Columns (comma separated)
                            </Label>
                            <Input
                              id={`agent-inputs-${index}`}
                              value={agent.inputs.join(', ')}
                              onChange={(e) =>
                                updateGridAgent(
                                  index,
                                  'inputs',
                                  e.target.value.split(',').map((s) => s.trim())
                                )
                              }
                              placeholder="email, domain, @companyInfo"
                            />
                            <p className="text-xs text-muted-foreground">
                              Use @ to reference other agent columns
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="flex justify-between items-center border-t pt-4">
          <p className="text-xs text-muted-foreground">
            David & Amber's Anti-Webduh System: Polling + Grid Integration
          </p>

          <Button onClick={saveConfig}>
            <Save className="h-4 w-4 mr-2" />
            Save Configuration
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
