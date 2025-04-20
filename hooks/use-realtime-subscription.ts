"use client"

import { useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"

type SubscriptionCallback<T> = (payload: { new: T; old: T | null }) => void

export function useRealtimeSubscription<T>(
  table: string,
  event: "INSERT" | "UPDATE" | "DELETE" | "*",
  callback: SubscriptionCallback<T>,
  filter?: { column: string; value: string },
) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const supabase = getSupabaseClient()

    // Create a channel
    const channelBuilder = supabase.channel(`public:${table}`)

    // Add filter if provided
    let filterBuilder = channelBuilder.on(
      "postgres_changes",
      {
        event: event,
        schema: "public",
        table: table,
      },
      callback,
    )

    if (filter) {
      filterBuilder = channelBuilder.on(
        "postgres_changes",
        {
          event: event,
          schema: "public",
          table: table,
          filter: `${filter.column}=eq.${filter.value}`,
        },
        callback,
      )
    }

    // Subscribe to the channel
    const subscription = filterBuilder.subscribe((status, err) => {
      if (status === "SUBSCRIBED") {
        setIsSubscribed(true)
      } else if (status === "CHANNEL_ERROR") {
        setError(err || new Error("Unknown channel error"))
        setIsSubscribed(false)
      } else if (status === "CLOSED") {
        setIsSubscribed(false)
      }
    })

    setChannel(subscription)

    // Cleanup function
    return () => {
      if (subscription) {
        supabase.removeChannel(subscription)
        setChannel(null)
        setIsSubscribed(false)
      }
    }
  }, [table, event, callback, filter])

  return { isSubscribed, error }
}
