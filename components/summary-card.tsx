"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ComponentType, SVGProps } from "react";

interface SummaryCardProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  value: string | number;
  helper?: string;
  variant?: "default" | "danger" | "warning" | "success";
  isLoading?: boolean;
}

export function SummaryCard({
  icon: Icon,
  title,
  value,
  helper,
  variant = "default",
  isLoading = false,
}: SummaryCardProps) {
  const variantStyles = {
    default: "",
    danger: "border-destructive/30 bg-destructive/5",
    warning: "border-amber-500/30 bg-amber-500/5",
    success: "border-emerald-500/30 bg-emerald-500/5",
  };

  const iconStyles = {
    default: "text-muted-foreground",
    danger: "text-destructive",
    warning: "text-amber-600",
    success: "text-emerald-600",
  };

  if (isLoading) {
    return (
      <Card className={cn(variantStyles[variant])}>
        <CardContent className="space-y-3 pt-6">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-20" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("relative overflow-hidden", variantStyles[variant])}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={cn("h-4 w-4", iconStyles[variant])} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
        {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
      </CardContent>
    </Card>
  );
}
