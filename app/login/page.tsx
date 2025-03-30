import { Metadata } from 'next'
import { LoginForm } from '@/components/auth/login-form'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login to your account',
}

export default async function LoginPage() {
  // Check if user is already logged in
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If already logged in, redirect to dashboard
  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your credentials to sign in to your account
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
