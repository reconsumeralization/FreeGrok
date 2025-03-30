import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createAdminClient } from '@/lib/supabase'
import { formatDistanceToNow } from 'date-fns'
import { FileSpreadsheet, Plus, Users, Clock } from 'lucide-react'

async function createWorkspace(formData: FormData) {
  'use server'

  const cookieStore = cookies()
  const session = await auth()

  if (!session?.user) {
    return { error: 'Not authenticated' }
  }

  const name = formData.get('name') as string
  const description = formData.get('description') as string

  if (!name || name.trim() === '') {
    return { error: 'Name is required' }
  }

  try {
    const { createServerClient } = await import('@/lib/supabase')
    const supabase = await createServerClient(cookieStore)

    const { data, error } = await supabase
      .from('data_workspaces')
      .insert({
        name,
        description,
        userId: session.user.id,
        columns: [
          { id: 'col1', name: 'Column 1', type: 'text' },
          { id: 'col2', name: 'Column 2', type: 'text' },
        ],
        data: [],
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating workspace:', error)
      return { error: 'Failed to create workspace' }
    }

    return { success: true, id: data.id }
  } catch (error) {
    console.error('Error:', error)
    return { error: 'An unexpected error occurred' }
  }
}

export default async function WorkspacesPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin')
  }

  const supabase = createAdminClient()

  // Get all workspaces owned by user or where user is a collaborator
  const { data: ownedWorkspaces } = await supabase
    .from('data_workspaces')
    .select('*, workspace_collaborators(count)')
    .eq('userId', session.user.id)
    .order('updated_at', { ascending: false })

  const { data: collaborativeWorkspaces } = await supabase
    .from('workspace_collaborators')
    .select(
      `
      workspace:workspace_id(
        id,
        name,
        description,
        updated_at,
        workspace_collaborators(count)
      )
    `
    )
    .eq('user_id', session.user.id)

  // Format collaborative workspaces to match owned workspaces format
  const collabWorkspaces = collaborativeWorkspaces
    ?.filter((item) => item.workspace) // Filter out any nulls
    .map((item) => item.workspace)

  const workspaces = [...(ownedWorkspaces || []), ...(collabWorkspaces || [])]

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Workspaces</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage your data with AI-powered spreadsheets
          </p>
        </div>

        <form action={createWorkspace}>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Workspace
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Workspace</DialogTitle>
                <DialogDescription>
                  Create a new data workspace to organize and analyze your data
                  with AI assistance.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" placeholder="My Workspace" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Input
                    id="description"
                    name="description"
                    placeholder="What this workspace is for..."
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="submit">Create Workspace</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workspaces.length === 0 ? (
          <div className="col-span-full">
            <Card className="border-dashed">
              <CardContent className="pt-6 text-center">
                <div className="flex justify-center">
                  <FileSpreadsheet className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-medium">No workspaces yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Create your first workspace to start organizing and analyzing
                  your data.
                </p>
                <div className="mt-6">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        New Workspace
                      </Button>
                    </DialogTrigger>
                    {/* Same dialog content as above */}
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          workspaces.map((workspace) => (
            <Link href={`/workspace/${workspace.id}`} key={workspace.id}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle>{workspace.name}</CardTitle>
                  <CardDescription>
                    {workspace.description || 'No description provided'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-1 h-4 w-4" />
                    Updated{' '}
                    {formatDistanceToNow(new Date(workspace.updated_at), {
                      addSuffix: true,
                    })}
                  </div>
                  <div className="flex items-center mt-2 text-sm text-muted-foreground">
                    <Users className="mr-1 h-4 w-4" />
                    {workspace.workspace_collaborators?.[0]?.count
                      ? `${workspace.workspace_collaborators[0].count} collaborators`
                      : 'No collaborators'}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full">
                    Open Workspace
                  </Button>
                </CardFooter>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
