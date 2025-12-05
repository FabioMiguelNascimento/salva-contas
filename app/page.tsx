"use client";

import { PageHeader } from "@/components/page-header";
import { SummaryCard } from "@/components/summary-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useFinance } from "@/hooks/use-finance";
import { currencyFormatter, getAvailableYears, monthsShort } from "@/lib/subscriptions/constants";
import { cn, getTransactionCategoryLabel } from "@/lib/utils";
import type { Transaction } from "@/types/finance";
import { differenceInCalendarDays, format, isPast, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  TrendingUp,
  Wallet2
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

export default function DashboardPage() {
  const { metrics, transactions, pendingBills, filters, setFilters, isLoading, lastSync } =
    useFinance();

  const years = getAvailableYears();

  const kpis = [
    {
      title: "Total gasto no mês",
      value: metrics?.financials.expenses ?? 0,
      change: "-8,4% vs mês anterior",
      icon: ArrowDownRight,
      trend: "down",
    },
    {
      title: "Receitas",
      value: metrics?.financials.income ?? 0,
      change: "+3,1% vs mês anterior",
      icon: ArrowUpRight,
      trend: "up",
    },
    {
      title: "Saldo atual",
      value: metrics?.financials.balance ?? 0,
      change: `${metrics?.pendingBills.totalAmount ?? 0} em contas pendentes`,
      icon: Wallet2,
      trend: "neutral",
    },
    {
      title: "Última atualização",
      value: lastSync ? format(new Date(lastSync), "dd MMM yyyy, HH:mm", { locale: ptBR }) : "—",
      change: metrics?.pendingBills
        ? `${metrics.pendingBills.count} boletos abertos`
        : "Sincronize para visualizar",
      icon: TrendingUp,
      trend: "neutral",
    },
  ];

  const recentTransactions = transactions.slice(0, 5);

  const urgentBills = useMemo(
    () =>
      pendingBills.filter((bill) => {
        if (!bill.dueDate) return false;
        const diff = differenceInCalendarDays(new Date(bill.dueDate), new Date());
        return diff <= 0;
      }),
    [pendingBills]
  );

  const nextBills = useMemo(
    () =>
      pendingBills
        .filter((bill) => bill.dueDate)
        .sort((a, b) => new Date(a.dueDate ?? 0).getTime() - new Date(b.dueDate ?? 0).getTime())
        .slice(0, 3),
    [pendingBills]
  );

  const dailySpending = useMemo(() => {
    const today = new Date();
    const data = Array.from({ length: 7 }).map((_, index) => {
      const date = subDays(today, 6 - index);
      const total = transactions
        .filter(
          (transaction) =>
            transaction.type === "expense" &&
            transaction.paymentDate &&
            format(new Date(transaction.paymentDate), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
        )
        .reduce((sum, item) => sum + item.amount, 0);

      return {
        day: format(date, "dd/MM"),
        amount: total,
      };
    });

    return data;
  }, [transactions]);

  const categoryBreakdown = metrics?.categoryBreakdown ?? [];
  const donutTotal = categoryBreakdown.reduce((sum, item) => sum + item.total, 0);

  const formatValue = (value: number | string) => (typeof value === "number" ? currencyFormatter.format(value) : value);

  const handleMonthChange = (value: string) => {
    setFilters({ ...filters, month: Number(value) });
  };

  const handleYearChange = (value: string) => {
    setFilters({ ...filters, year: Number(value) });
  };

  return (
    <div className="space-y-8">
      <PageHeader
        tag="Visão geral"
        title="Dashboard Financeiro"
        description={lastSync ? `Atualizado ${format(new Date(lastSync), "dd 'de' MMMM, HH:mm", { locale: ptBR })}` : "Sincronizando dados..."}
      >
        <Select value={String(filters.month)} onValueChange={handleMonthChange}>
          <SelectTrigger className="w-[110px]">
            <SelectValue placeholder="Mês" />
          </SelectTrigger>
          <SelectContent>
            {monthsShort.map((month) => (
              <SelectItem key={month.value} value={String(month.value)}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={String(filters.year)} onValueChange={handleYearChange}>
          <SelectTrigger className="w-[110px]">
            <SelectValue placeholder="Ano" />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={String(year)}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </PageHeader>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((item) => (
          <SummaryCard
            key={item.title}
            icon={item.icon}
            title={item.title}
            value={formatValue(item.value)}
            helper={item.change}
            isLoading={isLoading}
          />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Gastos dos últimos 7 dias</CardTitle>
              <p className="text-sm text-muted-foreground">Somente despesas pagas</p>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-48 w-full" /> : <SpendingBarChart data={dailySpending} />}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Gastos por categoria</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            {isLoading ? (
              <Skeleton className="h-44 w-44 rounded-full" />
            ) : (
              <CategoryDonut data={categoryBreakdown} total={donutTotal} />
            )}
            <div className="w-full space-y-3">
              {categoryBreakdown.slice(0, 4).map((item, index) => (
                <div key={item.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: chartColors[index % chartColors.length] }} />
                    <span className="text-sm font-medium">{item.category}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{currencyFormatter.format(item.total)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Últimas transações</CardTitle>
            <Button variant="ghost" className="text-sm" asChild>
              <Link href="/extrato">Ver extrato completo</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading
              ? Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-12 w-full" />)
              : recentTransactions.map((transaction) => <TransactionRow key={transaction.id} transaction={transaction} />)}
          </CardContent>
        </Card>
        <Card className={cn("border-l-4", urgentBills.length > 0 ? "border-destructive" : "border-emerald-500/70") }>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className={cn("h-5 w-5", urgentBills.length > 0 ? "text-destructive" : "text-emerald-500") } />
              {urgentBills.length > 0 ? "Contas vencendo" : "Tudo em dia"}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {urgentBills.length > 0
                ? "Priorize os boletos abaixo para manter o fluxo saudável."
                : "Nenhuma conta vencendo hoje. Ótima organização!"}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {(urgentBills.length > 0 ? urgentBills : nextBills).map((bill) => (
              <div key={bill.id} className="rounded-xl border border-border/60 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">{bill.description}</p>
                    <p className="text-xs text-muted-foreground">{currencyFormatter.format(bill.amount)}</p>
                  </div>
                  <Badge variant={isPast(new Date(bill.dueDate ?? 0)) ? "destructive" : "secondary"}>
                    {bill.dueDate ? format(new Date(bill.dueDate), "dd/MM") : "—"}
                  </Badge>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {bill.dueDate
                    ? (() => {
                        const days = differenceInCalendarDays(new Date(bill.dueDate), new Date());
                        return days >= 0
                          ? `Faltam ${days} dias`
                          : `${Math.abs(days)} dias em atraso`;
                      })()
                    : "Sem data de vencimento"}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

const chartColors = [
  "#10b981",
  "#6366f1",
  "#f97316",
  "#0ea5e9",
  "#ec4899",
];

function SpendingBarChart({ data }: { data: { day: string; amount: number }[] }) {
  const max = Math.max(...data.map((item) => item.amount), 1);
  const maxHeight = 180;

  return (
    <div className="flex h-56 items-end gap-3">
      {data.map((item) => {
        const height = Math.max((item.amount / max) * maxHeight, 6);
        return (
          <div key={item.day} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-full w-full items-end justify-center">
              <div className="flex w-10 items-end">
                <div className="w-full rounded-full bg-muted/40">
                  <div
                    className="rounded-full bg-emerald-500"
                    style={{ height, transition: "height 0.3s ease" }}
                  />
                </div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold">{currencyFormatter.format(item.amount)}</p>
              <p className="text-xs text-muted-foreground">{item.day}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CategoryDonut({ data, total }: { data: { category: string; total: number }[]; total: number }) {
  const segments: string[] = [];
  let current = 0;

  data.forEach((item, index) => {
    const percentage = total === 0 ? 0 : (item.total / total) * 360;
    const start = current;
    const end = current + percentage;
    segments.push(`${chartColors[index % chartColors.length]} ${start}deg ${end}deg`);
    current = end;
  });

  const background = segments.length ? `conic-gradient(${segments.join(",")})` : "conic-gradient(#e5e7eb 0deg 360deg)";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-44 w-44">
        <div className="h-full w-full rounded-full" style={{ background }} />
        <div className="absolute inset-6 flex flex-col items-center justify-center rounded-full bg-card text-center">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Total</span>
          <strong className="text-lg">{currencyFormatter.format(total)}</strong>
        </div>
      </div>
    </div>
  );
}

function TransactionRow({ transaction }: { transaction: Transaction }) {
  const isIncome = transaction.type === "income";
  const categoryLabel = getTransactionCategoryLabel(transaction);
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border/60 p-3">
      <div>
        <p className="text-sm font-semibold">{transaction.description}</p>
        <p className="text-xs text-muted-foreground">
          {categoryLabel} • {transaction.paymentDate ? format(new Date(transaction.paymentDate), "dd MMM, HH:mm", { locale: ptBR }) : "pendente"}
        </p>
      </div>
      <div className="text-right">
        <p className={cn("text-sm font-semibold", isIncome ? "text-emerald-600" : "text-destructive")}>
          {isIncome ? "+" : "-"}
          {currencyFormatter.format(transaction.amount)}
        </p>
        <Badge variant={isIncome ? "secondary" : "outline"} className="text-xs">
          {isIncome ? "Receita" : transaction.status === "pending" ? "Pendente" : "Despesa"}
        </Badge>
      </div>
    </div>
  );
}
