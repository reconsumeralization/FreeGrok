"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getRecommendedContent, type FeedItem } from "@/lib/services/feed-service"
import { Sparkles } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { useUser } from "@/contexts/user-context"

export function RecommendedContent() {
  const [recommendations, setRecommendations] = useState<FeedItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useUser()

  useEffect(() => {
    const loadRecommendations = async () => {
      if (!user?.id) return

      try {
        const recommendedItems = await getRecommendedContent(user.id)
        setRecommendations(recommendedItems)
      } catch (error) {
        console.error("Error loading recommended content:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.id) {
      loadRecommendations()
    }
  }, [user])

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center">
          <Sparkles className="h-4 w-4 mr-2" />
          Recommended For You
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recommendations available at this time.</p>
        ) : (
          <div className="space-y-4">
            {recommendations.map((item) => (
              <div key={item.id} className="flex gap-3">
                <Avatar>
                  <AvatarImage src={item.authorImage || "/placeholder.svg?height=40&width=40"} alt={item.authorName} />
                  <AvatarFallback>{item.authorName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <Link href={`/post/${item.id}`} className="text-sm font-medium hover:underline line-clamp-2">
                    {item.title || item.content}
                  </Link>
                  <div className="flex items-center mt-1">
                    <Link href={`/profile/${item.authorId}`} className="text-xs text-muted-foreground hover:underline">
                      {item.authorName}
                    </Link>
                    {item.authorCompany && (
                      <span className="text-xs text-muted-foreground">
                        {" • "}
                        {item.authorCompany}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

