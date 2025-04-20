"use client"

import { useState } from "react"
import { Eye, AlertTriangle, CheckCircle, XCircle, BarChart } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useNotifications } from "@/contexts/notification-context"
import { getTranslations } from "@/utils/translations"

interface ReadReceiptAnalyticsProps {
  language: "en" | "ar"
}

export default function ReadReceiptAnalytics({ language }: ReadReceiptAnalyticsProps) {
  const t = getTranslations(language)
  const { notifications } = useNotifications()
  const [open, setOpen] = useState(false)

  // Get all notifications that require read receipts
  const receiptNotifications = notifications.filter((n) => n.requiresReadReceipt)

  // Calculate read rates
  const totalImportant = receiptNotifications.length
  const totalRead = receiptNotifications.filter((n) => n.read).length
  const readRate = totalImportant > 0 ? Math.round((totalRead / totalImportant) * 100) : 0

  // Calculate average time to read
  const readTimes = receiptNotifications
    .filter((n) => n.read && n.readReceipts && n.readReceipts.length > 0)
    .map((n) => {
      const notificationTime = new Date(n.timestamp).getTime()
      const readTime = new Date(n.readReceipts![0].timestamp).getTime()
      return readTime - notificationTime
    })

  const averageReadTime =
    readTimes.length > 0 ? Math.round(readTimes.reduce((sum, time) => sum + time, 0) / readTimes.length / 1000 / 60) : 0

  // Format time for display
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  // Format duration in minutes and seconds
  const formatDuration = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 1000 / 60)
    const seconds = Math.floor((milliseconds / 1000) % 60)
    return `${minutes}m ${seconds}s`
  }

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Eye className="h-4 w-4 text-blue-500" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <BarChart className="h-4 w-4" />
          <span>{t.readReceiptAnalytics}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t.readReceiptAnalytics}</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800">{t.totalImportantNotifications}</h3>
              <p className="text-2xl font-bold text-blue-900">{totalImportant}</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-green-800">{t.readRate}</h3>
              <p className="text-2xl font-bold text-green-900">{readRate}%</p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-purple-800">{t.averageTimeToRead}</h3>
              <p className="text-2xl font-bold text-purple-900">
                {averageReadTime} {t.minutes}
              </p>
            </div>
          </div>

          <Tabs defaultValue="all">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="all">{t.allNotifications}</TabsTrigger>
              <TabsTrigger value="unread">{t.unreadNotifications}</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="max-h-[400px] overflow-y-auto">
              {receiptNotifications.length === 0 ? (
                <div className="py-4 text-center text-sm text-gray-500">{t.noImportantNotifications}</div>
              ) : (
                <div className="space-y-2 mt-4">
                  {receiptNotifications.map((notification) => {
                    // Calculate read time if available
                    let readTime = null
                    if (notification.read && notification.readReceipts && notification.readReceipts.length > 0) {
                      const notificationTime = new Date(notification.timestamp).getTime()
                      const firstReadTime = new Date(notification.readReceipts[0].timestamp).getTime()
                      readTime = firstReadTime - notificationTime
                    }

                    return (
                      <div key={notification.id} className="border rounded-md p-3 space-y-2">
                        <div className="flex items-start gap-2">
                          <div className="flex-shrink-0 mt-0.5">{getNotificationIcon(notification.type)}</div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{notification.message}</p>
                            <div className="flex justify-between items-center mt-1">
                              <p className="text-xs text-gray-500">{formatTime(notification.timestamp)}</p>
                              {notification.read ? (
                                <span className="text-xs text-green-600 flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3" />
                                  {t.read}
                                </span>
                              ) : (
                                <span className="text-xs text-yellow-600 flex items-center gap-1">
                                  <AlertTriangle className="h-3 w-3" />
                                  {t.unread}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {readTime !== null && (
                          <div className="bg-gray-50 p-2 rounded text-xs">
                            <span className="font-medium">{t.timeToRead}:</span> {formatDuration(readTime)}
                          </div>
                        )}

                        {notification.readReceipts && notification.readReceipts.length > 0 && (
                          <div className="border-t pt-2 mt-2">
                            <p className="text-xs font-medium text-gray-700">{t.readBy}:</p>
                            {notification.readReceipts.map((receipt, index) => (
                              <div key={index} className="flex justify-between items-center text-xs mt-1">
                                <span>{receipt.userName}</span>
                                <span className="text-gray-500">{formatTime(receipt.timestamp)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="unread" className="max-h-[400px] overflow-y-auto">
              {receiptNotifications.filter((n) => !n.read).length === 0 ? (
                <div className="py-4 text-center text-sm text-gray-500">{t.noUnreadImportantNotifications}</div>
              ) : (
                <div className="space-y-2 mt-4">
                  {receiptNotifications
                    .filter((n) => !n.read)
                    .map((notification) => (
                      <div key={notification.id} className="border rounded-md p-3 space-y-2">
                        <div className="flex items-start gap-2">
                          <div className="flex-shrink-0 mt-0.5">{getNotificationIcon(notification.type)}</div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{notification.message}</p>
                            <div className="flex justify-between items-center mt-1">
                              <p className="text-xs text-gray-500">{formatTime(notification.timestamp)}</p>
                              <span className="text-xs text-yellow-600 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                {t.unread}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-yellow-50 p-2 rounded text-xs">
                          <span className="font-medium">{t.pendingSince}:</span>{" "}
                          {formatDuration(Date.now() - new Date(notification.timestamp).getTime())}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
