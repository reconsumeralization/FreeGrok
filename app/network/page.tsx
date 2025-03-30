import { ConnectionRequest } from "@/components/connection-request"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function NetworkPage() {
  // In a real app, this data would come from an API
  const suggestedConnections = [
    {
      userId: "1",
      name: "Sarah Johnson",
      jobTitle: "Marketing Director",
      company: "Global Innovations",
      profilePicture: "/placeholder.svg?height=100&width=100",
      mutualConnections: 8,
    },
    {
      userId: "2",
      name: "Michael Chen",
      jobTitle: "CTO",
      company: "Tech Solutions Inc.",
      profilePicture: "/placeholder.svg?height=100&width=100",
      mutualConnections: 3,
    },
    {
      userId: "3",
      name: "Jessica Williams",
      jobTitle: "VP of Sales",
      company: "Enterprise Systems",
      profilePicture: "/placeholder.svg?height=100&width=100",
      mutualConnections: 12,
    },
  ]

  const pendingRequests = [
    {
      userId: "4",
      name: "David Rodriguez",
      jobTitle: "Product Manager",
      company: "Innovative Products",
      profilePicture: "/placeholder.svg?height=100&width=100",
      mutualConnections: 5,
    },
    {
      userId: "5",
      name: "Emily Thompson",
      jobTitle: "CEO",
      company: "Strategic Partners",
      profilePicture: "/placeholder.svg?height=100&width=100",
      mutualConnections: 7,
    },
  ]

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">My Network</h1>

      <Tabs defaultValue="suggestions">
        <TabsList className="mb-6">
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
        </TabsList>

        <TabsContent value="suggestions">
          <Card>
            <CardHeader>
              <CardTitle>Suggested Connections</CardTitle>
              <CardDescription>
                People you might want to connect with based on your profile and industry
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {suggestedConnections.map((connection) => (
                <ConnectionRequest
                  key={connection.userId}
                  userId={connection.userId}
                  name={connection.name}
                  jobTitle={connection.jobTitle}
                  company={connection.company}
                  profilePicture={connection.profilePicture}
                  mutualConnections={connection.mutualConnections}
                />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Requests</CardTitle>
              <CardDescription>Connection requests waiting for your response</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingRequests.map((connection) => (
                <ConnectionRequest
                  key={connection.userId}
                  userId={connection.userId}
                  name={connection.name}
                  jobTitle={connection.jobTitle}
                  company={connection.company}
                  profilePicture={connection.profilePicture}
                  mutualConnections={connection.mutualConnections}
                />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connections">
          <Card>
            <CardHeader>
              <CardTitle>Your Connections</CardTitle>
              <CardDescription>People you are connected with</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">Complete your profile to see your connections</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

