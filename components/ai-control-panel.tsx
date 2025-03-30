'use client'

import { useState, useEffect } from 'react'
import { useAI } from '@/components/providers/ai-provider'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Sparkles, Power, Zap, Activity, Brain, Settings } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

interface AIControlPanelProps {
  className?: string
  minimized?: boolean
}

export function AIControlPanel({
  className,
  minimized = false,
}: AIControlPanelProps) {
  const { isAIEnabled, enableAI, disableAI, isConnected, activeCells } = useAI()
  const [isMinimized, setIsMinimized] = useState(minimized)

  // Display status of inhabited components
  const activeCellCount = activeCells.length

  // Toggle AI globally
  const toggleAI = () => {
    if (isAIEnabled) {
      disableAI()
    } else {
      enableAI()
    }
  }

  // Toggle minimized state
  const toggleMinimized = () => {
    setIsMinimized(!isMinimized)
  }

  if (isMinimized) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isAIEnabled ? 'default' : 'outline'}
              size="icon"
              className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg z-50"
              onClick={toggleMinimized}
            >
              <Sparkles
                className={`h-5 w-5 ${
                  isAIEnabled ? 'text-white' : 'text-muted-foreground'
                }`}
              />
              {activeCellCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {activeCellCount}
                </Badge>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>{isAIEnabled ? 'AI is active' : 'AI is inactive'}</p>
            {activeCellCount > 0 && (
              <p>{activeCellCount} AI-inhabited components</p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <Card className={`fixed bottom-6 right-6 w-80 shadow-lg z-50 ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center">
            <Sparkles className="h-4 w-4 mr-2" />
            AI Controls
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={toggleMinimized}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>Manage AI-inhabited components</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Power
              className={`h-4 w-4 ${
                isAIEnabled ? 'text-green-500' : 'text-gray-400'
              }`}
            />
            <Label htmlFor="ai-toggle">AI Status</Label>
          </div>
          <Switch
            id="ai-toggle"
            checked={isAIEnabled}
            onCheckedChange={toggleAI}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity
              className={`h-4 w-4 ${
                isConnected ? 'text-green-500' : 'text-gray-400'
              }`}
            />
            <Label>Connection</Label>
          </div>
          <Badge variant={isConnected ? 'default' : 'outline'}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-4 w-4" />
            <Label>Active Components</Label>
          </div>
          <Badge variant={activeCellCount > 0 ? 'default' : 'outline'}>
            {activeCellCount}
          </Badge>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          variant="outline"
          size="sm"
          className="w-full flex items-center justify-center"
          onClick={() => {
            if (isAIEnabled) {
              disableAI()
            } else {
              enableAI()
            }
          }}
        >
          <Zap className="h-4 w-4 mr-2" />
          {isAIEnabled ? 'Deactivate AI' : 'Activate AI'}
        </Button>
      </CardFooter>
    </Card>
  )
}
