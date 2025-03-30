"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useUser, ProfileStage } from "@/contexts/user-context"
import { useServiceCredentials } from "@/hooks/use-service-credentials"
import { Loader2, ImageIcon, FileText, Link2, Send } from "lucide-react"
import { FeatureGate } from "@/components/feature-gate"
import { moderateContent } from "@/lib/moderation"

interface PostComposerProps {
  onPostCreated?: () => void
}

export function PostComposer({ onPostCreated }: PostComposerProps) {
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isModeratingContent, setIsModeratingContent] = useState(false)
  const { toast } = useToast()
  const { promptForProfileCompletion } = useUser()
  const { getOpenAIKey } = useServiceCredentials()

  const handleCreatePost = async () => {
    if (!content.trim()) return

    // Check if the user has completed the required profile stage
    const canProceed = await promptForProfileCompletion(ProfileStage.BASIC)
    if (!canProceed) return

    setIsLoading(true)

    try {
      // First, moderate the content
      setIsModeratingContent(true)

      try {
        // This will trigger the credential request if needed
        await getOpenAIKey()

        const moderationResult = await moderateContent(content)

        if (moderationResult.isFlagged) {
          toast({
            title: "Content Flagged",
            description: "Your post contains content that violates our community guidelines.",
            variant: "destructive",
          })
          setIsLoading(false)
          setIsModeratingContent(false)
          return
        }
      } catch (error) {
        // User declined to provide OpenAI credentials or moderation failed
        // We can still proceed with posting, but without moderation
        console.log("Content moderation skipped")
      } finally {
        setIsModeratingContent(false)
      }

      // In a real app, this would be an API call to create a post
      // For this example, we'll just simulate it
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Post Created",
        description: "Your post has been published successfully.",
      })

      // Clear the content
      setContent("")

      // Call the onPostCreated callback
      if (onPostCreated) {
        onPostCreated()
      }
    } catch (error) {
      console.error("Error creating post:", error)
      toast({
        title: "Post Failed",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <FeatureGate requiredStage={ProfileStage.BASIC}>
      <div className="border rounded-lg p-4 bg-card">
        <Textarea
          placeholder="Share an update, news, or business opportunity..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[100px] resize-none mb-3 border-none focus-visible:ring-0 p-0"
          disabled={isLoading}
        />
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={isLoading}>
              <ImageIcon className="h-4 w-4 mr-2" />
              Image
            </Button>
            <Button variant="outline" size="sm" disabled={isLoading}>
              <FileText className="h-4 w-4 mr-2" />
              Document
            </Button>
            <Button variant="outline" size="sm" disabled={isLoading}>
              <Link2 className="h-4 w-4 mr-2" />
              Link
            </Button>
          </div>
          <Button onClick={handleCreatePost} disabled={!content.trim() || isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {isModeratingContent ? "Moderating..." : "Posting..."}
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Post
              </>
            )}
          </Button>
        </div>
      </div>
    </FeatureGate>
  )
}

