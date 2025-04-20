"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { TemplateParameter } from "@/utils/notification-templates"

interface NotificationPreferences {
  emailNotifications: boolean
  approvalSubmitted: boolean
  approvalStatusChanged: boolean
  reminderFrequency: "never" | "daily" | "weekly"
}

interface ReadReceipt {
  userId: string
  userName: string
  timestamp: string
  deviceInfo?: string
}

export interface Notification {
  id: string
  type: "info" | "success" | "warning" | "error"
  message: string
  timestamp: string
  read: boolean
  important: boolean
  requiresReadReceipt?: boolean
  readReceipts?: ReadReceipt[]
  expiresAt?: string
  category?: "approval" | "template" | "system" | "contract" | "general"
  relatedItemId?: string
  relatedItemType?: string
  templateId?: string
}

interface NotificationContextType {
  preferences: NotificationPreferences
  notifications: Notification[]
  unreadCount: number
  importantUnreadCount: number
  updatePreferences: (newPreferences: Partial<NotificationPreferences>) => void
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read" | "readReceipts">) => void
  addNotificationFromTemplate: (
    templateId: string,
    params: Record<string, TemplateParameter>,
    overrides?: Partial<Omit<Notification, "id" | "timestamp" | "read" | "readReceipts">>,
  ) => void
  markAsRead: (id: string, trackReceipt?: boolean) => void
  markAllAsRead: (trackReceipt?: boolean) => void
  clearNotifications: () => void
  clearExpiredNotifications: () => void
  getReadReceipts: (notificationId: string) => ReadReceipt[]
  getUnreadImportantNotifications: () => Notification[]
  deleteNotification: (id: string) => void
}

// Create context with default values
const NotificationContext = createContext<NotificationContextType>({
  preferences: {
    emailNotifications: true,
    approvalSubmitted: true,
    approvalStatusChanged: true,
    reminderFrequency: "daily",
  },
  notifications: [],
  unreadCount: 0,
  importantUnreadCount: 0,
  updatePreferences: () => {},
  addNotification: () => {},
  addNotificationFromTemplate: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
  clearNotifications: () => {},
  clearExpiredNotifications: () => {},
  getReadReceipts: () => [],
  getUnreadImportantNotifications: () => [],
  deleteNotification: () => {},
})

