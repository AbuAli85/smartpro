import { Suspense } from "react"
import { ServiceList } from "@/components/dashboard/service-list"
import { LoadingState } from "@/components/ui/loading-state"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ServicesPage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary">Services</h1>
        <Button asChild>
          <Link href="/dashboard/services/create">Add New Service</Link>
        </Button>
      </div>
      <Suspense fallback={<LoadingState />}>
        <ServiceList />
      </Suspense>
    </div>
  )
}

