'use server'

import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase'
import { type Database } from '@/types/supabase'
import { recordError } from '@/lib/monitoring'

/**
 * Sign in with email and password
 */
export async function signIn(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const redirectTo = (formData.get('redirectTo') as string) || '/dashboard'

  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    // Update last login timestamp
    if (data.user) {
      const adminClient = createAdminClient()
      await adminClient
        .from('users')
        .update({
          last_login: new Date().toISOString(),
        })
        .eq('id', data.user.id)
    }

    return {
      success: true,
      redirectTo,
    }
  } catch (error) {
    recordError(error as Error, 'auth.signIn')
    return {
      success: false,
      error: 'Failed to sign in. Please try again.',
    }
  }
}

/**
 * Sign up with email and password
 */
export async function signUp(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const username = formData.get('username') as string
  const displayName = (formData.get('displayName') as string) || username

  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    // Check if username already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .single()

    if (existingUser) {
      return {
        success: false,
        error: 'Username already taken',
      }
    }

    // Register the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          display_name: displayName,
        },
      },
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    // Create a user profile
    if (data.user) {
      const adminClient = createAdminClient()
      await adminClient.from('users').insert({
        id: data.user.id,
        email,
        username,
        display_name: displayName,
        profile_completed: false,
        role: 'user',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }

    return {
      success: true,
      message: 'Check your email to confirm your account',
    }
  } catch (error) {
    recordError(error as Error, 'auth.signUp')
    return {
      success: false,
      error: 'Failed to sign up. Please try again.',
    }
  }
}

/**
 * Sign out the current user
 */
export async function signOut() {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })
    await supabase.auth.signOut()
    return {
      success: true,
    }
  } catch (error) {
    recordError(error as Error, 'auth.signOut')
    return {
      success: false,
      error: 'Failed to sign out',
    }
  }
}

/**
 * Reset password request
 */
export async function resetPassword(formData: FormData) {
  const email = formData.get('email') as string

  try {
    const supabase = createServerComponentClient<Database>({ cookies })
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password/confirm`,
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      message: 'Check your email for password reset instructions',
    }
  } catch (error) {
    recordError(error as Error, 'auth.resetPassword')
    return {
      success: false,
      error: 'Failed to request password reset. Please try again.',
    }
  }
}

/**
 * Update user password
 */
export async function updatePassword(formData: FormData) {
  const password = formData.get('password') as string

  try {
    const supabase = createServerComponentClient<Database>({ cookies })
    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      message: 'Password updated successfully',
    }
  } catch (error) {
    recordError(error as Error, 'auth.updatePassword')
    return {
      success: false,
      error: 'Failed to update password. Please try again.',
    }
  }
}

/**
 * Get the current session
 */
export async function getSession() {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })
    const { data, error } = await supabase.auth.getSession()

    if (error || !data.session) {
      return null
    }

    return data.session
  } catch (error) {
    recordError(error as Error, 'auth.getSession')
    return null
  }
}

/**
 * Get the current user profile
 */
export async function getCurrentUser() {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return null
    }

    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()

    return data
  } catch (error) {
    recordError(error as Error, 'auth.getCurrentUser')
    return null
  }
}

/**
 * Update user profile
 */
export async function updateProfile(formData: FormData) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return {
        success: false,
        error: 'Not authenticated',
      }
    }

    const updates = {
      username: formData.get('username') as string,
      display_name: formData.get('displayName') as string,
      bio: formData.get('bio') as string,
      profile_completed: true,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', session.user.id)

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    // Also update auth metadata
    await supabase.auth.updateUser({
      data: {
        username: updates.username,
        display_name: updates.display_name,
      },
    })

    return {
      success: true,
      message: 'Profile updated successfully',
    }
  } catch (error) {
    recordError(error as Error, 'auth.updateProfile')
    return {
      success: false,
      error: 'Failed to update profile. Please try again.',
    }
  }
}
