import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { NewConversation } from '@/components/messaging/new-conversation'

export default async function NewMessagePage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin')
  }

  return <NewConversation />
}
