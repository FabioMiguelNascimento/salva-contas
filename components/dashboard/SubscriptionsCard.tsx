"use client";

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
    <Card>
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base">Assinaturas Ativas</CardTitle>
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
            <p className="text-sm text-muted-foreground">Nenhuma assinatura ativa</p>
          </div>
        ) : (
          <div className="space-y-4 p-4 sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-lg bg-muted/50 p-3">
              <div>
                <p className="text-xs text-muted-foreground">Custo mensal estimado</p>
                <p className="text-lg font-semibold">{currencyFormatter.format(monthlyTotal)}</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs text-muted-foreground">{subscriptions.length} assinatura{subscriptions.length !== 1 ? "s" : ""}</p>
              </div>
            </div>
            <div className="space-y-2">
              {subscriptions.slice(0, 4).map((sub) => (
                <div key={sub.id} className="flex items-center justify-between rounded-lg border p-2 gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{sub.description}</p>
                    <p className="text-xs text-muted-foreground capitalize">{sub.frequency === "monthly" ? "Mensal" : sub.frequency === "yearly" ? "Anual" : "Semanal"}</p>
                  </div>
                  <p className="text-sm font-semibold shrink-0">{currencyFormatter.format(sub.amount)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
