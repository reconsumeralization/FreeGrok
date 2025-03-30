import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ConversationList } from '@/components/messaging/conversation-list'

export default async function MessagesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect('/auth/signin')
  }

  return (
    <div className="h-screen flex flex-col">
      <main className="flex flex-1 overflow-hidden">
        {/* Conversation list - fixed width on desktop, slide on mobile */}
        <div className="w-80 border-r overflow-y-auto h-full hidden md:block">
          <ConversationList />
        </div>

        {/* Current conversation or empty state */}
        <div className="flex-1 overflow-y-auto h-full">{children}</div>
      </main>
    </div>
  )
}
