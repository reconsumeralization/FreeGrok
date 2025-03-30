import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building, Edit, Globe, Mail, MapPin, Phone, Share2, Users } from "lucide-react"

export default function BusinessProfile() {
  return (
    <div className="container py-8">
      <Card className="border-none shadow-none">
        <CardContent className="p-0">
          <div className="relative">
            <div className="h-48 w-full bg-gradient-to-r from-primary/20 to-primary/40 rounded-t-lg">
              <Button variant="ghost" size="icon" className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm">
                <Edit className="h-4 w-4" />
              </Button>
            </div>
            <div className="absolute bottom-0 left-8 transform translate-y-1/2">
              <div className="h-24 w-24 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold border-4 border-background">
                BC
              </div>
            </div>
          </div>

          <div className="mt-16 px-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold">Business Connect Technologies</h1>
                <p className="text-muted-foreground">Enterprise Software Solutions</p>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>San Francisco, CA</span>
                  <span className="mx-1">•</span>
                  <Globe className="h-4 w-4" />
                  <Link href="#" className="text-primary hover:underline">
                    businessconnect.com
                  </Link>
                </div>
              </div>
              <div className="flex gap-2">
                <Button>
                  <Mail className="h-4 w-4 mr-2" />
                  Message
                </Button>
                <Button variant="outline">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-6 mt-6">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span>
                  <strong>1,248</strong> connections
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-muted-foreground" />
                <span>
                  <strong>51-200</strong> employees
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="about" className="mt-8">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0">
          <TabsTrigger
            value="about"
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary py-3"
          >
            About
          </TabsTrigger>
          <TabsTrigger
            value="posts"
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary py-3"
          >
            Posts
          </TabsTrigger>
          <TabsTrigger
            value="products"
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary py-3"
          >
            Products & Services
          </TabsTrigger>
          <TabsTrigger
            value="connections"
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary py-3"
          >
            Connections
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary py-3"
          >
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="mt-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">About Business Connect Technologies</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    Business Connect Technologies is a leading provider of enterprise software solutions, specializing
                    in B2B integration platforms, CRM systems, and business intelligence tools. Founded in 2015, we've
                    helped over 500 businesses streamline their operations and improve their digital transformation
                    journey.
                  </p>
                  <p className="mt-4">
                    Our mission is to connect businesses through innovative technology solutions that drive growth and
                    efficiency. We believe in building long-term partnerships with our clients and providing exceptional
                    service and support.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Specialties</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Enterprise Software",
                      "CRM Solutions",
                      "Business Intelligence",
                      "API Integration",
                      "Cloud Services",
                      "Digital Transformation",
                      "Data Analytics",
                      "SaaS",
                    ].map((specialty, index) => (
                      <div key={index} className="bg-muted rounded-full px-3 py-1 text-sm">
                        {specialty}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Company Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-[20px_1fr] gap-2 items-start">
                    <Building className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Industry</p>
                      <p className="text-sm text-muted-foreground">Information Technology & Services</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-[20px_1fr] gap-2 items-start">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Company size</p>
                      <p className="text-sm text-muted-foreground">51-200 employees</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-[20px_1fr] gap-2 items-start">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Website</p>
                      <Link href="#" className="text-sm text-primary hover:underline">
                        businessconnect.com
                      </Link>
                    </div>
                  </div>
                  <div className="grid grid-cols-[20px_1fr] gap-2 items-start">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">+1 (415) 555-0123</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-[20px_1fr] gap-2 items-start">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">contact@businessconnect.com</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md overflow-hidden bg-muted h-40 flex items-center justify-center">
                    <MapPin className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="mt-3">
                    <p className="font-medium">Headquarters</p>
                    <p className="text-sm text-muted-foreground">
                      123 Market Street, Suite 400
                      <br />
                      San Francisco, CA 94105
                      <br />
                      United States
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="products" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: "Enterprise Connect Platform",
                description:
                  "A comprehensive B2B integration platform that connects your business systems with partners and suppliers.",
                image: "/placeholder.svg?height=200&width=300",
              },
              {
                name: "BusinessIQ Analytics",
                description:
                  "Advanced business intelligence tools that provide actionable insights from your business data.",
                image: "/placeholder.svg?height=200&width=300",
              },
              {
                name: "ConnectCRM",
                description: "Customer relationship management system designed specifically for B2B relationships.",
                image: "/placeholder.svg?height=200&width=300",
              },
            ].map((product, index) => (
              <Card key={index}>
                <CardContent className="p-0">
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    width={300}
                    height={200}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
                    <Button variant="outline" className="mt-4 w-full">
                      Learn More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Engagement</CardTitle>
                <CardDescription>Last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-muted rounded-md">
                  <p className="text-muted-foreground">Analytics chart would appear here</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Connection Growth</CardTitle>
                <CardDescription>Last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center bg-muted rounded-md">
                  <p className="text-muted-foreground">Analytics chart would appear here</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Post Performance</CardTitle>
                <CardDescription>Engagement metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Impressions</span>
                    <span className="font-medium">12,458</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full">
                    <div className="h-2 bg-primary rounded-full w-[85%]"></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Engagement Rate</span>
                    <span className="font-medium">4.2%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full">
                    <div className="h-2 bg-primary rounded-full w-[42%]"></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Click-through Rate</span>
                    <span className="font-medium">2.8%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full">
                    <div className="h-2 bg-primary rounded-full w-[28%]"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lead Generation</CardTitle>
                <CardDescription>Conversion metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Profile Views to Contacts</span>
                    <span className="font-medium">3.5%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full">
                    <div className="h-2 bg-primary rounded-full w-[35%]"></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Message Response Rate</span>
                    <span className="font-medium">68%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full">
                    <div className="h-2 bg-primary rounded-full w-[68%]"></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Connection Acceptance</span>
                    <span className="font-medium">82%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full">
                    <div className="h-2 bg-primary rounded-full w-[82%]"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

