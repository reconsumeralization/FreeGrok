import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { subscriptionPlans, users } from "@/lib/db/schema"
import Stripe from "stripe"
import { requireAuth } from "@/lib/auth"
import { eq } from "drizzle-orm"

// Create a function to get Stripe instance with credentials
async function getStripeInstance(req) {
  // Check if we have the credentials in the request headers
  const stripeSecretKey = req.headers.get("x-stripe-secret-key")

  if (!stripeSecretKey) {
    throw new Error("Stripe Secret Key is required")
  }

  return new Stripe(stripeSecretKey)
}

export async function POST(req) {
  try {
    const user = await requireAuth()
    const { planId, successUrl, cancelUrl } = await req.json()

    // Validate request
    if (!planId || !successUrl || !cancelUrl) {
      return NextResponse.json({ message: "Plan ID, success URL, and cancel URL are required" }, { status: 400 })
    }

    // Get subscription plan from database
    const planResult = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, planId)).limit(1)
    const plan = planResult[0]

    if (!plan) {
      return NextResponse.json({ message: "Subscription plan not found" }, { status: 404 })
    }

    // Get Stripe instance
    const stripe = await getStripeInstance(req)

    // Create or get Stripe customer
    let customerId

    const userResult = await db
      .select({ stripeCustomerId: users.stripeCustomerId })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1)
    const existingCustomer = userResult[0]

    if (existingCustomer?.stripeCustomerId) {
      customerId = existingCustomer.stripeCustomerId
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user.id,
        },
      })

      customerId = customer.id

      // Update user with Stripe customer ID
      await db.update(users).set({ stripeCustomerId: customerId }).where(eq(users.id, user.id))
    }

    // Get or create Stripe price
    let priceId

    const existingPrice = await stripe.prices.list({
      lookup_keys: [plan.id],
      active: true,
    })

    if (existingPrice.data.length > 0) {
      priceId = existingPrice.data[0].id
    } else {
      const price = await stripe.prices.create({
        unit_amount: Math.round(Number(plan.price) * 100),
        currency: "usd",
        recurring: {
          interval: plan.interval.toLowerCase(),
        },
        product_data: {
          name: plan.name,
          description: plan.description || undefined,
          metadata: {
            planId: plan.id,
          },
        },
        lookup_key: plan.id,
      })

      priceId = price.id
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: user.id,
        planId: plan.id,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Create checkout error:", error)
    return NextResponse.json(
      {
        message: error.message || "Internal server error",
        requiresCredentials: error.message.includes("Stripe Secret Key is required"),
      },
      { status: 500 },
    )
  }
}

