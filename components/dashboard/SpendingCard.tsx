"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { currencyFormatter } from "@/lib/subscriptions/constants";
import React from "react";

export interface SpendingCardProps {
  data: { day: string; amount: number }[];
  isLoading?: boolean;
  title?: React.ReactNode;
}

export default function SpendingCard({ data, isLoading, title = "Gastos dos últimos 7 dias" }: SpendingCardProps) {
  return (
    <Card className="lg:col-span-2 overflow-hidden bg-white shadow-sm border border-gray-100">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="min-w-0 flex-1">
          <CardTitle className="text-base font-semibold text-gray-800">{title}</CardTitle>
          <p className="text-sm text-gray-400">Somente despesas pagas</p>
        </div>
      </CardHeader>
      <CardContent className="overflow-hidden p-3 sm:p-6">
        {isLoading ? <Skeleton className="h-48 w-full" /> : <SpendingBarChart data={data} />}
      </CardContent>
    </Card>
  );
}

function SpendingBarChart({ data }: { data: { day: string; amount: number }[] }) {
  const max = Math.max(...data.map((item) => item.amount), 1);
  const maxHeight = 160;

  return (
    <div className="overflow-x-auto overflow-y-hidden -mx-3 px-3 sm:mx-0 sm:px-0">
      <div className="flex h-56 sm:h-64 items-end gap-2 sm:gap-3 min-w-[400px] sm:min-w-0 sm:w-full">
        {data.map((item) => {
          const height = Math.max((item.amount / max) * maxHeight, 6);
          return (
            <div key={item.day} className="flex flex-1 flex-col items-center gap-1.5 min-w-[50px] sm:min-w-0">
              <div className="flex h-40 w-full items-end justify-center">
                <div
                  className="w-full max-w-9 sm:max-w-11 rounded-t-xl"
                  style={{ height, backgroundColor: '#f43f5e', transition: "height 0.3s ease" }}
                />
              </div>
              <div className="text-center w-full">
                <p className="text-xs sm:text-sm font-semibold text-gray-700">{currencyFormatter.format(item.amount)}</p>
                <p className="text-xs text-gray-400">{item.day}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
