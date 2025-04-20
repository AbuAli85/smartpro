"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/contexts/auth-context"
import { Menu, X, Home, FileText, LayoutTemplate, Users, Settings } from "lucide-react"

export default function MobileNavigation() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [open, setOpen] = useState(false)

  const closeSheet = () => setOpen(false)

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[80%] max-w-[300px] sm:max-w-sm">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between border-b pb-4 mb-4">
            <span className="text-lg font-bold">Contract Generator</span>
            <Button variant="ghost" size="icon" onClick={closeSheet}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="flex-1">
            <ul className="space-y-2">
              {user ? (
                <>
                  <li>
                    <Link
                      href="/dashboard"
                      onClick={closeSheet}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                        isActive("/dashboard") ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                      }`}
                    >
                      <Home className="h-5 w-5" />
                      <span>Dashboard</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contracts"
                      onClick={closeSheet}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                        isActive("/contracts") ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                      }`}
                    >
                      <FileText className="h-5 w-5" />
                      <span>Contracts</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/templates"
                      onClick={closeSheet}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                        isActive("/templates") ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                      }`}
                    >
                      <LayoutTemplate className="h-5 w-5" />
                      <span>Templates</span>
                    </Link>
                  </li>
                  {user.role === "admin" && (
                    <li>
                      <Link
                        href="/admin"
                        onClick={closeSheet}
                        className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                          isActive("/admin") ? "bg-red-100 text-red-900" : "text-red-500 hover:bg-red-50"
                        }`}
                      >
                        <Settings className="h-5 w-5" />
                        <span>Admin</span>
                      </Link>
                    </li>
                  )}
                </>
              ) : (
                <>
                  <li>
                    <Link
                      href="/login"
                      onClick={closeSheet}
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-muted"
                    >
                      <Users className="h-5 w-5" />
                      <span>Sign In</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/register"
                      onClick={closeSheet}
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-muted"
                    >
                      <Users className="h-5 w-5" />
                      <span>Sign Up</span>
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>

          {user && (
            <div className="border-t pt-4 mt-auto">
              <div className="text-sm text-muted-foreground mb-2">Signed in as: {user.email}</div>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  signOut()
                  closeSheet()
                }}
              >
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
