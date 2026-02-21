"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { currencyFormatter } from "@/lib/subscriptions/constants";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/types/finance";
import { differenceInCalendarDays, format, isPast } from "date-fns";
import { AlertCircle, CalendarClock, CheckCircle2, Clock } from "lucide-react";

export interface UpcomingBillsCardProps {
  urgentBills: Transaction[];
  nextBills: Transaction[];
  isLoading?: boolean;
}

function BillRow({ bill }: { bill: Transaction }) {
  const isOverdue = bill.dueDate ? isPast(new Date(bill.dueDate)) : false;
  const days = bill.dueDate
    ? differenceInCalendarDays(new Date(bill.dueDate), new Date())
    : null;

  const daysLabel =
    days === null
      ? "Sem data"
      : days === 0
      ? "Vence hoje"
      : days > 0
      ? `Faltam ${days} dia${days !== 1 ? "s" : ""}`
      : `${Math.abs(days)} dia${Math.abs(days) !== 1 ? "s" : ""} em atraso`;

  return (
    <div className="flex items-center gap-3">
      {/* Icon */}
      <div
        className={cn(
          "shrink-0 flex items-center justify-center w-9 h-9 rounded-full",
          isOverdue ? "bg-rose-50" : "bg-amber-50"
        )}
      >
        {isOverdue ? (
          <AlertCircle className="w-4 h-4 text-rose-500" />
        ) : (
          <Clock className="w-4 h-4 text-amber-500" />
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-800 truncate">{bill.description}</p>
        <p className={cn("text-xs font-medium mt-0.5", isOverdue ? "text-rose-500" : "text-amber-500")}>
          {daysLabel}
        </p>
      </div>

      {/* Right side: amount + date */}
      <div className="shrink-0 text-right">
        <p className="text-sm font-bold text-gray-900">{currencyFormatter.format(bill.amount)}</p>
        <p
          className={cn(
            "text-xs font-semibold mt-0.5 px-2 py-0.5 rounded-full inline-block",
            isOverdue
              ? "bg-rose-100 text-rose-600"
              : "bg-amber-100 text-amber-600"
          )}
        >
          {bill.dueDate ? format(new Date(bill.dueDate), "dd/MM") : "—"}
        </p>
      </div>
    </div>
  );
}

export default function UpcomingBillsCard({ urgentBills, nextBills, isLoading }: UpcomingBillsCardProps) {
  const items = urgentBills.length > 0 ? urgentBills : nextBills;
  const allClear = urgentBills.length === 0;

  if (isLoading) {
    return (
      <Card className="bg-white shadow-sm border border-gray-100">
        <CardContent className="p-5 space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
        </CardContent>
      </Card>
    );
  }

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
    <Card className="overflow-hidden bg-white shadow-sm border border-gray-100">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-rose-500 shrink-0" />
          <CardTitle className="text-base font-semibold text-gray-800">
            {allClear ? "Próximas contas" : "Contas vencendo"}
          </CardTitle>
        </div>
        <p className="text-sm text-gray-400">
          {allClear
            ? "Fique de olho nos próximos vencimentos."
            : "Priorize os boletos abaixo para manter o fluxo saudável."}
        </p>
      </CardHeader>

      <CardContent className="px-5 pb-5 space-y-1">
        {items.map((bill, i) => (
          <div key={bill.id}>
            <BillRow bill={bill} />
            {i < items.length - 1 && <div className="h-px bg-gray-50 my-3" />}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

