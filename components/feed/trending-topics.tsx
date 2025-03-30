"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getTrendingTopics } from "@/lib/services/feed-service"
import { TrendingUp } from "lucide-react"
import Link from "next/link"

export function TrendingTopics() {
  const [topics, setTopics] = useState<{ topic: string; count: number }[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadTopics = async () => {
      try {
        const trendingTopics = await getTrendingTopics()
        setTopics(trendingTopics)
      } catch (error) {
        console.error("Error loading trending topics:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTopics()
  }, [])

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center">
          <TrendingUp className="h-4 w-4 mr-2" />
          Trending Topics
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {topics.map((topic, index) => (
              <div key={index} className="flex items-center justify-between">
                <Link href={`/search?q=${encodeURIComponent(topic.topic)}`} className="text-sm hover:underline">
                  #{topic.topic}
                </Link>
                <div className="text-xs text-muted-foreground flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {topic.count} posts
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

