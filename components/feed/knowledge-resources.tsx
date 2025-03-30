"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { getTrendingArticles, type KnowledgeArticle } from "@/lib/services/knowledge-service"
import { useUser } from "@/contexts/user-context"
import { BookOpen, Clock, ThumbsUp, MessageSquare, FileText, BookOpenCheck } from "lucide-react"
import Link from "next/link"

export function KnowledgeResources() {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useUser()

  useEffect(() => {
    const loadArticles = async () => {
      setIsLoading(true)
      try {
        const items = await getTrendingArticles(3)
        setArticles(items)
      } catch (error) {
        console.error("Error loading knowledge articles:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadArticles()
  }, [])

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center">
          <BookOpen className="h-4 w-4 mr-2" />
          Knowledge Resources
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-full" />
                <div className="flex gap-2 mt-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-6">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <BookOpenCheck className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No articles found</p>
            <p className="text-xs text-muted-foreground mt-1">Be the first to share knowledge in your industry</p>
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((article) => (
              <div key={article.id} className="space-y-2">
                <Link
                  href={`/knowledge/article/${article.id}`}
                  className="font-medium text-sm hover:underline line-clamp-2"
                >
                  {article.title}
                </Link>
                <p className="text-xs text-muted-foreground line-clamp-2">{article.content.substring(0, 120)}...</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {article.readTime} min read
                  </div>
                  <div className="flex items-center">
                    <ThumbsUp className="h-3 w-3 mr-1" />
                    {article.likes}
                  </div>
                  <div className="flex items-center">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    {article.comments}
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <Badge variant="outline" className="text-xs py-0 px-1">
                    {article.category}
                  </Badge>
                  {article.tags.slice(0, 1).map((tag, i) => (
                    <Badge key={i} variant="outline" className="text-xs py-0 px-1">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full mt-2" asChild>
              <Link href="/knowledge">
                <FileText className="h-4 w-4 mr-2" />
                View knowledge library
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

