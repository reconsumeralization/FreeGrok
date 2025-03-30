import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Feed | B2B Network",
  description: "Stay updated with your professional network.",
}

export default function FeedPage() {
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Your Feed</h1>
      <div className="text-center py-12">
        <p className="text-muted-foreground">Feed content will be displayed here.</p>
      </div>
    </div>
  )
}

