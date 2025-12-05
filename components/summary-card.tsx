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
        <CardContent className="space-y-2 pt-3 px-3 sm:px-6 pb-3 sm:pb-6">
          <Skeleton className="h-3 w-14 sm:w-24" />
          <Skeleton className="h-6 w-20 sm:w-32" />
          <Skeleton className="h-3 w-12 sm:w-20" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("relative overflow-hidden", variantStyles[variant])}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 sm:px-6 pt-3 sm:pt-6">
        <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate pr-1">{title}</CardTitle>
        <Icon className={cn("h-4 w-4 shrink-0", iconStyles[variant])} />
      </CardHeader>
      <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
        <div className="text-base sm:text-2xl font-semibold truncate">{value}</div>
        {helper && <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{helper}</p>}
      </CardContent>
    </Card>
  );
}
