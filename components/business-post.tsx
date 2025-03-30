"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { MessageSquare, Share, ThumbsUp } from "lucide-react"

interface BusinessPostProps {
  company: string
  logo: string
  time: string
  content: string
  image?: string
  likes: number
  comments: number
}

export function BusinessPost({ company, logo, time, content, image, likes, comments }: BusinessPostProps) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(likes)

  const handleLike = () => {
    if (liked) {
      setLikeCount(likeCount - 1)
    } else {
      setLikeCount(likeCount + 1)
    }
    setLiked(!liked)
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-medium">
            {logo}
          </div>
          <div>
            <Link href="#" className="font-semibold hover:underline">
              {company}
            </Link>
            <p className="text-xs text-muted-foreground">{time}</p>
          </div>
        </div>
        <div className="mt-3">
          <p className="text-sm">{content}</p>
          {image && (
            <div className="mt-3 rounded-md overflow-hidden">
              <Image
                src={image || "/placeholder.svg"}
                alt="Post image"
                width={600}
                height={300}
                className="w-full object-cover"
              />
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 border-t mt-4 flex justify-between">
        <Button variant="ghost" size="sm" className={`gap-2 ${liked ? "text-primary" : ""}`} onClick={handleLike}>
          <ThumbsUp className="h-4 w-4" />
          <span>{likeCount}</span>
        </Button>
        <Button variant="ghost" size="sm" className="gap-2">
          <MessageSquare className="h-4 w-4" />
          <span>{comments}</span>
        </Button>
        <Button variant="ghost" size="sm" className="gap-2">
          <Share className="h-4 w-4" />
          <span>Share</span>
        </Button>
      </CardFooter>
    </Card>
  )
}

