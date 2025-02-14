import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function ClientDashboard() {
  const session = await auth()

  if (!session?.user || session.user.role !== "CLIENT") {
    redirect("/auth/login")
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Client Dashboard</h1>
      <p>Welcome, {session.user.name}!</p>
      {/* Add client-specific dashboard content here */}
    </div>
  )
}

