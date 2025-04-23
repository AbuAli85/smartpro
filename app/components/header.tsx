"use client"

import Link from "next/link"
import { useLanguage } from "@/app/contexts/language-context"
import { LanguageToggle } from "./language-toggle"
import { useAuth } from "@/app/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { LogOut, LogIn, User, Zap, FileText, Settings, Users, LayoutDashboard } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserRole } from "@/types/auth"

export function Header() {
  const { language, isRTL } = useLanguage()
  const { authenticated, user, logout, hasRole } = useAuth()

  // Determine navigation links based on user role
  const getNavigationLinks = () => {
    const links = [
      {
        href: "/",
        label: language === "en" ? "Home" : "الرئيسية",
        roles: [UserRole.ADMIN, UserRole.COMPANY, UserRole.PROMOTER, UserRole.USER],
      },
      {
        href: "/contracts",
        label: language === "en" ? "Contracts" : "العقود",
        roles: [UserRole.ADMIN, UserRole.COMPANY, UserRole.PROMOTER],
      },
    ]

    // Admin-specific links
    if (hasRole(UserRole.ADMIN)) {
      links.push(
        {
          href: "/admin",
          label: language === "en" ? "Admin" : "الإدارة",
          icon: <LayoutDashboard className="h-4 w-4 mr-1" />,
        },
        {
          href: "/admin/placeholders",
          label: language === "en" ? "Form Settings" : "إعدادات النموذج",
          icon: <Settings className="h-4 w-4 mr-1" />,
        },
        {
          href: "/edge-functions",
          label: language === "en" ? "Edge Functions" : "وظائف Edge",
          icon: <Zap className="h-4 w-4 mr-1" />,
        },
      )
    }

    // Company-specific links
    if (hasRole(UserRole.COMPANY)) {
      links.push({
        href: "/company/dashboard",
        label: language === "en" ? "Company Dashboard" : "لوحة تحكم الشركة",
        icon: <LayoutDashboard className="h-4 w-4 mr-1" />,
      })
    }

    // Promoter-specific links
    if (hasRole(UserRole.PROMOTER)) {
      links.push({
        href: "/promoter/assignments",
        label: language === "en" ? "My Assignments" : "مهامي",
        icon: <FileText className="h-4 w-4 mr-1" />,
      })
    }

    return links.filter((link) => !link.roles || (user?.role && link.roles.includes(user.role as UserRole)))
  }

  const navLinks = getNavigationLinks()

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-gray-900">
                {language === "en" ? "Contract Generator" : "منشئ العقود"}
              </span>
            </Link>
            <nav
              className="hidden sm:ml-6 sm:flex sm:space-x-8"
              style={{ marginLeft: isRTL ? 0 : "1.5rem", marginRight: isRTL ? "1.5rem" : 0 }}
            >
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <LanguageToggle />

            {authenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden md:inline">
                      {user?.name || user?.email}
                      {user?.role && <span className="text-xs ml-1 text-gray-500">({user.role})</span>}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>

                  {hasRole(UserRole.ADMIN) && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin/users">
                        <Users className="h-4 w-4 mr-2" />
                        Manage Users
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem asChild>
                    <Link href="/settings">Settings</Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()}>
                    <LogOut className="h-4 w-4 mr-2" />
                    {language === "en" ? "Logout" : "تسجيل الخروج"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="outline" size="sm" asChild className="flex items-center gap-2">
                <Link href="/login">
                  <LogIn className="h-4 w-4" />
                  {language === "en" ? "Login" : "تسجيل الدخول"}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
