import { Suspense } from "react"
import { OrderList } from "@/components/dashboard/order-list"
import { LoadingState } from "@/components/ui/loading-state"

export default function OrdersPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold tracking-tight text-primary">Orders</h1>
      <Suspense fallback={<LoadingState />}>
        <OrderList />
      </Suspense>
    </div>
  )
}

