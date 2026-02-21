"use client"

import { currencyFormatter } from "@/lib/subscriptions/constants"
import { cn } from "@/lib/utils"

// Minimal, Recharts-compatible tooltip content styled like our TooltipContent
export function ChartTooltipContent({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null

  return (
    <div className={cn(
      "bg-foreground text-background rounded-md px-3 py-1.5 text-xs z-100 shadow-md",
      "animate-in fade-in-0 zoom-in-95"
    )}>
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="size-2 rounded-sm" style={{ background: p.payload?.color ?? p.color }} />
          <div className="flex-1 truncate text-sm font-medium">{p.name ?? p.dataKey}</div>
          <div className="text-sm">{typeof p.value === "number" ? currencyFormatter.format(p.value) : String(p.value)}</div>
        </div>
      ))}
    </div>
  )
}

export default ChartTooltipContent
