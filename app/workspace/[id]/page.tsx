import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { DataGrid } from '@/components/data-workspace/data-grid'
import { createAdminClient } from '@/lib/supabase'

export default async function WorkspacePage({
  params,
}: {
  params: { id: string }
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin')
  }

  const user = session.user
  const workspaceId = params.id
  const supabase = createAdminClient()

  // Fetch workspace data
  const { data: workspace, error } = await supabase
    .from('data_workspaces')
    .select(
      `
      *,
      workspace_collaborators(
        user_id,
        role,
        users:user_id(id, name, image)
      )
    `
    )
    .eq('id', workspaceId)
    .single()

  // Check if workspace exists and user has access
  if (error || !workspace) {
    redirect('/workspace')
  }

  // Check if user is owner or collaborator
  const isOwner = workspace.userId === user.id
  const isCollaborator = workspace.workspace_collaborators?.some(
    (collab) => collab.user_id === user.id
  )

  if (!isOwner && !isCollaborator) {
    redirect('/workspace')
  }

  // Format collaborators for the component
  const collaborators =
    workspace.workspace_collaborators
      ?.filter((collab) => collab.user_id !== user.id)
      .map((collab) => ({
        id: collab.user_id,
        name: collab.users?.name || 'Unknown User',
        image: collab.users?.image || undefined,
        role: collab.role,
      })) || []

  // Handle saving changes to the workspace
  const handleSave = async (
    data: any[],
    columns: { id: string; name: string; type: string }[]
  ) => {
    'use server'

    const cookieStore = cookies()
    const { createServerClient } = await import('@/lib/supabase')
    const supabase = await createServerClient(cookieStore)

    await supabase
      .from('data_workspaces')
      .update({
        data,
        columns,
        updated_at: new Date().toISOString(),
      })
      .eq('id', workspaceId)
  }

  return (
    <div className="h-screen flex flex-col">
      <DataGrid
        initialData={workspace.data || []}
        initialColumns={
          workspace.columns || [{ id: 'col1', name: 'Column 1', type: 'text' }]
        }
        workspaceId={workspaceId}
        workspaceName={workspace.name}
        userId={user.id}
        userName={user.name || user.email || 'User'}
        userImage={user.image}
        collaborators={collaborators}
        onSave={handleSave}
      />
    </div>
  )
}
