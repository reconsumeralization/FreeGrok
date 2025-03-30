"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import {
  getPersonalizedFeed,
  likePost,
  addComment,
  sharePost,
  type FeedItem,
  ContentType,
  RelevanceType,
  type FeedFilterOptions,
} from "@/lib/services/feed-service"
import { useUser } from "@/contexts/user-context"
import { useToast } from "@/components/ui/use-toast"

interface FeedContextType {
  feedItems: FeedItem[]
  isLoading: boolean
  hasMore: boolean
  filterOptions: FeedFilterOptions
  setFilterOptions: (options: FeedFilterOptions) => void
  loadMore: () => Promise<void>
  refreshFeed: () => Promise<void>
  handleLike: (postId: string) => Promise<void>
  handleComment: (postId: string, content: string) => Promise<void>
  handleShare: (postId: string, content?: string) => Promise<void>
}

const FeedContext = createContext<FeedContextType | undefined>(undefined)

export function FeedProvider({ children }: { children: ReactNode }) {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [filterOptions, setFilterOptions] = useState<FeedFilterOptions>({
    contentTypes: Object.values(ContentType),
    relevance: RelevanceType.RECENT,
    timeRange: "all",
    onlyConnections: false,
  })

  const { user } = useUser()
  const { toast } = useToast()

  // Load initial feed
  useEffect(() => {
    if (user?.id) {
      loadFeed()
    }
  }, [user, filterOptions])

  // Load feed with current filter options
  const loadFeed = async () => {
    if (!user?.id) return

    setIsLoading(true)
    setPage(1)

    try {
      const { items, totalCount } = await getPersonalizedFeed(user.id, 1, 10, filterOptions)
      setFeedItems(items)
      setTotalCount(totalCount)
      setHasMore(items.length < totalCount)
    } catch (error) {
      console.error("Error loading feed:", error)
      toast({
        title: "Error",
        description: "Failed to load feed. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Load more feed items
  const loadMore = async () => {
    if (!user?.id || isLoading || !hasMore) return

    setIsLoading(true)
    const nextPage = page + 1

    try {
      const { items, totalCount } = await getPersonalizedFeed(user.id, nextPage, 10, filterOptions)
      setFeedItems((prev) => [...prev, ...items])
      setPage(nextPage)
      setTotalCount(totalCount)
      setHasMore(feedItems.length + items.length < totalCount)
    } catch (error) {
      console.error("Error loading more feed items:", error)
      toast({
        title: "Error",
        description: "Failed to load more content. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Refresh feed
  const refreshFeed = async () => {
    await loadFeed()
  }

  // Handle like action
  const handleLike = async (postId: string) => {
    if (!user?.id) return

    try {
      const isLiked = await likePost(user.id, postId)

      // Update feed items
      setFeedItems((prev) =>
        prev.map((item) => {
          if (item.id === postId) {
            return {
              ...item,
              likes: isLiked ? item.likes + 1 : item.likes - 1,
              isLiked,
            }
          }
          return item
        }),
      )
    } catch (error) {
      console.error("Error liking post:", error)
      toast({
        title: "Error",
        description: "Failed to like post. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle comment action
  const handleComment = async (postId: string, content: string) => {
    if (!user?.id) return

    try {
      await addComment(user.id, postId, content)

      // Update feed items
      setFeedItems((prev) =>
        prev.map((item) => {
          if (item.id === postId) {
            return {
              ...item,
              comments: item.comments + 1,
            }
          }
          return item
        }),
      )

      toast({
        title: "Comment Added",
        description: "Your comment has been added successfully.",
      })
    } catch (error) {
      console.error("Error adding comment:", error)
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle share action
  const handleShare = async (postId: string, content?: string) => {
    if (!user?.id) return

    try {
      await sharePost(user.id, postId, content)

      // Update feed items
      setFeedItems((prev) =>
        prev.map((item) => {
          if (item.id === postId) {
            return {
              ...item,
              shares: item.shares + 1,
              isShared: true,
            }
          }
          return item
        }),
      )

      toast({
        title: "Post Shared",
        description: "The post has been shared to your profile.",
      })
    } catch (error) {
      console.error("Error sharing post:", error)
      toast({
        title: "Error",
        description: "Failed to share post. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <FeedContext.Provider
      value={{
        feedItems,
        isLoading,
        hasMore,
        filterOptions,
        setFilterOptions,
        loadMore,
        refreshFeed,
        handleLike,
        handleComment,
        handleShare,
      }}
    >
      {children}
    </FeedContext.Provider>
  )
}

export function useFeed() {
  const context = useContext(FeedContext)
  if (context === undefined) {
    throw new Error("useFeed must be used within a FeedProvider")
  }
  return context
}

