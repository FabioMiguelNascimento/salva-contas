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
    <Card className="lg:col-span-2 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="min-w-0 flex-1">
          <CardTitle className="text-base">{title}</CardTitle>
          <p className="text-sm text-muted-foreground">Somente despesas pagas</p>
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
  const maxHeight = 140;

  return (
    <div className="overflow-x-auto overflow-y-hidden -mx-3 px-3 sm:mx-0 sm:px-0">
      <div className="flex h-48 sm:h-56 items-end gap-3 sm:gap-4 min-w-[400px] sm:min-w-0 sm:w-full">
        {data.map((item) => {
          const height = Math.max((item.amount / max) * maxHeight, 6);
          return (
            <div key={item.day} className="flex flex-1 flex-col items-center gap-1 min-w-[50px] sm:min-w-0">
              <div className="flex h-full w-full items-end justify-center">
                <div className="flex w-8 sm:w-10 items-end">
                  <div className="w-full rounded-full bg-muted/40">
                    <div
                      className="rounded-sm bg-emerald-500"
                      style={{ height, transition: "height 0.3s ease" }}
                    />
                  </div>
                </div>
              </div>
              <div className="text-center w-full">
                <p className="text-xs sm:text-sm font-semibold">{currencyFormatter.format(item.amount)}</p>
                <p className="text-xs text-muted-foreground">{item.day}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
