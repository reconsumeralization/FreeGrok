import { ContentModerationTool } from "@/components/content-moderation"

export default function ToolsPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Platform Tools</h1>
        <p className="text-muted-foreground">Useful tools for platform management</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <ContentModerationTool />
      </div>
    </div>
  )
}

