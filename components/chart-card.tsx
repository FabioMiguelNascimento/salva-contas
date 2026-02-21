"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import React from "react"

type ChartCardProps = {
  title?: React.ReactNode
  description?: React.ReactNode
  children?: React.ReactNode
  className?: string
}

export function ChartCard({ title, description, children, className }: ChartCardProps) {
  return (
    <Card className={cn("bg-white shadow-sm border border-gray-100 rounded-2xl", className)}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle className="text-base font-semibold text-gray-800">{title}</CardTitle>}
          {description && <p className="text-sm text-gray-400">{description}</p>}
        </CardHeader>
      )}
      <CardContent className="p-3 sm:p-6">{children}</CardContent>
    </Card>
  )
}

export default ChartCard
