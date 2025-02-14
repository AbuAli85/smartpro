"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Activity {
  id: string
  user: {
    name: string
    image?: string
  }
  action: string
  target: string
  timestamp: string
}

interface ActivityLogProps {
  limit?: number
}

export function ActivityLog({ limit }: ActivityLogProps) {
  const activities: Activity[] = [
    {
      id: "1",
      user: {
        name: "John Doe",
        image: "/placeholder.svg",
      },
      action: "created",
      target: "new service request",
      timestamp: "2024-02-08T10:00:00Z",
    },
    {
      id: "2",
      user: {
        name: "Jane Smith",
        image: "/placeholder.svg",
      },
      action: "updated",
      target: "subscription plan",
      timestamp: "2024-02-08T09:30:00Z",
    },
    {
      id: "3",
      user: {
        name: "Mike Johnson",
        image: "/placeholder.svg",
      },
      action: "deleted",
      target: "document",
      timestamp: "2024-02-08T09:00:00Z",
    },
    // Add more activities as needed
  ]

  const displayedActivities = limit ? activities.slice(0, limit) : activities

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-4">
        {displayedActivities.map((activity) => (
          <div key={activity.id} className="flex items-center space-x-4">
            <Avatar className="h-8 w-8">
              <AvatarImage src={activity.user.image} />
              <AvatarFallback>{activity.user.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <p className="text-sm">
                <span className="font-medium">{activity.user.name}</span>{" "}
                <span className="text-muted-foreground">{activity.action}</span>{" "}
                <span className="font-medium">{activity.target}</span>
              </p>
              <p className="text-xs text-muted-foreground">{new Date(activity.timestamp).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}

