"use client";

import { CardFlagIcon } from "@/components/credit-cards/card-flag-icon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { currencyFormatter } from "@/lib/subscriptions/constants";
import { cn } from "@/lib/utils";
import type { CreditCard } from "@/types/finance";
import Link from "next/link";

export interface CreditCardsCardProps {
  activeCards: CreditCard[];
  totalCreditLimit: number;
  totalCreditUsed: number;
  creditUsagePercent: number;
  isLoading?: boolean;
}

export default function CreditCardsCard({ activeCards, totalCreditLimit, totalCreditUsed, creditUsagePercent, isLoading }: CreditCardsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base">Cartões de Crédito</CardTitle>
        </div>
        <Button variant="ghost" size="sm" className="self-start sm:self-auto" asChild>
          <Link href="/cartoes">Ver todos</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : activeCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <p className="text-sm text-muted-foreground">Nenhum cartão cadastrado</p>
          </div>
        ) : (
          <div className="space-y-4 p-4 sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-lg bg-muted/50 p-3">
              <div>
                <p className="text-xs text-muted-foreground">Limite utilizado</p>
                <p className="text-lg font-semibold">{currencyFormatter.format(totalCreditUsed)}</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs text-muted-foreground">de {currencyFormatter.format(totalCreditLimit)}</p>
                <p className={cn("text-sm font-medium", creditUsagePercent > 80 ? "text-destructive" : creditUsagePercent > 50 ? "text-yellow-600" : "text-emerald-600")}>
                  {creditUsagePercent.toFixed(0)}% usado
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {activeCards.slice(0, 3).map((card) => {
                const cardUsed = card.limit - card.availableLimit;
                const cardPercent = card.limit > 0 ? (cardUsed / card.limit) * 100 : 0;
                return (
                  <div key={card.id} className="flex items-center gap-3">
                    <CardFlagIcon flag={card.flag} className="h-6 w-6 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="truncate text-sm font-medium">{card.name}</p>
                        <span className="text-xs text-muted-foreground shrink-0">{cardPercent.toFixed(0)}%</span>
                      </div>
                      <Progress value={cardPercent} className="mt-1 h-1.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
