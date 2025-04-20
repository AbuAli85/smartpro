"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Users, Settings, LayoutDashboard, Bell, Activity } from "lucide-react"

export default function AdminNavigation() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <nav className="bg-gray-100 p-4 rounded-lg">
      <ul className="space-y-2">
        <li>
          <Link
            href="/admin"
            className={`flex items-center gap-2 p-2 rounded-md ${
              isActive("/admin") ? "bg-primary text-primary-foreground" : "hover:bg-gray-200"
            }`}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>
        </li>
        <li>
          <Link
            href="/admin/users"
            className={`flex items-center gap-2 p-2 rounded-md ${
              isActive("/admin/users") ? "bg-primary text-primary-foreground" : "hover:bg-gray-200"
            }`}
          >
            <Users className="h-5 w-5" />
            <span>User Management</span>
          </Link>
        </li>
        <li>
          <Link
            href="/admin/reminders"
            className={`flex items-center gap-2 p-2 rounded-md ${
              isActive("/admin/reminders") ? "bg-primary text-primary-foreground" : "hover:bg-gray-200"
            }`}
          >
            <Bell className="h-5 w-5" />
            <span>Reminders</span>
          </Link>
        </li>
        <li>
          <Link
            href="/admin/monitoring"
            className={`flex items-center gap-2 p-2 rounded-md ${
              isActive("/admin/monitoring") ? "bg-primary text-primary-foreground" : "hover:bg-gray-200"
            }`}
          >
            <Activity className="h-5 w-5" />
            <span>Monitoring</span>
          </Link>
        </li>
        <li>
          <Link
            href="/admin/settings"
            className={`flex items-center gap-2 p-2 rounded-md ${
              isActive("/admin/settings") ? "bg-primary text-primary-foreground" : "hover:bg-gray-200"
            }`}
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </Link>
        </li>
      </ul>
    </nav>
  )
}