// Local storage keys
const PREFERENCES_KEY = "notification_preferences"
const NOTIFICATIONS_KEY = "notifications"

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailNotifications: true,
    approvalSubmitted: true,
    approvalStatusChanged: true,
    reminderFrequency: "daily",
  })

  const [notifications, setNotifications] = useState<Notification[]>([])

  // Calculate unread count (excluding expired notifications)
  const unreadCount = notifications.filter((n) => !n.read && !isNotificationExpired(n)).length

  // Calculate important unread count (excluding expired notifications)
  const importantUnreadCount = notifications.filter((n) => !n.read && n.important && !isNotificationExpired(n)).length

  // Check if a notification is expired
  const isNotificationExpired = (notification: Notification): boolean => {
    if (!notification.expiresAt) return false
    return new Date(notification.expiresAt) < new Date()
  }

  // Load preferences and notifications from local storage on mount
  useEffect(() => {
    const storedPreferences = localStorage.getItem(PREFERENCES_KEY)
    if (storedPreferences) {
      try {
        setPreferences(JSON.parse(storedPreferences))
      } catch (error) {
        console.error("Error parsing stored preferences:", error)
      }
    }

    const storedNotifications = localStorage.getItem(NOTIFICATIONS_KEY)
    if (storedNotifications) {
      try {
        setNotifications(JSON.parse(storedNotifications))
      } catch (error) {
        console.error("Error parsing stored notifications:", error)
      }
    }
  }, [])

  // Save preferences to local storage when they change
  useEffect(() => {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences))
  }, [preferences])

  // Save notifications to local storage when they change
  useEffect(() => {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications))
  }, [notifications])

  // Automatically clean up expired notifications
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      clearExpiredNotifications()
    }, 60000) // Check every minute

    return () => clearInterval(cleanupInterval)
  }, [notifications])

  // Update notification preferences
  const updatePreferences = (newPreferences: Partial<NotificationPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...newPreferences }))
  }

  // Get device info for read receipts
  const getDeviceInfo = (): string => {
    const userAgent = navigator.userAgent
    const browserInfo = userAgent.match(/(chrome|safari|firefox|msie|trident|edge)\/?\s*(\d+)/i)
    const browserName = browserInfo ? browserInfo[1] : "Unknown Browser"
    const browserVersion = browserInfo ? browserInfo[2] : "Unknown Version"

    const osInfo = userAgent.match(/(windows|mac|linux|android|ios|iphone|ipad)/i)
    const osName = osInfo ? osInfo[1] : "Unknown OS"

    return `${browserName} ${browserVersion} on ${osName}`
  }

  // Add a new notification
  const addNotification = (notification: Omit<Notification, "id" | "timestamp" | "read" | "readReceipts">) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      read: false,
      readReceipts: [],
      important: notification.important || false,
      requiresReadReceipt: notification.requiresReadReceipt || notification.important || false,
    }

    setNotifications((prev) => [newNotification, ...prev])
  }

  // Add a notification from a template
  const addNotificationFromTemplate = (
    templateId: string,
    params: Record<string, TemplateParameter>,
    overrides?: Partial<Omit<Notification, "id" | "timestamp" | "read" | "readReceipts">>,
  ) => {
    // Import here to avoid circular dependency
    const { getTemplateById, createNotificationFromTemplate } = require("@/utils/notification-templates")

    const template = getTemplateById(templateId)
    if (!template) {
      console.error(`Template with ID "${templateId}" not found`)
      return
    }

    const notificationData = createNotificationFromTemplate(template, params, overrides)

    // Add templateId to the notification
    addNotification({
      ...notificationData,
      templateId,
    })
  }

  // Mark a notification as read
  const markAsRead = (id: string, trackReceipt = false) => {
    setNotifications((prev) =>
      prev.map((notification) => {
        if (notification.id === id) {
          // Create a read receipt if needed
          let updatedReadReceipts = notification.readReceipts || []

          if ((notification.requiresReadReceipt || trackReceipt) && !notification.read) {
            const receipt: ReadReceipt = {
              userId: "current-user-id", // In a real app, get this from auth context
              userName: "Current User", // In a real app, get this from auth context
              timestamp: new Date().toISOString(),
              deviceInfo: getDeviceInfo(),
            }
            updatedReadReceipts = [...updatedReadReceipts, receipt]
          }

          return {
            ...notification,
            read: true,
            readReceipts: updatedReadReceipts,
          }
        }
        return notification
      }),
    )
  }

  // Mark all notifications as read
  const markAllAsRead = (trackReceipt = false) => {
    setNotifications((prev) =>
      prev.map((notification) => {
        if (!notification.read) {
          // Create a read receipt if needed
          let updatedReadReceipts = notification.readReceipts || []

          if (notification.requiresReadReceipt || trackReceipt) {
            const receipt: ReadReceipt = {
              userId: "current-user-id", // In a real app, get this from auth context
              userName: "Current User", // In a real app, get this from auth context
              timestamp: new Date().toISOString(),
              deviceInfo: getDeviceInfo(),
            }
            updatedReadReceipts = [...updatedReadReceipts, receipt]
          }

          return {
            ...notification,
            read: true,
            readReceipts: updatedReadReceipts,
          }
        }
        return notification
      }),
    )
  }

  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([])
  }

  // Clear expired notifications
  const clearExpiredNotifications = () => {
    setNotifications((prev) => prev.filter((notification) => !isNotificationExpired(notification)))
  }

  // Delete a specific notification
  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  // Get read receipts for a specific notification
  const getReadReceipts = (notificationId: string): ReadReceipt[] => {
    const notification = notifications.find((n) => n.id === notificationId)
    return notification?.readReceipts || []
  }

  // Get all unread important notifications
  const getUnreadImportantNotifications = (): Notification[] => {
    return notifications.filter((n) => !n.read && n.important && !isNotificationExpired(n))
  }

  return (
    <NotificationContext.Provider
      value={{
        preferences,
        notifications,
        unreadCount,
        importantUnreadCount,
        updatePreferences,
        addNotification,
        addNotificationFromTemplate,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        clearExpiredNotifications,
        getReadReceipts,
        getUnreadImportantNotifications,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

// Custom hook to use the notification context
export function useNotifications() {
  return useContext(NotificationContext)
}
