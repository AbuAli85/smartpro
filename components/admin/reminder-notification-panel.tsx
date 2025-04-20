"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock } from "lucide-react"

export default function ReminderNotificationPanel() {
  const [reminderFrequency, setReminderFrequency] = useState("daily")

  const handleFrequencyChange = (frequency) => {
    setReminderFrequency(frequency)
    // In a real application, you would update the reminder frequency in the database
    console.log(`Reminder frequency set to: ${frequency}`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          <span>Reminder Notifications</span>
        </CardTitle>
        <CardDescription>Configure reminder settings for pending approvals</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Reminder Frequency</h3>
          <p className="text-sm text-gray-500">Set the frequency for sending approval reminders</p>

          <div className="flex items-center space-x-4">
            <Button
              variant={reminderFrequency === "daily" ? "default" : "outline"}
              onClick={() => handleFrequencyChange("daily")}
            >
              Daily
            </Button>
            <Button
              variant={reminderFrequency === "weekly" ? "default" : "outline"}
              onClick={() => handleFrequencyChange("weekly")}
            >
              Weekly
            </Button>
            <Button
              variant={reminderFrequency === "never" ? "default" : "outline"}
              onClick={() => handleFrequencyChange("never")}
            >
              Never
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-medium">Next Reminder</h3>
          <p className="text-sm text-gray-500">The next reminder will be sent in 24 hours</p>
        </div>
      </CardContent>
    </Card>
  )
}
