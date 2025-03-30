"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { secureStore, secureRetrieve, secureClear } from "@/lib/secure-storage"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

// Define the different profile completion stages
export enum ProfileStage {
  BASIC = "basic", // Name, email, password
  PERSONAL = "personal", // Job title, bio, profile picture
  COMPANY = "company", // Company details
  INTERESTS = "interests", // Industry interests, topics
  CONNECTIONS = "connections", // Initial connections
  COMPLETE = "complete", // Fully completed profile
}

// Define the user profile data structure
interface UserProfile {
  id?: string
  name?: string
  email?: string
  profilePicture?: string
  jobTitle?: string
  bio?: string
  company?: {
    name?: string
    industry?: string
    size?: string
    website?: string
    logo?: string
  }
  interests?: string[]
  skills?: string[]
  location?: string
  profileStage: ProfileStage
  profileCompletion: number // 0-100%
}

// Define the context type
interface UserContextType {
  user: UserProfile | null
  isLoading: boolean
  updateProfile: (data: Partial<UserProfile>) => Promise<void>
  getRequiredFields: (forStage?: ProfileStage) => string[]
  getCurrentStage: () => ProfileStage
  getNextRequiredStage: () => ProfileStage | null
  promptForProfileCompletion: (requiredStage: ProfileStage) => Promise<boolean>
  logout: () => void
}

// Create the context
const UserContext = createContext<UserContextType | undefined>(undefined)

// Provider component
export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  // Load user data on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Try to get user from secure storage
        const storedUser = secureRetrieve("user_profile")

        // If we have a stored user, use it
        if (storedUser) {
          setUser(storedUser)
        } else {
          // Otherwise check if we're logged in via the API
          const response = await fetch("/api/user/profile")
          if (response.ok) {
            const userData = await response.json()
            setUser(userData)
            secureStore("user_profile", userData)
          }
        }
      } catch (error) {
        console.error("Error loading user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  // Update the user profile
  const updateProfile = async (data: Partial<UserProfile>) => {
    try {
      if (!user) return

      // Calculate new profile completion percentage
      const updatedUser = { ...user, ...data }
      const completionPercentage = calculateProfileCompletion(updatedUser)

      // Determine the profile stage based on completion
      const profileStage = determineProfileStage(updatedUser)

      const finalUpdatedUser = {
        ...updatedUser,
        profileCompletion: completionPercentage,
        profileStage,
      }

      // Update locally
      setUser(finalUpdatedUser)
      secureStore("user_profile", finalUpdatedUser)

      // Send to API
      await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalUpdatedUser),
      })

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Update failed",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Calculate profile completion percentage
  const calculateProfileCompletion = (profile: UserProfile): number => {
    const fields = [
      !!profile.name,
      !!profile.email,
      !!profile.profilePicture,
      !!profile.jobTitle,
      !!profile.bio,
      !!profile.company?.name,
      !!profile.company?.industry,
      !!profile.company?.website,
      !!profile.interests && profile.interests.length > 0,
      !!profile.skills && profile.skills.length > 0,
      !!profile.location,
    ]

    const completedFields = fields.filter(Boolean).length
    return Math.round((completedFields / fields.length) * 100)
  }

  // Determine the profile stage based on completed fields
  const determineProfileStage = (profile: UserProfile): ProfileStage => {
    if (!profile.name || !profile.email) {
      return ProfileStage.BASIC
    }

    if (!profile.jobTitle || !profile.bio || !profile.profilePicture) {
      return ProfileStage.PERSONAL
    }

    if (!profile.company?.name || !profile.company?.industry) {
      return ProfileStage.COMPANY
    }

    if (!profile.interests || profile.interests.length === 0) {
      return ProfileStage.INTERESTS
    }

    // Check if the user has made any connections
    // This would typically involve an API call, but for simplicity:
    if (profile.profileCompletion < 90) {
      return ProfileStage.CONNECTIONS
    }

    return ProfileStage.COMPLETE
  }

  // Get the required fields for a specific stage
  const getRequiredFields = (forStage?: ProfileStage): string[] => {
    const stage = forStage || (user ? user.profileStage : ProfileStage.BASIC)

    switch (stage) {
      case ProfileStage.BASIC:
        return ["name", "email"]
      case ProfileStage.PERSONAL:
        return ["jobTitle", "bio", "profilePicture"]
      case ProfileStage.COMPANY:
        return ["company.name", "company.industry", "company.website"]
      case ProfileStage.INTERESTS:
        return ["interests", "skills"]
      case ProfileStage.CONNECTIONS:
        return ["connections"]
      default:
        return []
    }
  }

  // Get the current profile stage
  const getCurrentStage = (): ProfileStage => {
    return user ? user.profileStage : ProfileStage.BASIC
  }

  // Get the next required stage for profile completion
  const getNextRequiredStage = (): ProfileStage | null => {
    if (!user) return ProfileStage.BASIC

    const stages = [
      ProfileStage.BASIC,
      ProfileStage.PERSONAL,
      ProfileStage.COMPANY,
      ProfileStage.INTERESTS,
      ProfileStage.CONNECTIONS,
      ProfileStage.COMPLETE,
    ]

    const currentIndex = stages.indexOf(user.profileStage)
    return currentIndex < stages.length - 1 ? stages[currentIndex + 1] : null
  }

  // Prompt the user to complete their profile for a specific stage
  const promptForProfileCompletion = async (requiredStage: ProfileStage): Promise<boolean> => {
    if (!user) return false

    // If the user has already completed this stage or beyond, return true
    const stages = [
      ProfileStage.BASIC,
      ProfileStage.PERSONAL,
      ProfileStage.COMPANY,
      ProfileStage.INTERESTS,
      ProfileStage.CONNECTIONS,
      ProfileStage.COMPLETE,
    ]

    const currentIndex = stages.indexOf(user.profileStage)
    const requiredIndex = stages.indexOf(requiredStage)

    if (currentIndex >= requiredIndex) {
      return true
    }

    // Otherwise, prompt the user to complete their profile
    toast({
      title: "Profile completion required",
      description: `Please complete your profile to access this feature.`,
      action: (
        <button
          onClick={() => router.push("/profile/edit")}
          className="rounded bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
        >
          Complete Profile
        </button>
      ),
    })

    return false
  }

  // Logout function
  const logout = () => {
    setUser(null)
    secureClear()
    router.push("/auth/signin")
  }

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        updateProfile,
        getRequiredFields,
        getCurrentStage,
        getNextRequiredStage,
        promptForProfileCompletion,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

// Hook for using the user context
export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}

