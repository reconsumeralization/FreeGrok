"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"
import { SubscriptionCheckout } from "@/components/subscription-checkout"

interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  interval: string
  features: string[]
  isPopular?: boolean
}

interface SubscriptionPlansProps {
  plans: SubscriptionPlan[]
  currentPlanId?: string
}

export function SubscriptionPlans({ plans, currentPlanId }: SubscriptionPlansProps) {
  const formatPrice = (price: number, interval: string) => {
    return (
      new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
      }).format(price) + (interval === "MONTHLY" ? "/mo" : interval === "ANNUAL" ? "/yr" : "/qtr")
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {plans.map((plan) => (
        <Card key={plan.id} className={`flex flex-col ${plan.isPopular ? "border-primary shadow-md" : ""}`}>
          {plan.isPopular && (
            <div className="absolute top-0 right-0 -mt-2 -mr-2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
              Popular
            </div>
          )}
          <CardHeader>
            <CardTitle>{plan.name}</CardTitle>
            <CardDescription>{plan.description}</CardDescription>
            <div className="mt-4">
              <span className="text-3xl font-bold">{formatPrice(plan.price, plan.interval)}</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-2">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            {currentPlanId === plan.id ? (
              <Button className="w-full" disabled>
                Current Plan
              </Button>
            ) : (
              <SubscriptionCheckout planId={plan.id} className="w-full" />
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

