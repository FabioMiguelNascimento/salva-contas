"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ComponentType, SVGProps } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";

export type SparklineVariant = "income" | "expense" | "balance";

export interface SparklineDataPoint {
  value: number;
  day?: string;
}

interface KpiSparklineCardProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  value: string;
  change: string;
  sparklineData: SparklineDataPoint[];
  variant: SparklineVariant;
  isLoading?: boolean;
}

const variantConfig = {
  income: {
    stroke: "#10b981",
    gradientId: "sparkline-income",
    gradientColor: "#10b981",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  expense: {
    stroke: "#f43f5e",
    gradientId: "sparkline-expense",
    gradientColor: "#f43f5e",
    iconBg: "bg-rose-50",
    iconColor: "text-rose-500",
  },
  balance: {
    stroke: "#6366f1",
    gradientId: "sparkline-balance",
    gradientColor: "#6366f1",
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
  },
};

function SparklineTooltip({
  active,
  payload,
  stroke,
}: {
  active?: boolean;
  payload?: { value: number; payload: SparklineDataPoint }[];
  stroke: string;
}) {
  if (!active || !payload?.length) return null;
  const point = payload[0];
  const val = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(point.value);
  return (
    <div className="rounded-lg border border-gray-100 bg-white px-3 py-1.5 shadow-md text-xs">
      {point.payload.day && (
        <p className="text-gray-400 mb-0.5">{point.payload.day}</p>
      )}
      <p className="font-semibold" style={{ color: stroke }}>
        {val}
      </p>
    </div>
  );
}

export function KpiSparklineCard({
  icon: Icon,
  title,
  value,
  change,
  sparklineData,
  variant,
  isLoading = false,
}: KpiSparklineCardProps) {
  const cfg = variantConfig[variant];

  const isPositive = change.startsWith("+");
  const isNegative = change.startsWith("-");
  const badgeClass = isPositive
    ? "bg-emerald-50 text-emerald-700"
    : isNegative
    ? "bg-rose-50 text-rose-600"
    : "bg-gray-100 text-gray-500";

  if (isLoading) {
    return (
      <Card className="bg-white shadow-sm border border-gray-100 overflow-hidden">
        <CardContent className="p-5 pb-0">
          <div className="flex items-start justify-between mb-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-9 w-9 rounded-xl" />
          </div>
          <Skeleton className="h-9 w-36 mb-2" />
          <Skeleton className="h-5 w-24 rounded-full mb-4" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-sm border border-gray-100 overflow-hidden">
      <CardContent className="p-5 pb-0">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <p className="text-sm font-medium text-gray-500 leading-snug">{title}</p>
          <div className={cn("rounded-xl p-2 shrink-0", cfg.iconBg)}>
            <Icon className={cn("h-4 w-4", cfg.iconColor)} />
          </div>
        </div>

        {/* Value */}
        <div className="text-3xl font-extrabold text-gray-900 tracking-tight leading-none mb-2">
          {value}
        </div>

        {/* Change badge */}
        <span
          className={cn(
            "inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-4",
            badgeClass
          )}
        >
          {change}
        </span>
      </CardContent>

      {/* Sparkline — full width, flush to card edges */}
      <div className="h-16">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparklineData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={cfg.gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={cfg.gradientColor} stopOpacity={0.2} />
                <stop offset="95%" stopColor={cfg.gradientColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Tooltip
              content={(props) => (
                <SparklineTooltip
                  active={props.active}
                  payload={props.payload as { value: number; payload: SparklineDataPoint }[]}
                  stroke={cfg.stroke}
                />
              )}
              cursor={{ stroke: cfg.stroke, strokeWidth: 1, strokeDasharray: "3 3" }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={cfg.stroke}
              strokeWidth={2}
              fill={`url(#${cfg.gradientId})`}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
