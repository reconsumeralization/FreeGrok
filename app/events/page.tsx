import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Events | B2B Network",
  description: "Discover and join professional events in your network.",
}

export default function EventsPage() {
  const upcomingEvents = [
    {
      id: 1,
      name: "B2B Tech Summit 2025",
      description: "Join industry leaders for discussions on the future of B2B technology",
      date: "May 15-17, 2025",
      location: "San Francisco, CA",
      type: "In-person",
      attendees: 1200,
      image: "/placeholder.svg?height=200&width=400",
    },
    {
      id: 2,
      name: "Digital Marketing Strategies Webinar",
      description: "Learn effective digital marketing approaches for B2B companies",
      date: "April 28, 2025",
      location: "Online",
      type: "Webinar",
      attendees: 450,
      image: "/placeholder.svg?height=200&width=400",
    },
    {
      id: 3,
      name: "Supply Chain Innovation Conference",
      description: "Exploring new technologies and strategies in supply chain management",
      date: "June 10-12, 2025",
      location: "Chicago, IL",
      type: "In-person",
      attendees: 800,
      image: "/placeholder.svg?height=200&width=400",
    },
  ]

  const myEvents = [
    {
      id: 4,
      name: "Business Connect Networking Mixer",
      description: "Connect with local business leaders in a casual networking environment",
      date: "May 5, 2025",
      location: "New York, NY",
      type: "In-person",
      attendees: 150,
      image: "/placeholder.svg?height=200&width=400",
    },
    {
      id: 5,
      name: "AI in Business Operations Workshop",
      description: "Hands-on workshop exploring AI applications in business processes",
      date: "May 20, 2025",
      location: "Online",
      type: "Workshop",
      attendees: 200,
      image: "/placeholder.svg?height=200&width=400",
    },
  ]

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Events</h1>
      <div className="text-center py-12">
        <p className="text-muted-foreground">Events will be displayed here.</p>
      </div>
    </div>
  )
}

