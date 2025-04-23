import { Header } from "@/app/components/header"
import RegistrationForm from "@/app/components/registration-form"
import { UserRole } from "@/types/auth"

export default function SignupPage() {
  return (
    <>
      <Header />
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-4">
        <RegistrationForm defaultRole={UserRole.USER} />
      </div>
    </>
  )
}
