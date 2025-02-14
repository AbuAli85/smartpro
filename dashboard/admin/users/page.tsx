import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"
import { prisma } from "@/lib/prisma"

export default async function UsersPage() {
  const session = await auth()

  if (!session?.user || session.user.role !== "admin") {
    redirect("/auth/login")
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isApproved: true,
      emailVerified: true,
      createdAt: true,
    },
  })

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      <DataTable columns={columns} data={users} />
    </div>
  )
}

