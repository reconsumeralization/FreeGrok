'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Wand2, Sparkles } from 'lucide-react'
import { useMCP } from '@/lib/hooks/use-mcp'
import { cn } from '@/lib/utils'

interface AIInhabitProps {
  id: string
  context?: Record<string, any>
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
  badgeText?: string
  showWand?: boolean
  indicatorPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  activeClassName?: string
  onInhabited?: (id: string) => void
  onReleased?: (id: string) => void
}

/**
 * A wrapper component that allows AI to "inhabit" the wrapped component
 *
 * Usage:
 * <AIInhabit id="unique-id" context={{ someData: 123 }}>
 *   <YourComponent />
 * </AIInhabit>
 */
export function AIInhabit({
  id,
  context = {},
  className,
  style,
  children,
  badgeText = 'AI',
  showWand = true,
  indicatorPosition = 'top-left',
  activeClassName = 'bg-purple-50 dark:bg-purple-950/20',
  onInhabited,
  onReleased,
}: AIInhabitProps) {
  const [isHovering, setIsHovering] = useState(false)
  const { inhabit, release, activeCells, isConnected } = useMCP({
    autoConnect: true,
  })

  // Check if this component is currently inhabited
  const isInhabited = activeCells.some((cell) => cell.id === id)

  // Define position classes for the badge and wand button
  const positionClasses = {
    'top-left': { badge: 'top-1 left-1', wand: 'top-1 right-1' },
    'top-right': { badge: 'top-1 right-1', wand: 'top-1 left-1' },
    'bottom-left': { badge: 'bottom-1 left-1', wand: 'bottom-1 right-1' },
    'bottom-right': { badge: 'bottom-1 right-1', wand: 'bottom-1 left-1' },
  }

  // Toggle AI inhabitation
  const toggle = async (e: React.MouseEvent) => {
    e.stopPropagation()

    if (isInhabited) {
      await release(id)
      onReleased?.(id)
    } else {
      await inhabit(id, context)
      onInhabited?.(id)
    }
  }

  // Handle mouse events
  const handleMouseEnter = () => setIsHovering(true)
  const handleMouseLeave = () => setIsHovering(false)

  return (
    <div
      className={cn('relative', className, isInhabited && activeClassName)}
      style={style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {isConnected && showWand && (isHovering || isInhabited) && (
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-6 w-6 absolute z-10 bg-background border shadow-sm',
            positionClasses[indicatorPosition]?.wand
          )}
          onClick={toggle}
        >
          <Wand2
            className={cn(
              'h-3 w-3',
              isInhabited ? 'text-purple-500' : 'text-muted-foreground'
            )}
          />
        </Button>
      )}

      {isInhabited && (
        <Badge
          variant="outline"
          className={cn(
            'absolute z-10 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
            'text-[10px] px-1 py-0 flex items-center gap-1',
            positionClasses[indicatorPosition]?.badge
          )}
        >
          <Sparkles className="h-2 w-2" />
          {badgeText}
        </Badge>
      )}

      {children}
    </div>
  )
}
