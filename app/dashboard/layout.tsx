import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import type { PropsWithChildren } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { LogOut } from "lucide-react"

async function handleSignOut() {
  "use server"
  const supabase = createSupabaseServerClient()
  await supabase.auth.signOut()
  redirect("/login")
}

export default async function DashboardLayout({ children }: PropsWithChildren) {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold">
            Contract Automation
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">{user.email}</span>
            <form action={handleSignOut}>
              <Button variant="outline" size="sm" type="submit">
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8">{children}</main>
      <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Bilingual Contract Generator
      </footer>
    </div>
  )
}
