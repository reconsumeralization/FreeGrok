"use client"

import { useCredentials } from "@/contexts/credentials-context"

export function useServiceCredentials() {
  const { requestCredential } = useCredentials()

  const getOpenAIKey = async () => {
    return requestCredential("OPENAI_API_KEY", "An OpenAI API key is required to use AI-powered content moderation.")
  }

  const getStripeKeys = async () => {
    const secretKey = await requestCredential(
      "STRIPE_SECRET_KEY",
      "A Stripe Secret Key is required to process payments.",
    )

    const webhookSecret = await requestCredential(
      "STRIPE_WEBHOOK_SECRET",
      "A Stripe Webhook Secret is required to handle payment events.",
    )

    return { secretKey, webhookSecret }
  }

  const getAuthProviderCredentials = async (provider: "google" | "linkedin") => {
    if (provider === "google") {
      const clientId = await requestCredential(
        "GOOGLE_CLIENT_ID",
        "A Google Client ID is required for Google authentication.",
      )

      const clientSecret = await requestCredential(
        "GOOGLE_CLIENT_SECRET",
        "A Google Client Secret is required for Google authentication.",
      )

      return { clientId, clientSecret }
    } else {
      const clientId = await requestCredential(
        "LINKEDIN_CLIENT_ID",
        "A LinkedIn Client ID is required for LinkedIn authentication.",
      )

      const clientSecret = await requestCredential(
        "LINKEDIN_CLIENT_SECRET",
        "A LinkedIn Client Secret is required for LinkedIn authentication.",
      )

      return { clientId, clientSecret }
    }
  }

  return {
    getOpenAIKey,
    getStripeKeys,
    getAuthProviderCredentials,
  }
}

