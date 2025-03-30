"use client"

import { Label } from "@/components/ui/label"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  MessageSquare,
  Share,
  ThumbsUp,
  Calendar,
  Newspaper,
  FileText,
  MoreHorizontal,
  AlertTriangle,
  Bookmark,
  Link2,
  Loader2,
  Tag,
  Eye,
  BarChart2,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useFeed } from "@/contexts/feed-context"
import { type FeedItem, ContentType } from "@/lib/services/feed-service"
import { reportContent } from "@/lib/services/moderation-service"
import { useUser } from "@/contexts/user-context"
import { useToast } from "@/components/ui/use-toast"
import { formatDistanceToNow } from "date-fns"
import Image from "next/image"
import Link from "next/link"

interface FeedItemProps {
  item: FeedItem
}

export function FeedItemCard({ item }: FeedItemProps) {
  const { handleLike, handleComment, handleShare } = useFeed()
  const { user } = useUser()
  const { toast } = useToast()
  const [isCommenting, setIsCommenting] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [isSharingDialogOpen, setIsSharingDialogOpen] = useState(false)
  const [shareText, setShareText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false)
  const [reportReason, setReportReason] = useState<string>("INAPPROPRIATE_CONTENT")
  const [reportDescription, setReportDescription] = useState("")

  const handleLikeClick = async () => {
    await handleLike(item.id)
  }

  const handleCommentClick = () => {
    setIsCommenting(!isCommenting)
  }

  const handleShareClick = () => {
    setIsSharingDialogOpen(true)
  }

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return

    setIsSubmitting(true)

    try {
      await handleComment(item.id, commentText)
      setCommentText("")
      setIsCommenting(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitShare = async () => {
    setIsSubmitting(true)

    try {
      await handleShare(item.id, shareText)
      setShareText("")
      setIsSharingDialogOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReportContent = async () => {
    if (!user?.id) return

    setIsSubmitting(true)

    try {
      await reportContent(user.id, "post", item.id, reportReason, reportDescription)

      setIsReportDialogOpen(false)
      setReportReason("INAPPROPRIATE_CONTENT")
      setReportDescription("")

      toast({
        title: "Content reported",
        description: "Thank you for helping keep our platform professional.",
      })
    } catch (error) {
      console.error("Error reporting content:", error)
      toast({
        title: "Error",
        description: "Failed to report content. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Format the timestamp
  const formattedTime = formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })

  // Get the icon based on content type
  const getContentTypeIcon = () => {
    switch (item.type) {
      case ContentType.ARTICLE:
        return <FileText className="h-4 w-4 mr-1" />
      case ContentType.NEWS:
        return <Newspaper className="h-4 w-4 mr-1" />
      case ContentType.EVENT:
        return <Calendar className="h-4 w-4 mr-1" />
      default:
        return null
    }
  }

  // Get content type label
  const getContentTypeLabel = () => {
    switch (item.type) {
      case ContentType.ARTICLE:
        return "Article"
      case ContentType.NEWS:
        return "News"
      case ContentType.UPDATE:
        return "Update"
      case ContentType.EVENT:
        return "Event"
      default:
        return "Post"
    }
  }

  return (
    <Card className="mb-4">
      <CardHeader className="p-4 pb-0">
        <div className="flex justify-between">
          <div className="flex items-start gap-3">
            <Avatar>
              <AvatarImage src={item.authorImage || "/placeholder.svg?height=40&width=40"} alt={item.authorName} />
              <AvatarFallback>{item.authorName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center">
                <Link href={`/profile/${item.authorId}`} className="font-semibold hover:underline">
                  {item.authorName}
                </Link>
                {item.type !== ContentType.POST && (
                  <Badge variant="outline" className="ml-2 text-xs py-0 px-1 flex items-center">
                    {getContentTypeIcon()}
                    {getContentTypeLabel()}
                  </Badge>
                )}
              </div>
              {(item.authorRole || item.authorCompany) && (
                <p className="text-sm text-muted-foreground">
                  {item.authorRole}
                  {item.authorCompany ? ` at ${item.authorCompany}` : ""}
                </p>
              )}
              <p className="text-xs text-muted-foreground">{formattedTime}</p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Bookmark className="h-4 w-4 mr-2" />
                Save
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link2 className="h-4 w-4 mr-2" />
                Copy link
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/analytics/content/${item.id}`}>
                  <BarChart2 className="h-4 w-4 mr-2" />
                  View analytics
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsReportDialogOpen(true)}>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {item.title && <h3 className="font-semibold mb-2">{item.title}</h3>}
        <p className="whitespace-pre-line">{item.content}</p>

        {item.media && item.media.length > 0 && (
          <div className={`mt-3 grid gap-2 ${item.media.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
            {item.media.slice(0, 4).map((mediaUrl, index) => (
              <div key={index} className="relative aspect-video rounded-md overflow-hidden">
                <Image
                  src={mediaUrl || "/placeholder.svg?height=300&width=500"}
                  alt={`Media ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
            {item.media.length > 4 && (
              <div className="text-sm text-muted-foreground mt-1">+{item.media.length - 4} more</div>
            )}
          </div>
        )}

        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {item.tags.map((tag, index) => (
              <Link href={`/search?tag=${tag}`} key={index}>
                <Badge variant="outline" className="hover:bg-muted">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              </Link>
            ))}
          </div>
        )}

        {item.source && <div className="mt-3 text-xs text-muted-foreground">Source: {item.source}</div>}

        {item.relevanceScore !== undefined && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="mt-3 flex items-center text-xs text-muted-foreground">
                  <div className="w-24 h-1.5 bg-muted rounded-full mr-2">
                    <div
                      className="h-1.5 bg-primary rounded-full"
                      style={{ width: `${item.relevanceScore * 100}%` }}
                    ></div>
                  </div>
                  <span>Relevance: {Math.round(item.relevanceScore * 100)}%</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Content relevance based on your profile and interests</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 border-t mt-2">
        <div className="w-full">
          <div className="flex justify-between mb-2">
            <div className="text-sm text-muted-foreground">
              {item.likes > 0 && `${item.likes} likes`}
              {item.likes > 0 && item.comments > 0 && " • "}
              {item.comments > 0 && `${item.comments} comments`}
            </div>
            <div className="text-sm text-muted-foreground flex items-center">
              <Eye className="h-3 w-3 mr-1" />
              {Math.max(item.likes * 5 + item.comments * 3, 10)} views
            </div>
          </div>

          <div className="flex justify-between">
            <Button
              variant="ghost"
              size="sm"
              className={`gap-1 ${item.isLiked ? "text-primary" : ""}`}
              onClick={handleLikeClick}
            >
              <ThumbsUp className="h-4 w-4" />
              Like
            </Button>

            <Button variant="ghost" size="sm" className="gap-1" onClick={handleCommentClick}>
              <MessageSquare className="h-4 w-4" />
              Comment
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={`gap-1 ${item.isShared ? "text-primary" : ""}`}
              onClick={handleShareClick}
            >
              <Share className="h-4 w-4" />
              Share
            </Button>
          </div>

          {isCommenting && (
            <div className="mt-4 space-y-2">
              <Textarea
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="min-h-[80px]"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsCommenting(false)
                    setCommentText("")
                  }}
                >
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSubmitComment} disabled={!commentText.trim() || isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    "Post Comment"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardFooter>

      {/* Share Dialog */}
      <Dialog open={isSharingDialogOpen} onOpenChange={setIsSharingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Post</DialogTitle>
            <DialogDescription>Share this post with your network</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Textarea
              placeholder="Add a comment to your share (optional)"
              value={shareText}
              onChange={(e) => setShareText(e.target.value)}
              className="min-h-[100px]"
            />

            <div className="mt-4 p-4 border rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={item.authorImage || "/placeholder.svg?height=24&width=24"} alt={item.authorName} />
                  <AvatarFallback className="text-xs">{item.authorName.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{item.authorName}</span>
              </div>
              <p className="text-sm line-clamp-3">{item.content}</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSharingDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitShare} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Sharing...
                </>
              ) : (
                "Share"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Content</DialogTitle>
            <DialogDescription>Please let us know why you're reporting this content</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="report-reason">Reason</Label>
                <select
                  id="report-reason"
                  className="w-full p-2 border rounded-md"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                >
                  <option value="INAPPROPRIATE_CONTENT">Inappropriate Content</option>
                  <option value="SPAM">Spam</option>
                  <option value="HARASSMENT">Harassment</option>
                  <option value="MISINFORMATION">Misinformation</option>
                  <option value="INTELLECTUAL_PROPERTY">Intellectual Property Violation</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="report-description">Description (Optional)</Label>
                <Textarea
                  id="report-description"
                  placeholder="Please provide additional details about your report"
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReportDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReportContent} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Report"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

