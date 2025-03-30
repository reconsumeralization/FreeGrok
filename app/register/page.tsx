import { Metadata } from 'next'
import { RegisterForm } from '@/components/auth/register-form'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Register',
  description: 'Create a new account',
}

export default async function RegisterPage() {
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
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Create an account
          </h1>
          <p className="text-sm text-muted-foreground">
            Fill out the form below to create your account
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}
