import { Suspense } from "react"
import { ServiceList } from "@/components/services/service-list"
import { Toaster } from 'sonner';

export const revalidate = 60 // revalidate this page every 60 seconds

export default function Page() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Services</h1>
      <Suspense fallback={<div>Loading services...</div>}>
        <ServiceList />
      </Suspense>
    </div>
  )
}

