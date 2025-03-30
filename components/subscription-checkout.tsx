"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useServiceCredentials } from "@/hooks/use-service-credentials"

interface SubscriptionCheckoutProps {
  planId: string
  buttonText?: string
  variant?: "default" | "outline" | "secondary" | "destructive" | "ghost" | "link"
  className?: string
}

export function SubscriptionCheckout({
  planId,
  buttonText = "Subscribe",
  variant = "default",
  className = "",
}: SubscriptionCheckoutProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { getStripeKeys } = useServiceCredentials()
  const [isLoading, setIsLoading] = useState(false)

  const handleCheckout = async () => {
    setIsLoading(true)

    try {
      // Get Stripe credentials when needed
      const { secretKey } = await getStripeKeys()

      const response = await fetch("/api/payments/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-stripe-secret-key": secretKey,
        },
        body: JSON.stringify({
          planId,
          successUrl: `${window.location.origin}/settings/billing?success=true`,
          cancelUrl: `${window.location.origin}/settings/billing?canceled=true`,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to create checkout session")
      }

      // Redirect to Stripe checkout
      window.location.href = data.url
    } catch (error) {
      console.error("Subscription error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to process subscription",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button variant={variant} className={className} onClick={handleCheckout} disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        buttonText
      )}
    </Button>
  )
}

