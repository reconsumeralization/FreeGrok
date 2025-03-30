"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, CheckCircle, Loader2 } from "lucide-react"
import { useServiceCredentials } from "@/hooks/use-service-credentials"
import { moderateContent, analyzeContent } from "@/lib/moderation"

export function ContentModerationTool() {
  const [content, setContent] = useState("")
  const [result, setResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { getOpenAIKey } = useServiceCredentials()

  const handleModerate = async () => {
    if (!content.trim()) {
      setError("Please enter content to moderate")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // This will trigger the credential request if needed
      await getOpenAIKey()

      const moderationResult = await moderateContent(content)
      const analysisResult = await analyzeContent(content)

      setResult({
        moderation: moderationResult,
        analysis: analysisResult,
      })
    } catch (err) {
      console.error("Moderation error:", err)
      setError(err.message || "Failed to moderate content")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Content Moderation Tool</CardTitle>
        <CardDescription>Check content for policy violations before publishing</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Enter content to moderate..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[150px]"
        />

        {error && (
          <div className="flex items-center text-destructive text-sm">
            <AlertTriangle className="h-4 w-4 mr-1" />
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-4 mt-4">
            <div className="p-4 rounded-md border">
              <h3 className="font-medium flex items-center">
                {result.moderation.isFlagged ? (
                  <>
                    <AlertTriangle className="h-4 w-4 mr-1 text-destructive" />
                    <span className="text-destructive">Content Flagged</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                    <span className="text-green-500">Content Approved</span>
                  </>
                )}
              </h3>

              {result.moderation.isFlagged && (
                <div className="mt-2">
                  <p className="text-sm font-medium">Flagged categories:</p>
                  <ul className="text-sm mt-1">
                    {result.moderation.flaggedCategories.map((category) => (
                      <li key={category}>{category.replace("/", " - ")}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-4">
                <p className="text-sm font-medium">Content analysis:</p>
                <p className="text-sm mt-1 whitespace-pre-line">{result.analysis}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleModerate} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            "Moderate Content"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

