import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export default async function Page() {
  const users = await prisma.user.findMany()

  return (
    <div>
      <h1>Analytics Page</h1>
      <p>Number of users: {users.length}</p>
    </div>
  )
}

