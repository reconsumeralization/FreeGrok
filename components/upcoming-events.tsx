import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, ChevronRight } from "lucide-react"

export function UpcomingEvents() {
  const events = [
    {
      id: 1,
      title: "Industry Tech Summit",
      date: "May 15, 2025",
      type: "Conference",
    },
    {
      id: 2,
      title: "Digital Marketing Webinar",
      date: "April 28, 2025",
      type: "Webinar",
    },
    {
      id: 3,
      title: "Networking Mixer",
      date: "May 5, 2025",
      type: "Networking",
    },
  ]

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Upcoming Events</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {events.map((event) => (
          <div key={event.id} className="grid gap-1">
            <Link href="#" className="font-medium text-sm hover:underline">
              {event.title}
            </Link>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{event.date}</span>
            </div>
            <div className="text-xs text-muted-foreground">{event.type}</div>
          </div>
        ))}
        <Button variant="outline" size="sm" className="mt-2 w-full justify-between">
          View all events
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )
}

