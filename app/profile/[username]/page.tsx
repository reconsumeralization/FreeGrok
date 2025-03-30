import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileHeader } from "@/components/profile/profile-header"
import { ProfileInfo } from "@/components/profile/profile-info"
import { ProfileVisibility } from "@/components/profile/profile-visibility"

interface ProfilePageProps {
  params: {
    username: string
  }
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  // This would normally fetch the user data from your database
  // For now, we'll use mock data
  const user = getMockUser(params.username)

  if (!user) {
    return {
      title: "User Not Found",
      description: "The requested profile could not be found.",
    }
  }

  return {
    title: `${user.name} | Professional Profile`,
    description: `View ${user.name}'s professional profile, experience, and connect with them.`,
  }
}

export default function ProfilePage({ params }: ProfilePageProps) {
  // This would normally fetch the user data from your database
  // For now, we'll use mock data
  const user = getMockUser(params.username)

  if (!user) {
    notFound()
  }

  return (
    <div className="container max-w-4xl py-6">
      <ProfileHeader user={user} />

      <Tabs defaultValue="profile" className="mt-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          {user.isCurrentUser && <TabsTrigger value="settings">Settings</TabsTrigger>}
        </TabsList>

        <TabsContent value="profile">
          <ProfileInfo user={user} />
        </TabsContent>

        <TabsContent value="activity">
          <div className="p-4 text-center text-muted-foreground">No recent activity to display.</div>
        </TabsContent>

        {user.isCurrentUser && (
          <TabsContent value="settings">
            <div className="p-4 space-y-6">
              <ProfileVisibility />
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

// Mock data function - in a real app, this would be a database query
function getMockUser(username: string) {
  // For demo purposes, we'll return a mock user
  // In a real app, you would fetch this from your database

  const isCurrentUser = username === "johndoe"

  return {
    id: "1",
    name: "John Doe",
    title: "Senior Product Manager",
    company: "Tech Innovations Inc.",
    location: "San Francisco, CA",
    profileImage: "/placeholder.svg?height=200&width=200",
    coverImage: "/placeholder.svg?height=800&width=1600",
    about:
      "Product leader with 10+ years of experience in SaaS and B2B products. Passionate about creating solutions that solve real business problems and drive growth.",
    isCurrentUser,
    isConnected: !isCurrentUser && username !== "janedoe",
    isPending: username === "janedoe",
    experience: [
      {
        id: "exp1",
        title: "Senior Product Manager",
        company: "Tech Innovations Inc.",
        startDate: "Jan 2020",
        endDate: null,
        description:
          "Leading product strategy and development for B2B SaaS platform. Increased user engagement by 45% and reduced churn by 20%.",
      },
      {
        id: "exp2",
        title: "Product Manager",
        company: "Software Solutions Ltd.",
        startDate: "Mar 2017",
        endDate: "Dec 2019",
        description: "Managed the development and launch of 3 major product features that increased revenue by 30%.",
      },
    ],
    education: [
      {
        id: "edu1",
        school: "Stanford University",
        degree: "MBA",
        field: "Business Administration",
        startYear: "2015",
        endYear: "2017",
      },
      {
        id: "edu2",
        school: "University of California, Berkeley",
        degree: "BS",
        field: "Computer Science",
        startYear: "2011",
        endYear: "2015",
      },
    ],
    skills: [
      "Product Management",
      "Product Strategy",
      "User Experience",
      "Market Research",
      "Agile Methodologies",
      "Data Analysis",
      "Team Leadership",
      "B2B SaaS",
      "Product Development",
    ],
    website: "https://johndoe.com",
    socialLinks: [
      {
        platform: "LinkedIn",
        url: "https://linkedin.com/in/johndoe",
      },
      {
        platform: "Twitter",
        url: "https://twitter.com/johndoe",
      },
    ],
  }
}

