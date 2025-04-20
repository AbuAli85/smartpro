"use client"

import { useState } from "react"
import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { getTranslations } from "@/utils/translations"
import { format } from "date-fns"

interface NotificationExpirationFormProps {
  language: "en" | "ar"
  onExpirationSet: (expirationDate: string | undefined) => void
  initialExpiration?: string
}

export default function NotificationExpirationForm({
  language,
  onExpirationSet,
  initialExpiration,
}: NotificationExpirationFormProps) {
  const t = getTranslations(language)

  const [expirationOption, setExpirationOption] = useState<"none" | "custom" | "1hour" | "1day" | "1week" | "1month">(
    initialExpiration ? "custom" : "none",
  )
  const [customDate, setCustomDate] = useState<Date | undefined>(
    initialExpiration ? new Date(initialExpiration) : undefined,
  )
  const [calendarOpen, setCalendarOpen] = useState(false)

  // Handle expiration option change
  const handleExpirationOptionChange = (value: string) => {
    setExpirationOption(value as "none" | "custom" | "1hour" | "1day" | "1week" | "1month")

    let expirationDate: Date | undefined

    switch (value) {
      case "none":
        expirationDate = undefined
        break
      case "custom":
        expirationDate = customDate
        break
      case "1hour":
        expirationDate = new Date(Date.now() + 60 * 60 * 1000)
        break
      case "1day":
        expirationDate = new Date(Date.now() + 24 * 60 * 60 * 1000)
        break
      case "1week":
        expirationDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        break
      case "1month":
        expirationDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        break
    }

    onExpirationSet(expirationDate?.toISOString())
  }

  // Handle custom date selection
  const handleCustomDateSelect = (date: Date | undefined) => {
    setCustomDate(date)
    if (date && expirationOption === "custom") {
      onExpirationSet(date.toISOString())
    }
    setCalendarOpen(false)
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">{t.notificationExpiration}</h3>

      <RadioGroup value={expirationOption} onValueChange={handleExpirationOptionChange} className="space-y-2">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="none" id="none" />
          <Label htmlFor="none">{t.noExpiration}</Label>
        </div>

        <div className="flex items-center space-x-2">
          <RadioGroupItem value="1hour" id="1hour" />
          <Label htmlFor="1hour">
            {t.expireIn} 1 {t.hour}
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <RadioGroupItem value="1day" id="1day" />
          <Label htmlFor="1day">
            {t.expireIn} 1 {t.day}
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <RadioGroupItem value="1week" id="1week" />
          <Label htmlFor="1week">
            {t.expireIn} 1 {t.week}
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <RadioGroupItem value="1month" id="1month" />
          <Label htmlFor="1month">
            {t.expireIn} 1 {t.month}
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <RadioGroupItem value="custom" id="custom" />
          <Label htmlFor="custom">{t.customDate}</Label>

          <Popover open={calendarOpen && expirationOption === "custom"} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={`ml-2 ${expirationOption !== "custom" ? "opacity-50" : ""}`}
                disabled={expirationOption !== "custom"}
              >
                <Calendar className="h-4 w-4 mr-2" />
                {customDate ? format(customDate, "PPP") : t.selectDate}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={customDate}
                onSelect={handleCustomDateSelect}
                initialFocus
                disabled={(date) => date < new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>
      </RadioGroup>

      {expirationOption !== "none" && (
        <p className="text-xs text-gray-500">
          {expirationOption === "custom" && customDate
            ? `${t.notificationWillExpireOn} ${format(customDate, "PPP")}`
            : expirationOption === "1hour"
              ? t.notificationWillExpireIn1Hour
              : expirationOption === "1day"
                ? t.notificationWillExpireIn1Day
                : expirationOption === "1week"
                  ? t.notificationWillExpireIn1Week
                  : expirationOption === "1month"
                    ? t.notificationWillExpireIn1Month
                    : ""}
        </p>
      )}
    </div>
  )
}
