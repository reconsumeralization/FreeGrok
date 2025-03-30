"use client"

import { useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useFeed } from "@/contexts/feed-context"
import { FeedItemCard } from "@/components/feed/feed-item"
import { FeedFilter } from "@/components/feed/feed-filter"
import { Loader2, RefreshCw, Filter, Zap } from "lucide-react"

export function SocialStream() {
  const { feedItems, isLoading, hasMore, loadMore, refreshFeed } = useFeed()
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return

      if (observerRef.current) {
        observerRef.current.disconnect()
      }

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore()
        }
      })

      if (node) {
        observerRef.current.observe(node)
      }
    },
    [isLoading, hasMore, loadMore],
  )

  // Clean up observer on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Your Feed</h1>
        <Button variant="outline" size="sm" onClick={refreshFeed} disabled={isLoading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <FeedFilter />

      {isLoading && feedItems.length === 0 ? (
        // Show skeletons when initially loading
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="pt-2 flex justify-between">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : feedItems.length === 0 ? (
        // Show empty state when no items
        <div className="text-center py-12 border rounded-lg">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Filter className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No content found</h3>
          <p className="text-muted-foreground mt-1">Try changing your filters or follow more people to see content</p>
          <div className="flex gap-2 justify-center mt-4">
            <Button variant="outline" onClick={refreshFeed}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Feed
            </Button>
            <Button asChild>
              <a href="/network">Find Connections</a>
            </Button>
          </div>
        </div>
      ) : (
        // Show feed items
        <div className="space-y-4">
          {feedItems.map((item) => (
            <FeedItemCard key={item.id} item={item} />
          ))}

          {/* Load more trigger element */}
          {hasMore && (
            <div ref={loadMoreRef} className="flex justify-center py-4">
              {isLoading && (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Loading more...</span>
                </div>
              )}
            </div>
          )}

          {!hasMore && feedItems.length > 0 && (
            <div className="text-center py-8 border-t">
              <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="text-lg font-medium">You're all caught up!</h3>
              <p className="text-muted-foreground mt-1">You've seen all the content in your feed</p>
              <Button variant="outline" className="mt-4" onClick={refreshFeed}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Check for new content
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

