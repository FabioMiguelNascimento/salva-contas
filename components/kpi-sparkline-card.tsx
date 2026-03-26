"use client";

import { Card, CardContent } from "@/components/ui/card";
import { InfoPopover } from "@/components/ui/info-popover";
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

  if (isLoading) {
    return (
      <Card className="bg-white shadow-sm rounded-none border border-gray-100 h-[230px] md:h-60 overflow-hidden">
        <CardContent className="h-full flex flex-col p-3 pb-1">
          <div className="flex items-start justify-between mb-2 gap-1">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-7" />
          </div>
          <Skeleton className="h-8 w-28 mb-1" />
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-none h-[230px] md:h-60 border-0 rounded-none overflow-hidden border-b border-r border-gray-100">
      <CardContent className="h-full flex flex-col p-3 pb-1">
        <div className="flex items-start justify-between gap-1 mb-2">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-500 leading-snug">{title}</p>
            <InfoPopover content={
              variant === 'expense' 
                ? "Mostra o total de despesas do período atual com um gráfico do intervalo selecionado. O percentual indica a variação em relação ao período anterior."
                : variant === 'income'
                ? "Mostra o total de receitas do período atual com um gráfico do intervalo selecionado. O percentual indica a variação em relação ao período anterior."
                : "Mostra o saldo atual (receitas - despesas) do período com um gráfico do intervalo selecionado. O percentual indica a variação em relação ao período anterior."
            } />
          </div>
          <div className={cn("rounded-xl p-2 shrink-0", cfg.iconBg)}>
            <Icon className={cn("h-4 w-4", cfg.iconColor)} />
          </div>
        </div>

        <div className="text-2xl font-extrabold text-gray-900 tracking-tight leading-none mb-1">
          {value}
        </div>

        <span
          className={cn(
            "inline-block text-xs font-semibold mb-2",
            isPositive ? "text-emerald-700" : isNegative ? "text-rose-600" : "text-gray-500"
          )}
        >
          {change}
        </span>
      </CardContent>

      <div className="h-12">
        <ResponsiveContainer width="100%" height="100%" minWidth={180} minHeight={48}>
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


