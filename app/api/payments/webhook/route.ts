import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import Stripe from "stripe"
import { users, subscriptions, subscriptionPlans, invoices, notifications } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Handle Stripe webhook events
export async function POST(req) {
  const body = await req.text()
  const signature = req.headers.get("stripe-signature")

  let event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (error) {
    console.error(`Webhook signature verification failed: ${error.message}`)
    return NextResponse.json({ message: "Webhook signature verification failed" }, { status: 400 })
  }

  try {
    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object)
        break

      case "invoice.paid":
        await handleInvoicePaid(event.data.object)
        break

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object)
        break

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object)
        break

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object)
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error(`Webhook handler failed: ${error.message}`)
    return NextResponse.json({ message: "Webhook handler failed" }, { status: 500 })
  }
}

// Handle checkout session completed event
async function handleCheckoutSessionCompleted(session) {
  // Get customer and subscription details
  const customerId = session.customer
  const subscriptionId = session.subscription

  // Get user ID from metadata
  const userId = session.metadata.userId

  if (!userId) {
    throw new Error("User ID not found in session metadata")
  }

  // Get subscription details from Stripe
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const planId = subscription.items.data[0].price.product

  // Find subscription plan in database
  const subscriptionPlan = await db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.name, subscription.items.data[0].price.nickname))
    .limit(1)
  const plan = subscriptionPlan[0]

  if (!plan) {
    throw new Error("Subscription plan not found")
  }

  // Create or update subscription in database
  await db.insert(subscriptions).values({
    userId,
    planId: plan.id,
    status: "ACTIVE",
    startDate: new Date(subscription.current_period_start * 1000),
    endDate: new Date(subscription.current_period_end * 1000),
    autoRenew: subscription.cancel_at_period_end === false,
  })

  // Create invoice in database
  await db.insert(invoices).values({
    userId,
    subscriptionId: subscriptionId,
    amount: Number.parseFloat(session.amount_total) / 100,
    status: "PAID",
    dueDate: new Date(),
    paidDate: new Date(),
  })

  // Create notification for user
  await db.insert(notifications).values({
    userId,
    type: "SYSTEM",
    content: `Your subscription to ${plan.name} has been activated.`,
  })
}

// Handle invoice paid event
async function handleInvoicePaid(invoice) {
  // Get customer and subscription details
  const customerId = invoice.customer
  const subscriptionId = invoice.subscription

  // Get customer from Stripe
  const customer = await stripe.customers.retrieve(customerId)

  // Find user by email
  const userResult = await db.select().from(users).where(eq(users.email, customer.email)).limit(1)
  const user = userResult[0]

  if (!user) {
    throw new Error("User not found")
  }

  // Update invoice in database
  await db.update(invoices).set({ status: "PAID", paidDate: new Date() }).where(eq(invoices.userId, user.id))
}

// Handle invoice payment failed event
async function handleInvoicePaymentFailed(invoice) {
  // Get customer and subscription details
  const customerId = invoice.customer
  const subscriptionId = invoice.subscription

  // Get customer from Stripe
  const customer = await stripe.customers.retrieve(customerId)

  // Find user by email
  const userResult = await db.select().from(users).where(eq(users.email, customer.email)).limit(1)
  const user = userResult[0]

  if (!user) {
    throw new Error("User not found")
  }

  // Update invoice in database
  await db.update(invoices).set({ status: "OVERDUE" }).where(eq(invoices.userId, user.id))

  // Create notification for user
  await db.insert(notifications).values({
    userId: user.id,
    type: "SYSTEM",
    content: "Your payment has failed. Please update your payment method.",
    link: "/settings/billing",
  })
}

// Handle subscription updated event
async function handleSubscriptionUpdated(subscription) {
  // Get customer details
  const customerId = subscription.customer

  // Get customer from Stripe
  const customer = await stripe.customers.retrieve(customerId)

  // Find user by email
  const userResult = await db.select().from(users).where(eq(users.email, customer.email)).limit(1)
  const user = userResult[0]

  if (!user) {
    throw new Error("User not found")
  }

  // Find subscription in database
  const dbSubscriptionResult = await db.select().from(subscriptions).where(eq(subscriptions.userId, user.id))
  const dbSubscription = dbSubscriptionResult[0]

  if (!dbSubscription) {
    throw new Error("Subscription not found")
  }

  // Update subscription in database
  await db
    .update(subscriptions)
    .set({
      status: subscription.status === "active" ? "ACTIVE" : "CANCELLED",
      endDate: new Date(subscription.current_period_end * 1000),
      autoRenew: subscription.cancel_at_period_end === false,
    })
    .where(eq(subscriptions.userId, user.id))
}

// Handle subscription deleted event
async function handleSubscriptionDeleted(subscription) {
  // Get customer details
  const customerId = subscription.customer

  // Get customer from Stripe
  const customer = await stripe.customers.retrieve(customerId)

  // Find user by email
  const userResult = await db.select().from(users).where(eq(users.email, customer.email)).limit(1)
  const user = userResult[0]

  if (!user) {
    throw new Error("User not found")
  }

  // Find subscription in database
  const dbSubscriptionResult = await db.select().from(subscriptions).where(eq(subscriptions.userId, user.id))
  const dbSubscription = dbSubscriptionResult[0]

  if (!dbSubscription) {
    throw new Error("Subscription not found")
  }

  // Update subscription in database
  await db
    .update(subscriptions)
    .set({
      status: "CANCELLED",
      endDate: new Date(),
      autoRenew: false,
    })
    .where(eq(subscriptions.userId, user.id))

  // Create notification for user
  await db.insert(notifications).values({
    userId: user.id,
    type: "SYSTEM",
    content: "Your subscription has been cancelled.",
  })
}

