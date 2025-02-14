import { getServerSession } from "next-auth/next"
import { authOptions } from "../api/auth/[...nextauth]/auth-options"
import { redirect } from "next/navigation"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  return (
    <div>
      <h1>Profile</h1>
      <p>Welcome, {session.user.name}!</p>
      {/* Add more profile content here */}
    </div>
  )
}

