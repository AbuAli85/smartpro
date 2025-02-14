import { Suspense } from "react"
import { ProfileForm } from "@/components/dashboard/profile-form"
import { LoadingState } from "@/components/ui/loading-state"

export default function ProfilePage() {
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold tracking-tight text-primary">Profile</h1>
      <Suspense fallback={<LoadingState />}>
        <ProfileForm />
      </Suspense>
    </div>
  )
}

