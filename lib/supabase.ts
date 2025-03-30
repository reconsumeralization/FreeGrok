import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/types/supabase'

// Environment variables validation
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

if (
  process.env.NODE_ENV === 'production' &&
  !process.env.SUPABASE_SERVICE_ROLE_KEY
) {
  console.warn('WARNING: Missing env.SUPABASE_SERVICE_ROLE_KEY')
}

// Supabase URLs and keys
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

/**
 * Create a Supabase client for server-side operations using service role (admin)
 * WARNING: This should only be used on server-side in secure contexts
 */
export const createAdminClient = () => {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Service role key is required for admin client')
  }
  return createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * Create a Supabase client for use in server components
 * This should be imported and used in server components directly
 */
export const createServerClient = async (cookieStore: any) => {
  const { createServerClient: createSupabaseServerClient } = await import(
    '@supabase/ssr'
  )
  return createSupabaseServerClient<Database>({
    cookies: () => cookieStore,
  })
}

/**
 * Create a Supabase client for middleware
 */
export const createMiddlewareClient = (req: NextRequest, res: NextResponse) => {
  const { cookies } = req
  const {
    createServerClient: createSupabaseServerClient,
  } = require('@supabase/ssr')
  return createSupabaseServerClient<Database>({
    cookies: {
      get: (name: string) => cookies.get(name)?.value,
      set: (name: string, value: string, options: any) => {
        // Convert the options to a format compatible with Next.js Response
        cookies.set(name, value, options)
      },
      remove: (name: string, options: any) => {
        cookies.delete(name, options)
      },
    },
  })
}

/**
 * Create a Supabase client for use in client components
 */
export const createBrowserClient = async () => {
  const { createBrowserClient: createSupabaseBrowserClient } = await import(
    '@supabase/ssr'
  )
  return createSupabaseBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)
}

// Direct client for use in utilities outside of React components
export const supabaseClient = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
)

// Helper for Row Level Security Policy Application
export function isUserAuthorized(
  userId: string | undefined,
  resourceOwnerId: string | undefined
): boolean {
  if (!userId || !resourceOwnerId) return false
  return userId === resourceOwnerId
}

// Type helper for RLS policies
export type RlsPolicy = {
  name: string
  definition: string
  check?: string
  using?: string
  table: string
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'ALL'
}
