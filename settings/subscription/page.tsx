import type { Metadata } from "next"
import { PricingPlans } from "@/components/subscription/pricing-plans"

export const metadata: Metadata = {
  title: "Subscription Settings",
  description: "Manage your subscription plan",
}

export default function SubscriptionPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Subscription Plans</h1>
      <PricingPlans />
    </div>
  )
}

