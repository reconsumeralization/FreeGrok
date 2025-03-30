"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useUser, ProfileStage } from "@/contexts/user-context"
import { useCredentials } from "@/contexts/credentials-context"
import { Loader2, Send, Paperclip, ImageIcon } from "lucide-react"
import { FeatureGate } from "@/components/feature-gate"

interface MessageComposerProps {
  recipientId: string
  recipientName: string
  onMessageSent?: () => void
}

export function MessageComposer({ recipientId, recipientName, onMessageSent }: MessageComposerProps) {
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { promptForProfileCompletion } = useUser()
  const { requestCredential } = useCredentials()

  const handleSendMessage = async () => {
    if (!message.trim()) return

    // Check if the user has completed the required profile stage
    const canProceed = await promptForProfileCompletion(ProfileStage.PERSONAL)
    if (!canProceed) return

    setIsLoading(true)

    try {
      // In a real app, this would be an API call to send a message
      // For this example, we'll just simulate it
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Check if we need OpenAI API credentials for message enhancement
      if (message.length > 100) {
        try {
          // Only request OpenAI credentials for longer messages that might benefit from AI assistance
          // This demonstrates contextual credential requests
          const apiKey = await requestCredential(
            "OPENAI_API_KEY",
            "enhance your message with AI-powered suggestions and proofreading",
          )

          // If we got the API key, we could use it to enhance the message
          // For this example, we'll just simulate it
          await new Promise((resolve) => setTimeout(resolve, 500))

          toast({
            title: "Message Enhanced",
            description: "Your message was enhanced with AI-powered suggestions.",
          })
        } catch (error) {
          // User declined to provide OpenAI credentials
          // We can still proceed with sending the basic message
          console.log("User declined AI enhancement")
        }
      }

      // Send the message
      // In a real app, this would be an API call

      toast({
        title: "Message Sent",
        description: `Your message to ${recipientName} has been sent.`,
      })

      // Clear the message
      setMessage("")

      // Call the onMessageSent callback
      if (onMessageSent) {
        onMessageSent()
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Message Failed",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <FeatureGate requiredStage={ProfileStage.PERSONAL}>
      <div className="border-t p-4">
        <Textarea
          placeholder={`Write a message to ${recipientName}...`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="min-h-[100px] resize-none mb-3"
          disabled={isLoading}
        />
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button variant="outline" size="icon" disabled={isLoading}>
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" disabled={isLoading}>
              <ImageIcon className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={handleSendMessage} disabled={!message.trim() || isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
            Send
          </Button>
        </div>
      </div>
    </FeatureGate>
  )
}

