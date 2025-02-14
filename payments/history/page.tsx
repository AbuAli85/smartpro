import type { Metadata } from "next"
import { PaymentHistory } from "@/components/payments/payment-history"

export const metadata: Metadata = {
  title: "Payment History",
  description: "View your payment history",
}

export default function PaymentHistoryPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Payment History</h1>
      <PaymentHistory />
    </div>
  )
}

