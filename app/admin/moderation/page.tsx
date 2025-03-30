"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import {
  getContentForModeration,
  moderateContentItem,
  getModerationStats,
  ContentStatus,
  type ContentModerationItem,
} from "@/lib/services/moderation-service"
import { useUser } from "@/contexts/user-context"
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Flag,
  Loader2,
  ShieldAlert,
  ThumbsDown,
  ThumbsUp,
  XCircle,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export default function ModerationDashboard() {
  const [activeTab, setActiveTab] = useState<ContentStatus>(ContentStatus.PENDING)
  const [contentItems, setContentItems] = useState<ContentModerationItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    flagged: 0,
  })
  const [selectedItem, setSelectedItem] = useState<ContentModerationItem | null>(null)
  const [moderationReason, setModerationReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { user } = useUser()
  const { toast } = useToast()

  // Load content items and stats
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)

      try {
        // Load content items
        const { items } = await getContentForModeration(activeTab)
        setContentItems(items)

        // Load stats
        const stats = await getModerationStats()
        setStats(stats)
      } catch (error) {
        console.error("Error loading moderation data:", error)
        toast({
          title: "Error",
          description: "Failed to load moderation data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [activeTab, toast])

  // Handle moderation action
  const handleModerateContent = async (status: ContentStatus) => {
    if (!selectedItem || !user?.id) return

    setIsSubmitting(true)

    try {
      await moderateContentItem(selectedItem.id, selectedItem.type, status, user.id, moderationReason || undefined)

      // Update local state
      setContentItems((prev) => prev.filter((item) => item.id !== selectedItem.id))

      // Update stats
      setStats((prev) => ({
        ...prev,
        [activeTab]: prev[activeTab] - 1,
        [status]: prev[status] + 1,
      }))

      // Close dialog
      setSelectedItem(null)
      setModerationReason("")

      toast({
        title: "Content Moderated",
        description: `The content has been ${status === ContentStatus.APPROVED ? "approved" : "rejected"}.`,
      })
    } catch (error) {
      console.error("Error moderating content:", error)
      toast({
        title: "Error",
        description: "Failed to moderate content",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get status badge
  const getStatusBadge = (status: ContentStatus) => {
    switch (status) {
      case ContentStatus.PENDING:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        )
      case ContentStatus.APPROVED:
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Approved
          </Badge>
        )
      case ContentStatus.REJECTED:
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        )
      case ContentStatus.FLAGGED:
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
            <Flag className="h-3 w-3" />
            Flagged
          </Badge>
        )
    }
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Content Moderation</h1>
          <p className="text-muted-foreground">Review and moderate user-generated content</p>
        </div>
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-primary" />
          <span className="font-medium">Moderation Dashboard</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className={activeTab === ContentStatus.PENDING ? "border-primary" : ""}>
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">Pending</p>
              <p className="text-2xl font-bold">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-amber-500" />
          </CardContent>
        </Card>

        <Card className={activeTab === ContentStatus.FLAGGED ? "border-primary" : ""}>
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">Flagged</p>
              <p className="text-2xl font-bold">{stats.flagged}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </CardContent>
        </Card>

        <Card className={activeTab === ContentStatus.APPROVED ? "border-primary" : ""}>
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">Approved</p>
              <p className="text-2xl font-bold">{stats.approved}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </CardContent>
        </Card>

        <Card className={activeTab === ContentStatus.REJECTED ? "border-primary" : ""}>
          <CardContent className="p-4 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">Rejected</p>
              <p className="text-2xl font-bold">{stats.rejected}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-500" />
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ContentStatus)}>
        <TabsList className="mb-6">
          <TabsTrigger value={ContentStatus.PENDING}>Pending</TabsTrigger>
          <TabsTrigger value={ContentStatus.FLAGGED}>Flagged</TabsTrigger>
          <TabsTrigger value={ContentStatus.APPROVED}>Approved</TabsTrigger>
          <TabsTrigger value={ContentStatus.REJECTED}>Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === ContentStatus.PENDING && "Pending Content"}
                {activeTab === ContentStatus.FLAGGED && "Flagged Content"}
                {activeTab === ContentStatus.APPROVED && "Approved Content"}
                {activeTab === ContentStatus.REJECTED && "Rejected Content"}
              </CardTitle>
              <CardDescription>
                {activeTab === ContentStatus.PENDING && "Content waiting for moderation"}
                {activeTab === ContentStatus.FLAGGED && "Content flagged by automated systems"}
                {activeTab === ContentStatus.APPROVED && "Content that has been approved"}
                {activeTab === ContentStatus.REJECTED && "Content that has been rejected"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : contentItems.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">No content to review</h3>
                  <p className="text-muted-foreground mt-1">There is no {activeTab} content to review at this time</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {contentItems.map((item) => (
                    <div
                      key={item.id}
                      className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedItem(item)}
                    >
                      <div className="flex justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{item.authorName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{item.authorName}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                              {" • "}
                              {item.type === "post" ? "Post" : "Comment"}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(item.status)}
                      </div>
                      <p className="text-sm line-clamp-3">{item.content}</p>
                      {item.flaggedReason && (
                        <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                          <span className="font-medium">Flagged reason:</span> {item.flaggedReason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Moderation Dialog */}
      {selectedItem && (
        <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review Content</DialogTitle>
              <DialogDescription>Review this {selectedItem.type} and take appropriate action</DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="flex items-center gap-2 mb-4">
                <Avatar>
                  <AvatarFallback>{selectedItem.authorName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedItem.authorName}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(selectedItem.createdAt), { addSuffix: true })}
                    {" • "}
                    {selectedItem.type === "post" ? "Post" : "Comment"}
                  </p>
                </div>
              </div>

              <div className="border rounded-lg p-4 mb-4">
                <p className="whitespace-pre-line">{selectedItem.content}</p>
              </div>

              {selectedItem.flaggedReason && (
                <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  <span className="font-medium">Flagged reason:</span> {selectedItem.flaggedReason}
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm font-medium">Moderation Notes (optional)</p>
                <Textarea
                  placeholder="Add notes about why this content is being approved or rejected..."
                  value={moderationReason}
                  onChange={(e) => setModerationReason(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedItem(null)
                  setModerationReason("")
                }}
              >
                Cancel
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={() => handleModerateContent(ContentStatus.REJECTED)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <ThumbsDown className="h-4 w-4 mr-2" />
                  )}
                  Reject
                </Button>

                <Button
                  variant="default"
                  onClick={() => handleModerateContent(ContentStatus.APPROVED)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <ThumbsUp className="h-4 w-4 mr-2" />
                  )}
                  Approve
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

