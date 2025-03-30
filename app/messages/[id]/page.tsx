import { MessageComposer } from "@/components/messaging/message-composer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function MessagePage({ params }) {
  // In a real app, this data would come from an API
  const recipient = {
    id: params.id,
    name: "Sarah Johnson",
    jobTitle: "Marketing Director",
    company: "Global Innovations",
    profilePicture: "/placeholder.svg?height=100&width=100",
    lastActive: "Active now",
  }

  const messages = [
    {
      id: "1",
      senderId: "me",
      text: "Hi Sarah, I saw your presentation at the marketing conference last week. It was really insightful!",
      timestamp: "10:30 AM",
    },
    {
      id: "2",
      senderId: recipient.id,
      text: "Thank you! I'm glad you found it valuable. Are you working on any marketing campaigns currently?",
      timestamp: "10:35 AM",
    },
    {
      id: "3",
      senderId: "me",
      text: "Yes, we're launching a new B2B product next month and I'm leading the marketing strategy. Would love to get your thoughts on our approach.",
      timestamp: "10:40 AM",
    },
  ]

  return (
    <div className="container py-8">
      <Card className="h-[calc(100vh-8rem)]">
        <CardHeader className="border-b">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={recipient.profilePicture} alt={recipient.name} />
              <AvatarFallback>{recipient.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{recipient.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {recipient.jobTitle} at {recipient.company}
              </p>
              <p className="text-xs text-muted-foreground">{recipient.lastActive}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex flex-col h-[calc(100%-8rem)]">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.senderId === "me" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    message.senderId === "me" ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  <p>{message.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.senderId === "me" ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}
                  >
                    {message.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <MessageComposer recipientId={recipient.id} recipientName={recipient.name} />
        </CardContent>
      </Card>
    </div>
  )
}

