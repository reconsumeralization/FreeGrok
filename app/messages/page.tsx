import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Messages | B2B Network",
  description: "Connect with your professional network through messages.",
}

export default function MessagesPage() {
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      <div className="text-center py-12">
        <p className="text-muted-foreground">Messages will be displayed here.</p>
      </div>
    </div>
  )
}

