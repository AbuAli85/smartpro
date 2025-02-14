import type { Metadata } from "next"
import { OrderList } from "@/components/orders/order-list"

export const metadata: Metadata = {
  title: "Orders",
  description: "Manage your orders",
}

export default function OrdersPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Orders</h1>
      <OrderList />
    </div>
  )
}

