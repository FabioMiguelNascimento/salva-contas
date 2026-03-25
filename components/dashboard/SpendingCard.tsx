"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoPopover } from "@/components/ui/info-popover";
import { Skeleton } from "@/components/ui/skeleton";
import { currencyFormatter } from "@/lib/subscriptions/constants";
import React from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export interface SpendingCardProps {
  data: { day: string; amount: number }[];
  isLoading?: boolean;
  title?: React.ReactNode;
  infoContent?: string;
}

export default function SpendingCard({
  data,
  isLoading,
  title = "Gastos dos ultimos 7 dias",
  infoContent = "Este gráfico mostra os gastos dos ultimos 7 dias, incluindo apenas despesas que já foram pagas. Os valores são exibidos em reais (R$) e representam o total diario de gastos.",
}: SpendingCardProps) {
  return (
    <Card className="lg:col-span-2 overflow-hidden bg-white shadow-sm border border-gray-100">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="min-w-0 flex-1">
          <CardTitle className="text-base font-semibold text-gray-800">{title}</CardTitle>
          <p className="text-sm text-gray-400">Somente despesas pagas</p>
        </div>
        <InfoPopover content={infoContent} />
      </CardHeader>
      <CardContent className="overflow-hidden p-3 sm:p-6">
        {isLoading ? <Skeleton className="h-48 w-full" /> : <SpendingBarChart data={data} />}
      </CardContent>
    </Card>
  );
}

function SpendingBarChart({ data }: { data: { day: string; amount: number }[] }) {
  const tickStride = Math.max(1, Math.ceil(data.length / 10));
  const barSize = data.length > 45 ? 5 : data.length > 31 ? 7 : 10;

  return (
    <div className="h-56 sm:h-64">
      <ResponsiveContainer width="100%" height="100%" minWidth={260} minHeight={220}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            minTickGap={8}
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            tickFormatter={(value, index) => (index % tickStride === 0 ? value : "")}
          />
          <YAxis hide />
          <Tooltip
            cursor={{ fill: "rgba(244, 63, 94, 0.08)" }}
            formatter={(value: number | string | undefined) =>
              currencyFormatter.format(Number(value ?? 0))
            }
            labelFormatter={(label) => `Dia ${label}`}
            contentStyle={{
              borderRadius: 10,
              border: "1px solid #e5e7eb",
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
              fontSize: 12,
            }}
          />
          <Bar dataKey="amount" fill="#f43f5e" radius={[6, 6, 0, 0]} barSize={barSize} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}


