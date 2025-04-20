"use client"

import type * as React from "react"
import type { TooltipProps } from "recharts/types/component/Tooltip"

interface ChartContainerProps {
  children: React.ReactNode
  config: Record<string, { label: string; color: string }>
}

export function ChartContainer({ children, config }: ChartContainerProps) {
  return (
    <div
      style={
        {
          "--color-count": config.count?.color,
          "--color-success": config.success?.color,
          "--color-failure": config.failure?.color,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  )
}

export function ChartTooltip<TValue, TName>({ active, payload, label }: TooltipProps<TValue, TName>) {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col">
          <span className="text-[0.70rem] uppercase text-muted-foreground">{label}</span>
        </div>
        <div className="flex flex-col gap-1">
          {payload.map((data, i) => (
            <div key={i} className="flex items-center justify-between gap-2 text-[0.70rem]">
              <span
                className="flex items-center gap-1"
                style={{
                  color: data.color,
                }}
              >
                <div
                  className="h-1 w-1 rounded-full"
                  style={{
                    background: data.color,
                  }}
                />
                {data.name}
              </span>
              <span className="font-medium tabular-nums">{data.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ChartTooltipContent<TValue, TName>({ active, payload, label }: TooltipProps<TValue, TName>) {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      <div className="flex flex-col">
        <span className="text-[0.70rem] uppercase text-muted-foreground">{label}</span>
        <div className="flex flex-col gap-1 mt-1">
          {payload.map((data, i) => (
            <div key={i} className="flex items-center justify-between gap-2">
              <span
                className="flex items-center gap-1 text-[0.70rem]"
                style={{
                  color: data.color,
                }}
              >
                <div
                  className="h-2 w-2 rounded-full"
                  style={{
                    background: data.color,
                  }}
                />
                {data.name}
              </span>
              <span className="font-medium text-[0.70rem] tabular-nums">{data.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
