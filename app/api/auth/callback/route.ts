import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    // Create a Supabase client configured to use cookies
    const supabase = createRouteHandlerClient({ cookies })

    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code)
  }

  // URL to redirect to after sign in process completes
  const redirectTo = requestUrl.searchParams.get('redirectTo') || '/dashboard'

  return NextResponse.redirect(new URL(redirectTo, requestUrl.origin))
}

// Make sure to export this config to allow the route handler to use cookies
