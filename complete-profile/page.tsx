import { auth } from "@/lib/auth"
// ... rest of the imports

export default async function CompleteProfilePage() {
  const session = await auth()
  // ... rest of the component
}

