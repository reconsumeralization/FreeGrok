import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPlus } from "lucide-react"

export function SuggestedConnections() {
  const connections = [
    {
      id: 1,
      name: "Acme Corporation",
      industry: "Technology",
      mutual: 12,
      logo: "AC",
    },
    {
      id: 2,
      name: "Global Ventures",
      industry: "Finance",
      mutual: 8,
      logo: "GV",
    },
    {
      id: 3,
      name: "Innovate Solutions",
      industry: "Consulting",
      mutual: 5,
      logo: "IS",
    },
  ]

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Suggested Connections</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {connections.map((connection) => (
          <div key={connection.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-medium">
                {connection.logo}
              </div>
              <div>
                <Link href="#" className="text-sm font-medium hover:underline">
                  {connection.name}
                </Link>
                <p className="text-xs text-muted-foreground">{connection.industry}</p>
                <p className="text-xs text-muted-foreground">{connection.mutual} mutual connections</p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="h-8 w-8 p-0">
              <UserPlus className="h-4 w-4" />
              <span className="sr-only">Connect</span>
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

