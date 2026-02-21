"use client";

import { DynamicIcon } from "@/components/dynamic-icon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { currencyFormatter } from "@/lib/subscriptions/constants";
import type { Subscription } from "@/types/finance";
import Link from "next/link";

export interface SubscriptionsCardProps {
  subscriptions: Subscription[];
  monthlyTotal: number;
  isLoading?: boolean;
}

export default function SubscriptionsCard({ subscriptions, monthlyTotal, isLoading }: SubscriptionsCardProps) {
  return (
    <Card className="bg-white shadow-sm border border-gray-100">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-semibold text-gray-800">Assinaturas Ativas</CardTitle>
        </div>
        <Button variant="ghost" size="sm" className="self-start sm:self-auto" asChild>
          <Link href="/assinaturas">Ver todas</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : subscriptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <p className="text-sm text-gray-400">Nenhuma assinatura ativa</p>
          </div>
        ) : (
          <div className="space-y-4 px-1 sm:px-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-indigo-50 p-3">
              <div>
                <p className="text-xs text-indigo-500 font-medium">Custo mensal estimado</p>
                <p className="text-lg font-bold text-indigo-900">{currencyFormatter.format(monthlyTotal)}</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs text-indigo-400">{subscriptions.length} assinatura{subscriptions.length !== 1 ? "s" : ""}</p>
              </div>
            </div>
            <div>
              {subscriptions.slice(0, 4).map((sub) => (
                <div key={sub.id} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center bg-indigo-50 shrink-0">
                    <DynamicIcon
                      name={sub.category?.icon ?? "tag"}
                      className="h-4 w-4 text-indigo-600"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-800">{sub.description}</p>
                    <p className="text-xs text-gray-400 capitalize">{sub.frequency === "monthly" ? "Mensal" : sub.frequency === "yearly" ? "Anual" : "Semanal"}</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900 shrink-0">{currencyFormatter.format(sub.amount)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
