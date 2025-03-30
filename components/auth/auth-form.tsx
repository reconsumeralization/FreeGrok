"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useServiceCredentials } from "@/hooks/use-service-credentials"

const AuthForm = () => {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { setServiceCredentials } = useServiceCredentials()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    setIsLoading(true)

    try {
      // Simulate authentication logic (replace with your actual authentication)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Assuming successful authentication, store credentials and redirect
      setServiceCredentials({ email, password })
      toast({
        title: "Success!",
        description: "You have been successfully authenticated.",
      })
      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Error!",
        description: "Authentication failed. Please check your credentials.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">Authentication</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Sign In"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AuthForm

