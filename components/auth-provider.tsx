"use client"

import { SessionProvider } from "next-auth/react"
import { useEffect, useState } from "react"
import { useCredentials } from "@/contexts/credentials-context"

export function AuthProvider({ children, session }) {
  const { hasCredential, setCredential } = useCredentials()
  const [isConfigured, setIsConfigured] = useState(false)

  // Check if we have the required credentials in environment variables
  useEffect(() => {
    // This would normally be done server-side, but for our wizard demo
    // we're checking if we need to populate credentials from env vars
    const envVars = {
      NEXTAUTH_SECRET: process.env.NEXT_PUBLIC_NEXTAUTH_SECRET,
      GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
      LINKEDIN_CLIENT_ID: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID,
      LINKEDIN_CLIENT_SECRET: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_SECRET,
    }

    // Store any available env vars in our credentials store
    Object.entries(envVars).forEach(([key, value]) => {
      if (value && !hasCredential(key)) {
        setCredential(key, value)
      }
    })

    setIsConfigured(true)
  }, [hasCredential, setCredential])

  if (!isConfigured) {
    return null // Or a loading spinner
  }

  return <SessionProvider session={session}>{children}</SessionProvider>
}

