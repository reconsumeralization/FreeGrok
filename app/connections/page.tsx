import type { Metadata } from "next"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ConnectionsList } from "@/components/connections/connections-list"
import { ConnectionRequests } from "@/components/connections/connection-requests"
import { SuggestedConnections } from "@/components/connections/suggested-connections"
import { getUserConnections, getConnectionRequests } from "@/db"

export const metadata: Metadata = {
  title: "Connections | B2B Network",
  description: "Manage your professional connections and network with other professionals.",
}

export default async function ConnectionsPage() {
  // In a real app, you would get the current user ID from the session
  const userId = "user-1" // Replace with actual user ID

  const connections = await getUserConnections(userId)
  const connectionRequests = await getConnectionRequests(userId)

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Your Network</h1>

      <Tabs defaultValue="connections" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="connections">
            Connections
            {connections.length > 0 && (
              <span className="ml-2 text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">
                {connections.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="requests">
            Requests
            {connectionRequests.length > 0 && (
              <span className="ml-2 text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">
                {connectionRequests.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
        </TabsList>

        <TabsContent value="connections">
          <ConnectionsList connections={connections} />
        </TabsContent>

        <TabsContent value="requests">
          <ConnectionRequests requests={connectionRequests} />
        </TabsContent>

        <TabsContent value="suggestions">
          <SuggestedConnections userId={userId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

