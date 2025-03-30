"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Building, Calendar, MapPin, MessageSquare, ThumbsUp, UserPlus, Users } from "lucide-react"

interface SearchResultsProps {
  query: string
  type: string
}

export function SearchResults({ query, type }: SearchResultsProps) {
  const [results, setResults] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!query) return

    const fetchResults = async () => {
      setIsLoading(true)
      setError("")

      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(query)}&type=${type}&page=${page}&limit=${limit}`,
        )

        if (!response.ok) {
          throw new Error("Failed to fetch search results")
        }

        const data = await response.json()
        setResults(data.results)
        setTotal(data.total)
      } catch (error) {
        console.error("Search error:", error)
        setError("Failed to fetch search results. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [query, type, page, limit])

  const loadMore = () => {
    setPage((prevPage) => prevPage + 1)
  }

  if (isLoading && results.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Skeleton className="h-16 w-16 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-1/3" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="rounded-md bg-destructive/15 p-4 text-destructive">{error}</div>
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg font-medium">No results found</p>
        <p className="text-muted-foreground mt-1">
          Try adjusting your search or filter to find what you're looking for.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {results.map((result) => (
        <Card key={result.id}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              {result.image ? (
                <Image
                  src={result.image || "/placeholder.svg"}
                  alt={result.name}
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-lg object-cover"
                />
              ) : (
                <div className="h-16 w-16 rounded-lg bg-primary/20 text-primary flex items-center justify-center text-xl font-medium">
                  {result.name.charAt(0)}
                </div>
              )}

              <div className="flex-1">
                <div className="flex justify-between">
                  <div>
                    <Link
                      href={`/${result.type}/${result.type === "post" ? result.userId : result.id}`}
                      className="text-lg font-semibold hover:underline"
                    >
                      {result.name}
                    </Link>

                    {result.type === "business" && <p className="text-muted-foreground">{result.industry}</p>}

                    {result.type === "professional" && (
                      <p className="text-muted-foreground">
                        {result.title} {result.company ? `at ${result.company}` : ""}
                      </p>
                    )}

                    {result.type === "post" && (
                      <p className="text-xs text-muted-foreground">{new Date(result.createdAt).toLocaleDateString()}</p>
                    )}

                    {result.type === "group" && (
                      <p className="text-muted-foreground">
                        <Users className="inline h-4 w-4 mr-1" />
                        {result.members} members
                      </p>
                    )}

                    {result.type === "event" && (
                      <p className="text-muted-foreground">
                        <Calendar className="inline h-4 w-4 mr-1" />
                        {new Date(result.startDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {(result.type === "business" || result.type === "professional") && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                      <Button size="sm">
                        <UserPlus className="h-4 w-4 mr-2" />
                        Connect
                      </Button>
                    </div>
                  )}

                  {result.type === "group" && <Button size="sm">Join Group</Button>}

                  {result.type === "event" && <Button size="sm">Register</Button>}
                </div>

                {result.description && <p className="mt-2 text-sm line-clamp-2">{result.description}</p>}

                {result.type === "post" && (
                  <>
                    <p className="mt-2 text-sm line-clamp-3">{result.content}</p>
                    <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        {result.likes}
                      </span>
                      <span className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        {result.comments}
                      </span>
                    </div>
                  </>
                )}

                {(result.type === "business" || result.type === "professional") && result.location && (
                  <div className="mt-2 flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    {result.location}
                  </div>
                )}

                {result.type === "business" && (
                  <div className="mt-2 flex items-center text-sm text-muted-foreground">
                    <Building className="h-4 w-4 mr-1" />
                    {result.size || "Company"}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {results.length < total && (
        <div className="text-center mt-6">
          <Button onClick={loadMore} disabled={isLoading}>
            {isLoading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  )
}

