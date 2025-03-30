import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SubscriptionPlans } from "@/components/subscription-plans"
import { getCurrentUser } from "@/lib/auth"
import { db } from "@/lib/db"

export default async function BillingPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/signin")
  }

  // Get user's current subscription
  const subscription = await db.subscription.findFirst({
    where: {
      userId: user.id,
      status: "ACTIVE",
    },
    include: {
      plan: true,
    },
  })

  // Get all subscription plans
  const plans = await db.subscriptionPlan.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      price: "asc",
    },
  })

  // Format plans for component
  const formattedPlans = plans.map((plan) => ({
    id: plan.id,
    name: plan.name,
    description: plan.description || "",
    price: Number(plan.price),
    interval: plan.interval,
    features: plan.features,
    isPopular: plan.name.includes("Professional"),
  }))

  // Get user's invoices
  const invoices = await db.invoice.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
  })

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Billing & Subscription</h1>
        <p className="text-muted-foreground">Manage your subscription and payment methods</p>
      </div>

      <Tabs defaultValue="subscription">
        <TabsList className="mb-6">
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value="subscription">
          {subscription ? (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Current Subscription</CardTitle>
                <CardDescription>Your current subscription plan and details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{subscription.plan.name}</h3>
                    <p className="text-muted-foreground">{subscription.plan.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Billing Period</p>
                      <p className="font-medium">
                        {subscription.plan.interval.charAt(0) + subscription.plan.interval.slice(1).toLowerCase()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Price</p>
                      <p className="font-medium">
                        ${Number(subscription.plan.price).toFixed(2)} /
                        {subscription.plan.interval === "MONTHLY"
                          ? "month"
                          : subscription.plan.interval === "ANNUAL"
                            ? "year"
                            : "quarter"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Renewal Date</p>
                      <p className="font-medium">{new Date(subscription.endDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="font-medium">{subscription.status === "ACTIVE" ? "Active" : "Inactive"}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>No Active Subscription</CardTitle>
                <CardDescription>
                  You don't have an active subscription. Choose a plan below to get started.
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          <h2 className="text-2xl font-bold mb-6">Available Plans</h2>
          <SubscriptionPlans plans={formattedPlans} currentPlanId={subscription?.planId} />
        </TabsContent>

        <TabsContent value="payment-methods">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Manage your payment methods</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Payment methods are managed through our secure payment provider. You can add or update payment methods
                during the checkout process.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>Your billing history</CardDescription>
            </CardHeader>
            <CardContent>
              {invoices.length > 0 ? (
                <div className="space-y-4">
                  <div className="rounded-md border">
                    <table className="min-w-full divide-y divide-border">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Amount</th>
                          <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                          <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {invoices.map((invoice) => (
                          <tr key={invoice.id}>
                            <td className="px-4 py-3 text-sm">{new Date(invoice.createdAt).toLocaleDateString()}</td>
                            <td className="px-4 py-3 text-sm">${Number(invoice.amount).toFixed(2)}</td>
                            <td className="px-4 py-3 text-sm">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  invoice.status === "PAID"
                                    ? "bg-green-100 text-green-800"
                                    : invoice.status === "PENDING"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                }`}
                              >
                                {invoice.status.charAt(0) + invoice.status.slice(1).toLowerCase()}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-right">
                              <a href="#" className="text-primary hover:underline">
                                Download
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No invoices found.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

