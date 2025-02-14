"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

type Notification = {
  id: string
  message: string
  date: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    // Fetch notifications from API
    // This is a placeholder, replace with actual API call
    setNotifications([
      { id: "1", message: "New service request", date: "2023-06-01" },
      { id: "2", message: "Payment received", date: "2023-05-30" },
    ])
  }, [])

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Notifications</h1>
      <ul className="space-y-4">
        {notifications.map((notification) => (
          <li key={notification.id} className="bg-card p-4 rounded-lg shadow">
            <p>{notification.message}</p>
            <p className="text-sm text-muted-foreground">{notification.date}</p>
          </li>
        ))}
      </ul>
    </DashboardLayout>
  )
}

