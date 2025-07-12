"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type ChartConfig = Record<
  string,
  {
    label: string
    color: string
  }
>

// Không dùng config trong ChartContainer nên bỏ đi cho sạch linter
export interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function ChartContainer({ children, className, ...props }: ChartContainerProps) {
  return (
    <div className={cn("w-full overflow-x-auto", className)} {...props}>
      {children}
    </div>
  )
}

// Định nghĩa type cho payload của Recharts Tooltip
interface TooltipEntry {
  name: string
  value: number
  color: string
  payload: Record<string, unknown>
}

interface ChartTooltipProps {
  active?: boolean
  payload?: TooltipEntry[]
  label?: string
  content?: React.ReactNode
}

export function ChartTooltip({ active, payload, label, content, ...props }: ChartTooltipProps) {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="rounded-md p-2 shadow-sm text-xs" {...props}>
      {content ? (content as React.ReactNode) : (
        <>
          <div className="font-medium">{label}</div>
          {payload.map((entry, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
              <span>{entry.name}:</span>
              <span className="font-semibold">{entry.value}</span>
            </div>
          ))}
        </>
      )}
    </div>
  )
}

export function ChartTooltipContent({ payload, hideLabel }: { payload?: TooltipEntry[]; hideLabel?: boolean }) {
  if (!payload || !payload.length) return null
  return (
    <div>
      {!hideLabel && <div className="font-medium">{String(payload[0]?.payload?.label)}</div>}
      {payload.map((entry, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span>{entry.name}:</span>
          <span className="font-semibold">{entry.value}</span>
        </div>
      ))}
    </div>
  )
}
