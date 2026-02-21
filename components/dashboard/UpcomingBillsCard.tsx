"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { currencyFormatter } from "@/lib/subscriptions/constants";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/types/finance";
import { differenceInCalendarDays, format, isPast } from "date-fns";
import { CheckCircle2 } from "lucide-react";

export interface UpcomingBillsCardProps {
  urgentBills: Transaction[];
  nextBills: Transaction[];
  isLoading?: boolean;
}

export default function UpcomingBillsCard({ urgentBills, nextBills }: UpcomingBillsCardProps) {
  const items = urgentBills.length > 0 ? urgentBills : nextBills;
  const allClear = urgentBills.length === 0;

  if (allClear && items.length === 0) {
    return (
      <div className="bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-4 flex items-start gap-3">
        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-emerald-800">Tudo em dia</p>
          <p className="text-sm text-emerald-600">Nenhuma conta vencendo hoje. Ótima organização!</p>
        </div>
      </div>
    );
  }

  return (
    <Card className={cn("overflow-hidden bg-white shadow-sm border", allClear ? "border-emerald-100" : "border-rose-100")}>
      {allClear ? (
        <div className="bg-linear-to-r from-emerald-50 to-teal-50 border-b border-emerald-100 p-4 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-emerald-800">Tudo em dia</p>
            <p className="text-sm text-emerald-600">Nenhuma conta vencendo hoje. Ótima organização!</p>
          </div>
        </div>
      ) : (
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-800">
            <span className="truncate">Contas vencendo</span>
          </CardTitle>
          <p className="text-sm text-gray-400">
            Priorize os boletos abaixo para manter o fluxo saudável.
          </p>
        </CardHeader>
      )}
      <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6 overflow-hidden">
        {items.map((bill) => (
          <div key={bill.id} className="rounded-xl border border-gray-100 bg-white p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-800 truncate">{bill.description}</p>
                <p className="text-xs text-gray-400">{currencyFormatter.format(bill.amount)}</p>
              </div>
              <Badge variant={isPast(new Date(bill.dueDate ?? 0)) ? "destructive" : "secondary"} className="shrink-0">
                {bill.dueDate ? format(new Date(bill.dueDate), "dd/MM") : "—"}
              </Badge>
            </div>
            <p className="mt-2 text-xs text-gray-400">
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
