import type { Metadata } from "next"
import { ServiceList } from "@/components/services/service-list"
import { ServiceForm } from "@/components/services/service-form"

export const metadata: Metadata = {
  title: "Provider Services",
  description: "Manage your service offerings",
}

export default function ProviderServicesPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Manage Services</h1>
      <div className="grid gap-8">
        <ServiceForm />
        <ServiceList />
      </div>
    </div>
  )
}

