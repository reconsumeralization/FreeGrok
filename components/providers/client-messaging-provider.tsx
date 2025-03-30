'use client'

import { MessagingProvider } from './messaging-provider'

interface ClientMessagingProviderProps {
  userId?: string
  children: React.ReactNode
}

export function ClientMessagingProvider({
  userId,
  children,
}: ClientMessagingProviderProps) {
  if (!userId) {
    return <>{children}</>
  }

  return <MessagingProvider userId={userId}>{children}</MessagingProvider>
}
