import { Header } from "@/app/components/header"
import EdgeFunctionDemo from "@/app/components/edge-function-demo"

export default function EdgeFunctionDemoPage() {
  return (
    <>
      <Header />
      <div className="container py-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Supabase Edge Function Demo</h1>
          <p className="mb-8 text-gray-600">
            This page demonstrates how to call a Supabase Edge Function with authentication. You must be logged in to
            use this feature since JWT verification is enabled.
          </p>

          <EdgeFunctionDemo />
        </div>
      </div>
    </>
  )
}
