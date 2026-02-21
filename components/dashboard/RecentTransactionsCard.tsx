"use client";

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
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border/60 p-2 sm:p-3 gap-2 overflow-hidden">
      <div className="min-w-0 flex-1 overflow-hidden">
        <p className="text-xs sm:text-sm font-semibold truncate">{transaction.description}</p>
        <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
          {categoryLabel} • {transaction.paymentDate ? format(new Date(transaction.paymentDate), "dd MMM", { locale: ptBR }) : "pendente"}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className={cn("text-xs sm:text-sm font-semibold whitespace-nowrap", isIncome ? "text-emerald-600" : "text-destructive")}>
          {isIncome ? "+" : "-"}
          {currencyFormatter.format(transaction.amount)}
        </p>
      </div>
    </div>
  );
}

export default function RecentTransactionsCard({ transactions, isLoading, title = "Últimas transações" }: RecentTransactionsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-base">{title}</CardTitle>
        <Button variant="ghost" size="sm" className="self-start sm:self-auto" asChild>
          <Link href="/extrato">Ver extrato completo</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6 overflow-hidden">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-12 w-full" />)
        ) : (
          transactions.map((transaction) => <TransactionRow key={transaction.id} transaction={transaction} />)
        )}
      </CardContent>
    </Card>
  );
}
