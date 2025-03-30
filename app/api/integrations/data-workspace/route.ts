import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { auth } from '@/lib/auth'
import OpenAI from 'openai'
import { StreamingTextResponse, OpenAIStream } from 'ai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface DataWorkspaceRequest {
  query?: string
  data?: any[]
  columns?: string[]
  workspaceId?: string
  mediaIds?: string[]
}

export async function POST(req: NextRequest) {
  try {
    // Authenticate the user
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const supabase = createAdminClient()
    const body: DataWorkspaceRequest = await req.json()

    // If this is an AI query about the data
    if (body.query && body.data) {
      const { query, data, columns } = body

      // Use OpenAI to analyze the data
      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: `You are an AI business assistant helping analyze spreadsheet data.
            The user has a workspace with the following columns: ${columns?.join(
              ', '
            )}.
            Provide professional business insights based on this data.`,
          },
          {
            role: 'user',
            content: `My data: ${JSON.stringify(data.slice(0, 10))}
            My question: ${query}`,
          },
        ],
        stream: true,
      })

      // Create a streaming response
      const stream = OpenAIStream(response)
      return new StreamingTextResponse(stream)
    }

    // If creating/updating a workspace
    if (body.workspaceId) {
      // Save workspace to database
      const { data, error } = await supabase
        .from('data_workspaces')
        .upsert({
          id: body.workspaceId || crypto.randomUUID(),
          user_id: userId,
          data: body.data || [],
          columns: body.columns || [],
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      // If there are associated media files
      if (body.mediaIds && body.mediaIds.length > 0) {
        // Link media to workspace
        await supabase.from('workspace_media').upsert(
          body.mediaIds.map((mediaId) => ({
            workspace_id: data.id,
            media_id: mediaId,
            user_id: userId,
          }))
        )
      }

      return NextResponse.json(data)
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  } catch (error) {
    console.error('Workspace API error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

// Get workspace data by ID
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const supabase = createAdminClient()

    // Get workspaceId from URL
    const url = new URL(req.url)
    const workspaceId = url.searchParams.get('id')

    if (!workspaceId) {
      // Return all user workspaces
      const { data, error } = await supabase
        .from('data_workspaces')
        .select('id, name, created_at, updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json(data)
    }

    // Get specific workspace with its media
    const { data: workspace, error } = await supabase
      .from('data_workspaces')
      .select(
        `
        *,
        workspace_media(
          media_id,
          media:media_id(id, type, url, title)
        )
      `
      )
      .eq('id', workspaceId)
      .eq('user_id', userId)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(workspace)
  } catch (error) {
    console.error('Workspace API error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
