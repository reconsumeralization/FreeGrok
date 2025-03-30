'use client'

import { useState, useEffect, useRef } from 'react'
import { useChat } from 'ai/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  PlusCircle,
  Save,
  Music,
  Image,
  FileText,
  Trash,
  Share2,
  MessageSquare,
  HelpCircle,
  ChevronDown,
  SparkleIcon,
  BarChart,
  Wand2,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createBrowserClient } from '@/lib/supabase'
import { getMCPClient, dataGridTools, chartTools } from '@/lib/mcp/client'
import { Badge } from '@/components/ui/badge'
import { useMCP } from '@/lib/hooks/use-mcp'
import { AIInhabit } from '@/components/ui/ai-inhabit'

type DataRow = Record<string, any>
type Column = {
  id: string
  name: string
  type: 'text' | 'number' | 'date' | 'select' | 'media'
  options?: string[]
}

interface DataGridProps {
  initialData?: DataRow[]
  initialColumns?: Column[]
  workspaceId?: string
  workspaceName?: string
  userId: string
  userName: string
  userImage?: string
  collaborators?: {
    id: string
    name: string
    image?: string
    role: string
  }[]
  onSave?: (data: DataRow[], columns: Column[]) => Promise<void>
}

export function DataGrid({
  initialData = [],
  initialColumns = [{ id: 'col1', name: 'Column 1', type: 'text' }],
  workspaceId,
  workspaceName = 'Untitled Workspace',
  userId,
  userName,
  userImage,
  collaborators = [],
  onSave,
}: DataGridProps) {
  const [data, setData] = useState<DataRow[]>(initialData)
  const [columns, setColumns] = useState<Column[]>(initialColumns)
  const [activeCell, setActiveCell] = useState<{
    rowIndex: number
    colId: string
  } | null>(null)
  const [editValue, setEditValue] = useState<string>('')
  const [workspaceTile, setWorkspaceTitle] = useState(workspaceName)
  const [selectedMedia, setSelectedMedia] = useState<string[]>([])
  const [showAiAssistant, setShowAiAssistant] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isAiActive, setIsAiActive] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const cellRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // Use the MCP hook instead of direct client management
  const {
    isConnected,
    connect,
    activeCells: mcpActiveCells,
    inhabit,
    release,
    registerTools,
    sendPrompt,
  } = useMCP({
    onToolCall: (toolName, params, result) => {
      // Handle tool execution results
      if (toolName === 'update_cell' && result.success) {
        const { rowIndex, columnId, value } = params
        const newData = [...data]
        if (!newData[rowIndex]) {
          newData[rowIndex] = {}
        }
        newData[rowIndex][columnId] = value
        setData(newData)
      } else if (toolName === 'add_row' && result.success) {
        addRow(params.rowData)
      } else if (toolName === 'add_column' && result.success) {
        const { columnName, columnType } = params
        addColumn(columnName, columnType)
      } else if (toolName === 'analyze_data' && result.success) {
        // Show analysis results
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'assistant',
            content: result.insights,
          },
        ])
      }
    },
    autoConnect: true,
  })

  // Map MCP active cells to our active AI cells format
  const aiActiveCells = mcpActiveCells
    .filter((cell) => cell.id.startsWith('cell-'))
    .map((cell) => {
      const [_, rowIndex, colId] = cell.id.split('-')
      return {
        rowIndex: parseInt(rowIndex, 10),
        colId,
      }
    })

  // Initialize MCP tools when connected
  useEffect(() => {
    if (isConnected) {
      // Register all our data grid tools
      registerTools(dataGridTools)
    }
  }, [isConnected, registerTools])

  // AI chat integration
  const { messages, input, handleInputChange, handleSubmit, setMessages } =
    useChat({
      api: '/api/integrations/data-workspace',
      body: {
        data,
        columns: columns.map((col) => col.name),
        workspaceId,
      },
      onFinish: () => {
        // You could update a summary or insights panel here
      },
    })

  // Load media from Supabase
  const [media, setMedia] = useState<any[]>([])

  // Initialize Supabase client
  const [supabase, setSupabase] = useState<any>(null)

  useEffect(() => {
    const initSupabase = async () => {
      const client = await createBrowserClient()
      setSupabase(client)
    }

    initSupabase()
  }, [])

  // Your existing supabase related code, ensuring we check if supabase is initialized
  useEffect(() => {
    if (!supabase) return

    const loadMedia = async () => {
      const { data: mediaData, error } = await supabase
        .from('media')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (mediaData && !error) {
        setMedia(mediaData)
      }
    }

    loadMedia()
  }, [supabase, userId])

  // Add a new column
  const addColumn = (name?: string, type: string = 'text') => {
    const newColumnId = `col${columns.length + 1}`
    setColumns([
      ...columns,
      {
        id: newColumnId,
        name: name || `Column ${columns.length + 1}`,
        type: type as any,
      },
    ])

    // Update data with new column
    setData(data.map((row) => ({ ...row, [newColumnId]: '' })))
  }

  // Add a new row
  const addRow = (rowData?: Record<string, any>) => {
    const newRow: DataRow = { ...rowData } || {}
    columns.forEach((col) => {
      if (!newRow[col.id]) {
        newRow[col.id] = ''
      }
    })
    setData([...data, newRow])
  }

  // Handle cell click
  const handleCellClick = (rowIndex: number, colId: string) => {
    if (activeCell?.rowIndex === rowIndex && activeCell.colId === colId) {
      return
    }

    setActiveCell({ rowIndex, colId })

    // Set edit value
    if (data[rowIndex]) {
      setEditValue(data[rowIndex][colId]?.toString() || '')
    }
  }

  // Toggle AI in a cell
  const toggleAiInCell = (rowIndex: number, colId: string) => {
    const cellId = `cell-${rowIndex}-${colId}`
    const isCurrentlyActive = aiActiveCells.some(
      (cell) => cell.rowIndex === rowIndex && cell.colId === colId
    )

    if (isCurrentlyActive) {
      // Release AI from cell
      release(cellId)
    } else {
      // Inhabit cell with AI
      inhabit(cellId, {
        rowIndex,
        columnId: colId,
        currentValue: data[rowIndex]?.[colId] || '',
        columnName: columns.find((col) => col.id === colId)?.name || '',
        workspaceData: data,
        columnDefinitions: columns,
      })
    }
  }

  // Handle value change
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value)
  }

  // Save cell value on blur or enter
  const saveCell = () => {
    if (!activeCell) return

    const { rowIndex, colId } = activeCell
    const newData = [...data]

    if (!newData[rowIndex]) {
      newData[rowIndex] = {}
    }

    newData[rowIndex][colId] = editValue
    setData(newData)
    setActiveCell(null)
  }

  // Handle key press in cells
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      saveCell()
    } else if (e.key === 'Tab') {
      e.preventDefault()
      saveCell()

      if (!activeCell) return

      const { rowIndex, colId } = activeCell
      const currentColIndex = columns.findIndex((col) => col.id === colId)

      // Move to next cell or next row
      if (currentColIndex < columns.length - 1) {
        // Move to next column in same row
        setActiveCell({ rowIndex, colId: columns[currentColIndex + 1].id })
      } else if (rowIndex < data.length - 1) {
        // Move to first column in next row
        setActiveCell({ rowIndex: rowIndex + 1, colId: columns[0].id })
      } else {
        // Add a new row and focus on its first cell
        addRow()
        setActiveCell({ rowIndex: data.length, colId: columns[0].id })
      }
    }
  }

  // Save the workspace
  const saveWorkspace = async () => {
    if (onSave) {
      setIsSaving(true)
      try {
        await onSave(data, columns)
      } catch (error) {
        console.error('Failed to save workspace:', error)
      } finally {
        setIsSaving(false)
      }
    }
  }

  // Analyze data with AI
  const analyzeData = async () => {
    setIsAnalyzing(true)
    try {
      // Use MCP to analyze data
      await sendPrompt('data_analysis', {
        data: JSON.stringify(data),
        goal: 'Provide a comprehensive analysis of this dataset',
      })
    } catch (error) {
      console.error('Failed to analyze data:', error)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Sorry, I encountered an error analyzing your data.',
        },
      ])
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Focus on active cell when it changes
  useEffect(() => {
    if (activeCell) {
      const cellId = `cell-${activeCell.rowIndex}-${activeCell.colId}`
      const cellElement = cellRefs.current[cellId]

      if (cellElement) {
        const inputElement = cellElement.querySelector('input')
        if (inputElement) {
          inputElement.focus()
        }
      }
    }
  }, [activeCell])

  return (
    <div className="flex flex-col h-full">
      <div className="border-b px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Input
            value={workspaceTile}
            onChange={(e) => setWorkspaceTitle(e.target.value)}
            className="font-semibold border-none text-lg focus-visible:ring-0 max-w-[300px]"
            onBlur={saveWorkspace}
          />
          <div className="flex -space-x-2">
            <Avatar className="h-8 w-8 border-2 border-background">
              <AvatarImage src={userImage} alt={userName} />
              <AvatarFallback>
                {userName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {collaborators.slice(0, 3).map((user) => (
              <Avatar
                key={user.id}
                className="h-8 w-8 border-2 border-background"
              >
                <AvatarImage src={user.image} alt={user.name} />
                <AvatarFallback>
                  {user.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
            {collaborators.length > 3 && (
              <Avatar className="h-8 w-8 border-2 border-background">
                <AvatarFallback>+{collaborators.length - 3}</AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setIsAiActive(!isAiActive)}
            variant={isAiActive ? 'default' : 'outline'}
            className="gap-2"
          >
            <SparkleIcon className="h-4 w-4" />
            {isAiActive ? 'AI Active' : 'Activate AI'}
          </Button>

          <Button
            onClick={analyzeData}
            variant="outline"
            className="gap-2"
            disabled={isAnalyzing}
          >
            <BarChart className="h-4 w-4" />
            {isAnalyzing ? 'Analyzing...' : 'Analyze Data'}
          </Button>

          <Button
            onClick={() => setShowAiAssistant(!showAiAssistant)}
            variant={showAiAssistant ? 'default' : 'outline'}
            className="gap-2"
          >
            <HelpCircle className="h-4 w-4" />
            AI Assistant
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share Workspace</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Workspace Link</p>
                  <div className="flex">
                    <Input
                      readOnly
                      value={`${window.location.origin}/workspace/${workspaceId}`}
                      className="flex-1 mr-2"
                    />
                    <Button>Copy</Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button onClick={saveWorkspace} disabled={isSaving} className="gap-2">
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div
          className={`flex-1 overflow-auto ${
            showAiAssistant ? 'border-r' : ''
          }`}
        >
          <div className="p-4">
            <div className="bg-background rounded-lg border shadow-sm">
              <div className="overflow-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      {columns.map((column) => (
                        <th
                          key={column.id}
                          className="h-10 px-4 text-left align-middle font-medium text-muted-foreground"
                        >
                          <div className="flex items-center justify-between">
                            <Input
                              value={column.name}
                              onChange={(e) => {
                                const newColumns = columns.map((col) =>
                                  col.id === column.id
                                    ? { ...col, name: e.target.value }
                                    : col
                                )
                                setColumns(newColumns)
                              }}
                              className="h-7 px-2 text-sm font-medium border-none focus-visible:ring-1"
                              onBlur={saveWorkspace}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                            >
                              <ChevronDown className="h-3 w-3" />
                            </Button>
                          </div>
                        </th>
                      ))}
                      <th className="w-10 px-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => addColumn()}
                        >
                          <PlusCircle className="h-4 w-4" />
                        </Button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-b">
                        {columns.map((column) => (
                          <td
                            key={`${rowIndex}-${column.id}`}
                            className="p-2"
                            onClick={() => handleCellClick(rowIndex, column.id)}
                          >
                            {isAiActive ? (
                              <AIInhabit
                                id={`cell-${rowIndex}-${column.id}`}
                                indicatorPosition="top-right"
                                context={{
                                  rowIndex,
                                  columnId: column.id,
                                  currentValue:
                                    data[rowIndex]?.[column.id] || '',
                                  columnName: column.name,
                                  workspaceData: data,
                                  columnDefinitions: columns,
                                }}
                              >
                                <div
                                  ref={(el) =>
                                    (cellRefs.current[
                                      `cell-${rowIndex}-${column.id}`
                                    ] = el)
                                  }
                                  className="min-h-[32px] p-1 rounded-sm"
                                >
                                  {activeCell?.rowIndex === rowIndex &&
                                  activeCell.colId === column.id ? (
                                    <Input
                                      value={editValue}
                                      onChange={handleValueChange}
                                      onBlur={saveCell}
                                      onKeyDown={handleKeyDown}
                                      className="p-1 h-8 border-none focus-visible:ring-1"
                                      autoFocus
                                    />
                                  ) : (
                                    <div className="p-1">
                                      {column.type === 'media' &&
                                      row[column.id] ? (
                                        <div className="flex items-center gap-1">
                                          {row[column.id].type === 'image' ? (
                                            <Image className="h-4 w-4" />
                                          ) : row[column.id].type ===
                                            'audio' ? (
                                            <Music className="h-4 w-4" />
                                          ) : (
                                            <FileText className="h-4 w-4" />
                                          )}
                                          <span className="truncate text-sm">
                                            {row[column.id].title ||
                                              row[column.id].url}
                                          </span>
                                        </div>
                                      ) : (
                                        row[column.id] || ''
                                      )}
                                    </div>
                                  )}
                                </div>
                              </AIInhabit>
                            ) : (
                              <div
                                ref={(el) =>
                                  (cellRefs.current[
                                    `cell-${rowIndex}-${column.id}`
                                  ] = el)
                                }
                                className="min-h-[32px] p-1 rounded-sm"
                              >
                                {activeCell?.rowIndex === rowIndex &&
                                activeCell.colId === column.id ? (
                                  <Input
                                    value={editValue}
                                    onChange={handleValueChange}
                                    onBlur={saveCell}
                                    onKeyDown={handleKeyDown}
                                    className="p-1 h-8 border-none focus-visible:ring-1"
                                    autoFocus
                                  />
                                ) : (
                                  <div className="p-1">
                                    {column.type === 'media' &&
                                    row[column.id] ? (
                                      <div className="flex items-center gap-1">
                                        {row[column.id].type === 'image' ? (
                                          <Image className="h-4 w-4" />
                                        ) : row[column.id].type === 'audio' ? (
                                          <Music className="h-4 w-4" />
                                        ) : (
                                          <FileText className="h-4 w-4" />
                                        )}
                                        <span className="truncate text-sm">
                                          {row[column.id].title ||
                                            row[column.id].url}
                                        </span>
                                      </div>
                                    ) : (
                                      row[column.id] || ''
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                        ))}
                        <td className="w-10 p-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100"
                            onClick={() => {
                              const newData = [...data]
                              newData.splice(rowIndex, 1)
                              setData(newData)
                            }}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="p-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground"
                    onClick={() => addRow()}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add new row
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {showAiAssistant && (
          <div className="w-80 flex flex-col border-l">
            <Tabs defaultValue="chat">
              <TabsList className="w-full">
                <TabsTrigger value="chat" className="flex-1">
                  Chat
                </TabsTrigger>
                <TabsTrigger value="media" className="flex-1">
                  Media
                </TabsTrigger>
                <TabsTrigger value="comments" className="flex-1">
                  Comments
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="flex flex-col h-full">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          AI Assistant
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Ask me anything about your data
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">
                          I can help you analyze your data, create charts, or
                          suggest insights. Try asking:
                        </p>
                        <ul className="text-sm mt-2 space-y-1 list-disc pl-4">
                          <li>Summarize this data</li>
                          <li>Find trends in column X</li>
                          <li>Calculate average of column Y</li>
                        </ul>
                      </CardContent>
                    </Card>

                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.role === 'user'
                            ? 'justify-end'
                            : 'justify-start'
                        }`}
                      >
                        <div
                          className={`rounded-lg px-3 py-2 max-w-[80%] ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">
                            {message.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="p-4 border-t">
                  <form
                    onSubmit={handleSubmit}
                    className="flex items-center space-x-2"
                  >
                    <Input
                      placeholder="Ask about your data..."
                      value={input}
                      onChange={handleInputChange}
                      className="flex-1"
                    />
                    <Button type="submit" size="icon">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </TabsContent>

              <TabsContent
                value="media"
                className="h-full overflow-hidden flex flex-col"
              >
                <ScrollArea className="flex-1 p-4">
                  <div className="grid grid-cols-2 gap-2">
                    {media.map((item) => (
                      <Card
                        key={item.id}
                        className={`cursor-pointer ${
                          selectedMedia.includes(item.id)
                            ? 'ring-2 ring-primary'
                            : ''
                        }`}
                        onClick={() => {
                          if (selectedMedia.includes(item.id)) {
                            setSelectedMedia(
                              selectedMedia.filter((id) => id !== item.id)
                            )
                          } else {
                            setSelectedMedia([...selectedMedia, item.id])
                          }
                        }}
                      >
                        <div className="aspect-square relative overflow-hidden rounded-t-lg">
                          {item.type === 'IMAGE' ? (
                            <img
                              src={item.url}
                              alt={item.title || 'Media'}
                              className="object-cover w-full h-full"
                            />
                          ) : item.type === 'AUDIO' ? (
                            <div className="flex items-center justify-center h-full bg-muted/50">
                              <Music className="h-10 w-10 text-muted-foreground" />
                            </div>
                          ) : item.type === 'VIDEO' ? (
                            <div className="flex items-center justify-center h-full bg-muted/50">
                              <FileText className="h-10 w-10 text-muted-foreground" />
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-full bg-muted/50">
                              <FileText className="h-10 w-10 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <CardFooter className="text-xs truncate p-2">
                          {item.title || 'Untitled'}
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>

                <div className="p-4 border-t">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      // Add selected media to active cell
                      if (activeCell && selectedMedia.length > 0) {
                        const { rowIndex, colId } = activeCell
                        const newData = [...data]

                        if (!newData[rowIndex]) {
                          newData[rowIndex] = {}
                        }

                        // Find media item
                        const mediaItem = media.find(
                          (m) => m.id === selectedMedia[0]
                        )
                        if (mediaItem) {
                          newData[rowIndex][colId] = mediaItem
                          setData(newData)
                          setSelectedMedia([])
                        }
                      }
                    }}
                  >
                    Insert Selected Media
                  </Button>
                </div>
              </TabsContent>

              <TabsContent
                value="comments"
                className="h-full overflow-hidden flex flex-col"
              >
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No comments yet. Start a conversation about this
                      workspace.
                    </p>
                  </div>
                </ScrollArea>

                <div className="p-4 border-t">
                  <form className="flex items-center space-x-2">
                    <Input placeholder="Add a comment..." className="flex-1" />
                    <Button size="icon">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  )
}
