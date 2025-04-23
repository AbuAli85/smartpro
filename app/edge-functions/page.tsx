import { Header } from "@/app/components/header"
import EdgeFunctionDemo from "@/app/components/edge-function-demo"

export default function EdgeFunctionsPage() {
  return (
    <>
      <Header />
      <div className="container py-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Supabase Edge Functions</h1>
          <p className="mb-8 text-gray-600">
            This page demonstrates how to securely call Supabase Edge Functions with authentication. The Edge Function
            client automatically handles authentication tokens and error handling.
          </p>

          <EdgeFunctionDemo />
        </div>
      </div>
    </>
  )
}
