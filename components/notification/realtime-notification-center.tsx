"use client"

import { useState, useEffect } from "react"
import { Bell, Settings, Check, X, AlertTriangle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { notificationService, type Notification } from "@/services/notification-service"
import { useRealtimeSubscription } from "@/hooks/use-realtime-subscription"
import { getTranslations } from "@/utils/translations"

interface RealtimeNotificationCenterProps {
  language: "en" | "ar"
}

export default function RealtimeNotificationCenter({ language }: RealtimeNotificationCenterProps) {
  const t = getTranslations(language)
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  // Load initial notifications
  useEffect(() => {
    const loadNotifications = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        const { data } = await notificationService.getUserNotifications(user.id)
        setNotifications(data || [])

        // Calculate unread count
        setUnreadCount(data?.filter((n) => !n.read).length || 0)
      } catch (error) {
        console.error("Error loading notifications:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadNotifications()
  }, [user])

  // Subscribe to real-time notifications
  const handleRealtimeNotification = (payload: { new: Notification; old: Notification | null }) => {
    const newNotification = payload.new

    if (payload.old) {
      // Update existing notification
      setNotifications((prev) => prev.map((n) => (n.id === newNotification.id ? newNotification : n)))
    } else {
      // Add new notification
      setNotifications((prev) => [newNotification, ...prev])
      setUnreadCount((prev) => prev + 1)
    }
  }

  // Set up real-time subscription
  useRealtimeSubscription<Notification>(
    "notifications",
    "*",
    handleRealtimeNotification,
    user ? { column: "user_id", value: user.id } : undefined,
  )

  // Mark notification as read
  const handleMarkAsRead = async (id: string) => {
    if (!user) return

    try {
      await notificationService.markAsRead(id, user.id)

      // Update local state
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    if (!user) return

    try {
      await notificationService.markAllAsRead(user.id)

      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  // Delete notification
  const handleDeleteNotification = async (id: string) => {
    if (!user) return

    try {
      await notificationService.deleteNotification(id)

      // Update local state
      const deletedNotification = notifications.find((n) => n.id === id)
      setNotifications((prev) => prev.filter((n) => n.id !== id))

      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error("Error deleting notification:", error)
    }
  }

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <Check className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "error":
        return <X className="h-4 w-4 text-red-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  if (!user) return null

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>{t.notifications}</span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              <Check className="h-4 w-4" />
              <span className="sr-only">{t.markAllAsRead}</span>
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => {}}>
              <Settings className="h-4 w-4" />
              <span className="sr-only">{t.notificationSettings}</span>
            </Button>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {isLoading ? (
          <div className="py-4 text-center">
            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">{t.loading}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-4 text-center text-sm text-gray-500">{t.noNotifications}</div>
        ) : (
          <DropdownMenuGroup>
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`p-3 cursor-default ${notification.read ? "" : "bg-gray-50"}`}
                onClick={() => handleMarkAsRead(notification.id)}
              >
                <div className="flex gap-2 w-full">
                  <div className="flex-shrink-0 mt-0.5">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <p className={`text-sm ${notification.read ? "font-normal" : "font-medium"}`}>
                        {notification.message}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteNotification(notification.id)
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">{formatTime(notification.created_at)}</p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
