"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { currencyFormatter } from "@/lib/subscriptions/constants";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/types/finance";
import { differenceInCalendarDays, format, isPast } from "date-fns";

export interface UpcomingBillsCardProps {
  urgentBills: Transaction[];
  nextBills: Transaction[];
  isLoading?: boolean;
}

export default function UpcomingBillsCard({ urgentBills, nextBills }: UpcomingBillsCardProps) {
  const items = urgentBills.length > 0 ? urgentBills : nextBills;

  return (
    <Card className={cn("border-l-4 overflow-hidden", urgentBills.length > 0 ? "border-destructive" : "border-emerald-500/70")}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="truncate">{urgentBills.length > 0 ? "Contas vencendo" : "Tudo em dia"}</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {urgentBills.length > 0
            ? "Priorize os boletos abaixo para manter o fluxo saudável."
            : "Nenhuma conta vencendo hoje. Ótima organização!"}
        </p>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6 overflow-hidden">
        {items.map((bill) => (
          <div key={bill.id} className="rounded-xl border border-border/60 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate">{bill.description}</p>
                <p className="text-xs text-muted-foreground">{currencyFormatter.format(bill.amount)}</p>
              </div>
              <Badge variant={isPast(new Date(bill.dueDate ?? 0)) ? "destructive" : "secondary"} className="shrink-0">
                {bill.dueDate ? format(new Date(bill.dueDate), "dd/MM") : "—"}
              </Badge>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {bill.dueDate
                ? (() => {
                    const days = differenceInCalendarDays(new Date(bill.dueDate), new Date());
                    return days >= 0 ? `Faltam ${days} dias` : `${Math.abs(days)} dias em atraso`;
                  })()
                : "Sem data de vencimento"}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
