import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"

export function TrendingTopics() {
  const topics = [
    {
      id: 1,
      name: "AI in Business",
      posts: 128,
    },
    {
      id: 2,
      name: "Remote Work Strategies",
      posts: 96,
    },
    {
      id: 3,
      name: "Supply Chain Innovation",
      posts: 84,
    },
    {
      id: 4,
      name: "Sustainable Business",
      posts: 72,
    },
  ]

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Trending Topics</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {topics.map((topic) => (
          <div key={topic.id} className="flex items-center justify-between">
            <Link href="#" className="text-sm hover:underline">
              #{topic.name}
            </Link>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1" />
              {topic.posts} posts
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

