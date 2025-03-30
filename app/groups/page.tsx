import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Filter, Plus, Search, Users } from "lucide-react"

export default function GroupsPage() {
  const featuredGroups = [
    {
      id: 1,
      name: "Tech Innovators Network",
      description: "A community of technology leaders discussing innovation and digital transformation",
      members: 1248,
      image: "/placeholder.svg?height=200&width=400",
    },
    {
      id: 2,
      name: "Marketing Professionals",
      description: "Share strategies, campaigns, and insights with fellow marketing experts",
      members: 876,
      image: "/placeholder.svg?height=200&width=400",
    },
    {
      id: 3,
      name: "Supply Chain Solutions",
      description: "Discuss challenges and solutions in modern supply chain management",
      members: 654,
      image: "/placeholder.svg?height=200&width=400",
    },
  ]

  const myGroups = [
    {
      id: 4,
      name: "Software Development Leaders",
      description: "CTO and development leaders sharing best practices and challenges",
      members: 532,
      image: "/placeholder.svg?height=200&width=400",
    },
    {
      id: 5,
      name: "B2B Sales Strategies",
      description: "Sales professionals discussing effective B2B sales approaches",
      members: 743,
      image: "/placeholder.svg?height=200&width=400",
    },
  ]

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Groups</h1>
          <p className="text-muted-foreground">Connect with professionals in your industry</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Group
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search groups by name, description, or industry" className="pl-8" />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      <Tabs defaultValue="discover" className="mb-8">
        <TabsList>
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="my-groups">My Groups</TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredGroups.map((group) => (
              <Card key={group.id}>
                <CardContent className="p-0">
                  <Image
                    src={group.image || "/placeholder.svg"}
                    alt={group.name}
                    width={400}
                    height={200}
                    className="w-full h-40 object-cover"
                  />
                </CardContent>
                <CardHeader>
                  <CardTitle>{group.name}</CardTitle>
                  <CardDescription>{group.description}</CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-between">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="h-4 w-4 mr-1" />
                    {group.members} members
                  </div>
                  <Button>Join Group</Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Recommended for You</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  id: 6,
                  name: "Financial Technology Innovations",
                  description: "Exploring the intersection of finance and technology",
                  members: 921,
                  image: "/placeholder.svg?height=200&width=400",
                },
                {
                  id: 7,
                  name: "Sustainable Business Practices",
                  description: "Discussing environmentally responsible business strategies",
                  members: 543,
                  image: "/placeholder.svg?height=200&width=400",
                },
                {
                  id: 8,
                  name: "Data Analytics Professionals",
                  description: "Sharing insights on data-driven decision making",
                  members: 782,
                  image: "/placeholder.svg?height=200&width=400",
                },
              ].map((group) => (
                <Card key={group.id}>
                  <CardContent className="p-0">
                    <Image
                      src={group.image || "/placeholder.svg"}
                      alt={group.name}
                      width={400}
                      height={200}
                      className="w-full h-40 object-cover"
                    />
                  </CardContent>
                  <CardHeader>
                    <CardTitle>{group.name}</CardTitle>
                    <CardDescription>{group.description}</CardDescription>
                  </CardHeader>
                  <CardFooter className="flex justify-between">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-1" />
                      {group.members} members
                    </div>
                    <Button>Join Group</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="my-groups" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myGroups.map((group) => (
              <Card key={group.id}>
                <CardContent className="p-0">
                  <Image
                    src={group.image || "/placeholder.svg"}
                    alt={group.name}
                    width={400}
                    height={200}
                    className="w-full h-40 object-cover"
                  />
                </CardContent>
                <CardHeader>
                  <CardTitle>{group.name}</CardTitle>
                  <CardDescription>{group.description}</CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-between">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="h-4 w-4 mr-1" />
                    {group.members} members
                  </div>
                  <Link href={`/groups/${group.id}`}>
                    <Button variant="outline">View Group</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

