"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Check, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useServiceCredentials } from "@/hooks/use-service-credentials"

interface ConnectionRequest {
  id: string
  userId: string
  connectedUserId: string
  status: string
  name: string
  image: string | null
  title: string | null
  company: string | null
}

interface ConnectionRequestsProps {
  requests: ConnectionRequest[]
}

export function ConnectionRequests({ requests: initialRequests }: ConnectionRequestsProps) {
  const { toast } = useToast()
  const { requestCredentials } = useServiceCredentials()
  const [requests, setRequests] = useState<ConnectionRequest[]>(initialRequests)

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await requestCredentials("database")

      // In a real app, you would call an API to accept the request
      setRequests(requests.filter((request) => request.id !== requestId))

      toast({
        title: "Request accepted",
        description: "The connection request has been accepted.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept request. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    try {
      await requestCredentials("database")

      // In a real app, you would call an API to reject the request
      setRequests(requests.filter((request) => request.id !== requestId))

      toast({
        title: "Request rejected",
        description: "The connection request has been rejected.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject request. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No pending connection requests.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <Card key={request.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="relative h-12 w-12 rounded-full overflow-hidden mr-4">
                  {request.image ? (
                    <Image src={request.image || "/placeholder.svg"} alt={request.name} fill className="object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-primary/10">
                      <span className="text-lg font-semibold text-primary">{request.name.charAt(0)}</span>
                    </div>
                  )}
                </div>

                <div>
                  <Link href={`/profile/${request.userId}`} className="font-medium hover:underline">
                    {request.name}
                  </Link>

                  {request.title && (
                    <p className="text-sm text-muted-foreground">
                      {request.title}
                      {request.company && ` at ${request.company}`}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="default" size="sm" onClick={() => handleAcceptRequest(request.id)}>
                  <Check className="h-4 w-4 mr-1" />
                  Accept
                </Button>

                <Button variant="outline" size="sm" onClick={() => handleRejectRequest(request.id)}>
                  <X className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

