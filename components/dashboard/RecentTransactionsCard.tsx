"use client";

import { DynamicIcon } from "@/components/dynamic-icon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { currencyFormatter } from "@/lib/subscriptions/constants";
import { cn, getTransactionCategoryLabel } from "@/lib/utils";
import type { Transaction } from "@/types/finance";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import React from "react";

export interface RecentTransactionsCardProps {
  transactions: Transaction[];
  isLoading?: boolean;
  title?: React.ReactNode;
}

function TransactionRow({ transaction }: { transaction: Transaction }) {
  const isIncome = transaction.type === "income";
  const categoryLabel = getTransactionCategoryLabel(transaction);
  const iconName = transaction.category?.icon ?? "tag";

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0 overflow-hidden">
      <div
        className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
          isIncome ? "bg-emerald-50" : "bg-rose-50"
        )}
      >
        <DynamicIcon
          name={iconName}
          className={cn("h-4 w-4", isIncome ? "text-emerald-600" : "text-rose-500")}
        />
      </div>
      <div className="min-w-0 flex-1 overflow-hidden">
        <p className="text-sm font-medium text-gray-800 truncate">{transaction.description}</p>
        <p className="text-xs text-gray-400 truncate">
          {categoryLabel} • {transaction.paymentDate ? format(new Date(transaction.paymentDate), "dd MMM", { locale: ptBR }) : "pendente"}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className={cn("text-sm font-semibold whitespace-nowrap", isIncome ? "text-emerald-600" : "text-rose-500")}>
          {isIncome ? "+" : "-"}
          {currencyFormatter.format(transaction.amount)}
        </p>
      </div>
    </div>
  );
}

export default function RecentTransactionsCard({ transactions, isLoading, title = "Últimas transações" }: RecentTransactionsCardProps) {
  return (
    <Card className="bg-white shadow-sm border border-gray-100">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-base font-semibold text-gray-800">{title}</CardTitle>
        <Button variant="ghost" size="sm" className="self-start sm:self-auto" asChild>
          <Link href="/extrato">Ver extrato completo</Link>
        </Button>
      </CardHeader>
      <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6 overflow-hidden">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-12 w-full" />)}
          </div>
        ) : (
          <div>
            {transactions.map((transaction) => <TransactionRow key={transaction.id} transaction={transaction} />)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
