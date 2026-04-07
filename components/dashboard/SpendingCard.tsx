"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoPopover } from "@/components/ui/info-popover";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/currency-utils";
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
            content={({ payload }) => {
              if (!payload?.length) return null;
              const { value } = payload[0];
              const day = (payload[0].payload as { day?: string })?.day;
              const numValue = Number(value);
              if (!numValue) return null;
              return (
                <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md">
                  {day && <div className="text-xs text-gray-400">{day}</div>}
                  <span className="font-medium text-gray-800">{formatCurrency(numValue)}</span>
                </div>
              );
            }}
          />
          <Bar dataKey="amount" fill="#f43f5e" radius={[6, 6, 0, 0]} barSize={barSize} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}


