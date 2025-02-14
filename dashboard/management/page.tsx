import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function ManagementDashboard() {
  const session = await auth()

  if (!session?.user || session.user.role !== "management") {
    redirect("/dashboard")
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Management Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Disputes</h2>
          <p>Monitor and resolve user disputes.</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Service Quality</h2>
          <p>Monitor and maintain service quality standards.</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Verifications & Approvals</h2>
          <p>Assist in user verifications and service approvals.</p>
        </div>
      </div>
    </div>
  )
}

