"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building, Calendar, Filter, MapPin, SearchIcon, UserPlus, Users } from "lucide-react"

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const businesses = [
    {
      id: 1,
      name: "TechSolutions Inc.",
      industry: "Information Technology",
      location: "San Francisco, CA",
      size: "201-500 employees",
      description: "Enterprise software solutions for digital transformation",
      logo: "TS",
    },
    {
      id: 2,
      name: "Global Marketing Partners",
      industry: "Marketing & Advertising",
      location: "New York, NY",
      size: "51-200 employees",
      description: "Strategic marketing services for B2B companies",
      logo: "GM",
    },
    {
      id: 3,
      name: "Innovate Financial",
      industry: "Financial Services",
      location: "Chicago, IL",
      size: "501-1000 employees",
      description: "Financial technology solutions for businesses",
      logo: "IF",
    },
  ]

  const professionals = [
    {
      id: 1,
      name: "Sarah Johnson",
      title: "Chief Technology Officer",
      company: "TechSolutions Inc.",
      location: "San Francisco, CA",
      connections: 842,
      avatar: "SJ",
    },
    {
      id: 2,
      name: "Michael Chen",
      title: "VP of Marketing",
      company: "Global Marketing Partners",
      location: "New York, NY",
      connections: 623,
      avatar: "MC",
    },
    {
      id: 3,
      name: "Jessica Williams",
      title: "Director of Operations",
      company: "Supply Chain Innovations",
      location: "Atlanta, GA",
      connections: 512,
      avatar: "JW",
    },
  ]

  const events = [
    {
      id: 1,
      name: "B2B Tech Summit 2025",
      date: "May 15-17, 2025",
      location: "San Francisco, CA",
      attendees: 1200,
      image: "/placeholder.svg?height=100&width=200",
    },
    {
      id: 2,
      name: "Digital Marketing Conference",
      date: "June 8-10, 2025",
      location: "New York, NY",
      attendees: 850,
      image: "/placeholder.svg?height=100&width=200",
    },
  ]

  const groups = [
    {
      id: 1,
      name: "Tech Innovators Network",
      members: 1248,
      posts: 324,
      image: "/placeholder.svg?height=100&width=200",
    },
    {
      id: 2,
      name: "Marketing Professionals",
      members: 876,
      posts: 215,
      image: "/placeholder.svg?height=100&width=200",
    },
  ]

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Search</h1>
        <p className="text-muted-foreground">Find businesses, professionals, events, and more</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name, industry, location, or keyword"
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      <Tabs defaultValue="businesses">
        <TabsList className="mb-6">
          <TabsTrigger value="businesses">Businesses</TabsTrigger>
          <TabsTrigger value="people">People</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
        </TabsList>

        <TabsContent value="businesses">
          <div className="space-y-4">
            {businesses.map((business) => (
              <Card key={business.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-lg bg-primary/20 text-primary flex items-center justify-center text-xl font-medium">
                      {business.logo}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div>
                          <Link href="#" className="text-lg font-semibold hover:underline">
                            {business.name}
                          </Link>
                          <p className="text-muted-foreground">{business.industry}</p>
                        </div>
                        <Button>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Connect
                        </Button>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {business.location}
                        </div>
                        <div className="flex items-center">
                          <Building className="h-4 w-4 mr-1" />
                          {business.size}
                        </div>
                      </div>
                      <p className="mt-2">{business.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="people">
          <div className="space-y-4">
            {professionals.map((person) => (
              <Card key={person.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xl font-medium">
                      {person.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div>
                          <Link href="#" className="text-lg font-semibold hover:underline">
                            {person.name}
                          </Link>
                          <p className="text-muted-foreground">
                            {person.title} at {person.company}
                          </p>
                        </div>
                        <Button>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Connect
                        </Button>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {person.location}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {person.connections} connections
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="events">
          <div className="grid md:grid-cols-2 gap-6">
            {events.map((event) => (
              <Card key={event.id}>
                <CardContent className="p-0">
                  <div className="flex">
                    <Image
                      src={event.image || "/placeholder.svg"}
                      alt={event.name}
                      width={200}
                      height={100}
                      className="w-1/3 object-cover"
                    />
                    <div className="p-4 flex-1">
                      <Link href="#" className="font-semibold hover:underline">
                        {event.name}
                      </Link>
                      <div className="mt-2 space-y-1 text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-1" />
                          {event.date}
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-1" />
                          {event.location}
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <Users className="h-4 w-4 mr-1" />
                          {event.attendees} attendees
                        </div>
                      </div>
                      <Button className="mt-3" size="sm">
                        Register
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="groups">
          <div className="grid md:grid-cols-2 gap-6">
            {groups.map((group) => (
              <Card key={group.id}>
                <CardContent className="p-0">
                  <div className="flex">
                    <Image
                      src={group.image || "/placeholder.svg"}
                      alt={group.name}
                      width={200}
                      height={100}
                      className="w-1/3 object-cover"
                    />
                    <div className="p-4 flex-1">
                      <Link href="#" className="font-semibold hover:underline">
                        {group.name}
                      </Link>
                      <div className="mt-2 space-y-1 text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <Users className="h-4 w-4 mr-1" />
                          {group.members} members
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          {group.posts} posts in the last month
                        </div>
                      </div>
                      <Button className="mt-3" size="sm">
                        Join Group
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="content">
          <div className="text-center py-12">
            <SearchIcon className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">Enter a search term</h3>
            <p className="text-muted-foreground mt-2">Search for articles, posts, and other content</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

