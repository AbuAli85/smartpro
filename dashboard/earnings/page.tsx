import { Suspense } from "react"
import { EarningsOverview } from "@/components/dashboard/earnings-overview"
import { PayoutHistory } from "@/components/dashboard/payout-history"
import { LoadingState } from "@/components/ui/loading-state"

export default function EarningsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold tracking-tight text-primary">Earnings & Payouts</h1>
      <Suspense fallback={<LoadingState />}>
        <EarningsOverview />
      </Suspense>
      <Suspense fallback={<LoadingState />}>
        <PayoutHistory />
      </Suspense>
    </div>
  )
}

