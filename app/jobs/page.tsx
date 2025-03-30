import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Jobs | B2B Network",
  description: "Find and post job opportunities in your professional network.",
}

export default function JobsPage() {
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Jobs</h1>
      <div className="text-center py-12">
        <p className="text-muted-foreground">Job listings will be displayed here.</p>
      </div>
    </div>
  )
}

