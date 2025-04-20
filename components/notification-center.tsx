"use client"

import { useState } from "react"
import { Bell, Settings, Check, Trash2, X, AlertTriangle, Info, Eye, Clock } from "lucide-react"
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useNotifications } from "@/contexts/notification-context"
import { getTranslations } from "@/utils/translations"
import NotificationTemplateSelector from "./notification-template-selector"

interface NotificationCenterProps {
  language: "en" | "ar"
}

export default function NotificationCenter({ language }: NotificationCenterProps) {
  const t = getTranslations(language)
  const {
    preferences,
    notifications,
    unreadCount,
    importantUnreadCount,
    updatePreferences,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    clearExpiredNotifications,
    getReadReceipts,
    deleteNotification,
  } = useNotifications()

  const [settingsOpen, setSettingsOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState<string | null>(null)
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false)

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  // Check if a notification is expired
  const isNotificationExpired = (expiresAt?: string): boolean => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  // Check if a notification is about to expire (within 24 hours)
  const isNotificationExpiringSoon = (expiresAt?: string): boolean => {
    if (!expiresAt) return false
    const expirationDate = new Date(expiresAt)
    const now = new Date()
    const hoursUntilExpiration = (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60)
    return hoursUntilExpiration > 0 && hoursUntilExpiration <= 24
  }

  // Format expiration time as relative time
  const formatExpirationTime = (expiresAt?: string): string => {
    if (!expiresAt) return ""

    const expirationDate = new Date(expiresAt)
    const now = new Date()
    const diffMs = expirationDate.getTime() - now.getTime()

    if (diffMs < 0) {
      return t.expired
    }

    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) {
      return `${t.expiresIn} ${diffDays} ${diffDays === 1 ? t.day : t.days}`
    } else if (diffHours > 0) {
      return `${t.expiresIn} ${diffHours} ${diffHours === 1 ? t.hour : t.hours}`
    } else {
      return `${t.expiresIn} ${diffMins} ${diffMins === 1 ? t.minute : t.minutes}`
    }
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

  // Handle notification click
  const handleNotificationClick = (notificationId: string, isImportant: boolean) => {
    // Mark as read with read receipt if important
    markAsRead(notificationId, isImportant)

    // If it's important, show read receipts
    if (isImportant) {
      setSelectedNotification(notificationId)
      setReceiptDialogOpen(true)
    }
  }

  // Filter out expired notifications
  const activeNotifications = notifications.filter((n) => !isNotificationExpired(n.expiresAt))

  // Get read receipts for selected notification
  const readReceipts = selectedNotification ? getReadReceipts(selectedNotification) : []

  return (
    <div className="flex items-center gap-2">
      <NotificationTemplateSelector language={language} />

      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
            {importantUnreadCount > 0 && (
              <span className="absolute -bottom-1 -right-1 bg-yellow-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {importantUnreadCount}
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
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                <Check className="h-4 w-4" />
                <span className="sr-only">{t.markAllAsRead}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={clearExpiredNotifications}
                title={t.clearExpiredNotifications}
              >
                <Clock className="h-4 w-4" />
                <span className="sr-only">{t.clearExpiredNotifications}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={clearNotifications}
                disabled={notifications.length === 0}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">{t.clearAll}</span>
              </Button>
              <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Settings className="h-4 w-4" />
                    <span className="sr-only">{t.notificationSettings}</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t.notificationSettings}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-notifications">{t.emailNotifications}</Label>
                      <Switch
                        id="email-notifications"
                        checked={preferences.emailNotifications}
                        onCheckedChange={(checked) => updatePreferences({ emailNotifications: checked })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{t.notifyMeAbout}</Label>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="approval-submitted" className="flex-1">
                          {t.templateSubmissions}
                        </Label>
                        <Switch
                          id="approval-submitted"
                          checked={preferences.approvalSubmitted}
                          onCheckedChange={(checked) => updatePreferences({ approvalSubmitted: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="approval-status-changed" className="flex-1">
                          {t.statusChanges}
                        </Label>
                        <Switch
                          id="approval-status-changed"
                          checked={preferences.approvalStatusChanged}
                          onCheckedChange={(checked) => updatePreferences({ approvalStatusChanged: checked })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>{t.reminderFrequency}</Label>
                      <RadioGroup
                        value={preferences.reminderFrequency}
                        onValueChange={(value) =>
                          updatePreferences({
                            reminderFrequency: value as "never" | "daily" | "weekly",
                          })
                        }
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="never" id="never" />
                          <Label htmlFor="never">{t.never}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="daily" id="daily" />
                          <Label htmlFor="daily">{t.daily}</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="weekly" id="weekly" />
                          <Label htmlFor="weekly">{t.weekly}</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="all">{t.all}</TabsTrigger>
              <TabsTrigger value="important">
                {t.important}
                {importantUnreadCount > 0 && (
                  <Badge variant="destructive" className="ml-1">
                    {importantUnreadCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="max-h-[300px] overflow-y-auto">
              {activeNotifications.length === 0 ? (
                <div className="py-4 text-center text-sm text-gray-500">{t.noNotifications}</div>
              ) : (
                <DropdownMenuGroup>
                  {activeNotifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className={`p-3 cursor-default ${notification.read ? "" : "bg-gray-50"}`}
                      onClick={() => handleNotificationClick(notification.id, notification.important)}
                    >
                      <div className="flex gap-2 w-full">
                        <div className="flex-shrink-0 mt-0.5">{getNotificationIcon(notification.type)}</div>
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-start">
                            <p className={`text-sm ${notification.read ? "font-normal" : "font-medium"}`}>
                              {notification.message}
                            </p>
                            <div className="flex flex-col items-end gap-1">
                              {notification.important && (
                                <Badge
                                  variant="outline"
                                  className="ml-1 bg-yellow-50 text-yellow-800 border-yellow-300"
                                >
                                  {t.important}
                                </Badge>
                              )}
                              {notification.expiresAt && isNotificationExpiringSoon(notification.expiresAt) && (
                                <Badge
                                  variant="outline"
                                  className="ml-1 bg-orange-50 text-orange-800 border-orange-300 text-xs"
                                >
                                  {formatExpirationTime(notification.expiresAt)}
                                </Badge>
                              )}
                              {notification.category && (
                                <Badge
                                  variant="outline"
                                  className="ml-1 bg-blue-50 text-blue-800 border-blue-300 text-xs"
                                >
                                  {notification.category}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <p className="text-xs text-gray-500">{formatTime(notification.timestamp)}</p>
                            <div className="flex items-center gap-1">
                              {notification.requiresReadReceipt && notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedNotification(notification.id)
                                    setReceiptDialogOpen(true)
                                  }}
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteNotification(notification.id)
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              )}
            </TabsContent>

            <TabsContent value="important" className="max-h-[300px] overflow-y-auto">
              {activeNotifications.filter((n) => n.important).length === 0 ? (
                <div className="py-4 text-center text-sm text-gray-500">{t.noImportantNotifications}</div>
              ) : (
                <DropdownMenuGroup>
                  {activeNotifications
                    .filter((n) => n.important)
                    .map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        className={`p-3 cursor-default ${notification.read ? "" : "bg-gray-50"}`}
                        onClick={() => handleNotificationClick(notification.id, true)}
                      >
                        <div className="flex gap-2 w-full">
                          <div className="flex-shrink-0 mt-0.5">{getNotificationIcon(notification.type)}</div>
                          <div className="flex-1 space-y-1">
                            <div className="flex justify-between items-start">
                              <p className={`text-sm ${notification.read ? "font-normal" : "font-medium"}`}>
                                {notification.message}
                              </p>
                              <div className="flex flex-col items-end gap-1">
                                <Badge
                                  variant="outline"
                                  className="ml-1 bg-yellow-50 text-yellow-800 border-yellow-300"
                                >
                                  {t.important}
                                </Badge>
                                {notification.expiresAt && isNotificationExpiringSoon(notification.expiresAt) && (
                                  <Badge
                                    variant="outline"
                                    className="ml-1 bg-orange-50 text-orange-800 border-orange-300 text-xs"
                                  >
                                    {formatExpirationTime(notification.expiresAt)}
                                  </Badge>
                                )}
                                {notification.category && (
                                  <Badge
                                    variant="outline"
                                    className="ml-1 bg-blue-50 text-blue-800 border-blue-300 text-xs"
                                  >
                                    {notification.category}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <p className="text-xs text-gray-500">{formatTime(notification.timestamp)}</p>
                              <div className="flex items-center gap-1">
                                {notification.requiresReadReceipt && notification.read && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setSelectedNotification(notification.id)
                                      setReceiptDialogOpen(true)
                                    }}
                                  >
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    deleteNotification(notification.id)
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))}
                </DropdownMenuGroup>
              )}
            </TabsContent>
          </Tabs>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Read Receipts Dialog */}
      <Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.readReceipts}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {readReceipts.length === 0 ? (
              <div className="text-center text-sm text-gray-500">{t.noReadReceipts}</div>
            ) : (
              <div className="space-y-2">
                {readReceipts.map((receipt, index) => (
                  <div key={index} className="border rounded-md p-3 space-y-1">
                    <div className="flex justify-between">
                      <span className="font-medium">{receipt.userName}</span>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(receipt.timestamp)}
                      </span>
                    </div>
                    {receipt.deviceInfo && <p className="text-xs text-gray-500">{receipt.deviceInfo}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
