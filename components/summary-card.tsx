"use client";

import { Card, CardContent } from "@/components/ui/card";
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
  const iconContainerStyles = {
    default: "bg-gray-50",
    danger: "bg-rose-50",
    warning: "bg-amber-50",
    success: "bg-emerald-50",
  };

  const iconColorStyles = {
    default: "text-gray-500",
    danger: "text-rose-500",
    warning: "text-amber-500",
    success: "text-emerald-600",
  };

  const isPositiveTrend = helper?.startsWith("+");
  const isNegativeTrend = helper?.startsWith("-") || (helper && !helper.startsWith("+") && helper.includes("atraso"));

  const helperBadgeStyles = isPositiveTrend
    ? "bg-emerald-50 text-emerald-700"
    : isNegativeTrend
    ? "bg-rose-50 text-rose-600"
    : "bg-gray-100 text-gray-600";

  if (isLoading) {
    return (
      <Card className="bg-white shadow-sm border border-gray-100">
        <CardContent className="space-y-2 p-4 sm:p-5">
          <Skeleton className="h-3 w-14 sm:w-24" />
          <Skeleton className="h-8 w-20 sm:w-32" />
          <Skeleton className="h-5 w-16 sm:w-20 rounded-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("relative overflow-hidden bg-white shadow-sm border border-gray-100")}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs sm:text-sm font-medium text-gray-500 truncate pr-1">{title}</p>
          <div className={cn("rounded-xl p-2 sm:p-2.5 shrink-0", iconContainerStyles[variant])}>
            <Icon className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", iconColorStyles[variant])} />
          </div>
        </div>
        <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-gray-900 truncate">{value}</div>
        {helper && (
          <span className={cn("mt-2 inline-block text-xs font-medium px-2 py-0.5 rounded-full truncate max-w-full", helperBadgeStyles)}>
            {helper}
          </span>
        )}
      </CardContent>
    </Card>
  );
}
