"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import React from "react"

type ChartCardProps = {
  title?: React.ReactNode
  description?: React.ReactNode
  children?: React.ReactNode
  className?: string
}

export function ChartCard({ title, description, children, className }: ChartCardProps) {
  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle className="text-base">{title}</CardTitle>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </CardHeader>
      )}
      <CardContent className="p-3 sm:p-6">{children}</CardContent>
    </Card>
  )
}

export default ChartCard
