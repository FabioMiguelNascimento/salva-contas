"use client";

import { CardFlagIcon } from "@/components/credit-cards/card-flag-icon";
import { PageHeader } from "@/components/page-header";
import { SummaryCard } from "@/components/summary-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotifications } from "@/contexts/notifications-context";
import { useFinance } from "@/hooks/use-finance";
import { currencyFormatter, getAvailableYears, monthsShort } from "@/lib/subscriptions/constants";
import { cn, getTransactionCategoryLabel } from "@/lib/utils";
import type { Transaction } from "@/types/finance";
import { differenceInCalendarDays, format, isPast, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertCircle,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  CreditCard,
  Repeat,
  TrendingUp,
  Wallet2
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

export default function DashboardPage() {
  const { metrics, transactions, pendingBills, subscriptions, creditCards, budgets, filters, setFilters, isLoading, lastSync } =
    useFinance();
  const { notifications, unreadCount } = useNotifications();

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

  // Subscriptions summary
  const activeSubscriptions = subscriptions.filter((s) => s.isActive);
  const monthlySubscriptionTotal = useMemo(() => {
    return activeSubscriptions.reduce((sum, sub) => {
      if (sub.frequency === "monthly") return sum + sub.amount;
      if (sub.frequency === "weekly") return sum + sub.amount * 4;
      if (sub.frequency === "yearly") return sum + sub.amount / 12;
      return sum;
    }, 0);
  }, [activeSubscriptions]);

  // Credit cards summary
  const activeCards = creditCards.filter((c) => c.status === "active");
  const totalCreditLimit = activeCards.reduce((sum, c) => sum + c.limit, 0);
  const totalCreditUsed = activeCards.reduce((sum, c) => sum + (c.limit - c.availableLimit), 0);
  const creditUsagePercent = totalCreditLimit > 0 ? (totalCreditUsed / totalCreditLimit) * 100 : 0;

  // Budgets summary
  const budgetsWithUsage = useMemo(() => {
    return budgets.map((budget) => {
      const categoryExpenses = transactions
        .filter((t) => t.type === "expense" && t.categoryId === budget.categoryId)
        .reduce((sum, t) => sum + t.amount, 0);
      const usagePercent = budget.amount > 0 ? (categoryExpenses / budget.amount) * 100 : 0;
      return {
        ...budget,
        spent: categoryExpenses,
        usagePercent: Math.min(usagePercent, 100),
        isOverBudget: categoryExpenses > budget.amount,
      };
    });
  }, [budgets, transactions]);

  // Recent notifications
  const recentNotifications = notifications.slice(0, 3);

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
                    <span className="h-3 w-3 " style={{ backgroundColor: chartColors[index % chartColors.length] }} />
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

      {/* Credit Cards & Subscriptions Section */}
      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">Cartões de Crédito</CardTitle>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/cartoes">Ver todos</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : activeCards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <CreditCard className="mb-2 h-10 w-10 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">Nenhum cartão cadastrado</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Limite utilizado</p>
                    <p className="text-lg font-semibold">{currencyFormatter.format(totalCreditUsed)}</p>
                  </div>
                  <div className="text-right">
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
                            <span className="text-xs text-muted-foreground">{cardPercent.toFixed(0)}%</span>
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Repeat className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">Assinaturas Ativas</CardTitle>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/assinaturas">Ver todas</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : activeSubscriptions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Repeat className="mb-2 h-10 w-10 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">Nenhuma assinatura ativa</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Custo mensal estimado</p>
                    <p className="text-lg font-semibold">{currencyFormatter.format(monthlySubscriptionTotal)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{activeSubscriptions.length} assinatura{activeSubscriptions.length !== 1 ? "s" : ""}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {activeSubscriptions.slice(0, 4).map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between rounded-lg border p-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{sub.description}</p>
                        <p className="text-xs text-muted-foreground capitalize">{sub.frequency === "monthly" ? "Mensal" : sub.frequency === "yearly" ? "Anual" : "Semanal"}</p>
                      </div>
                      <p className="text-sm font-semibold">{currencyFormatter.format(sub.amount)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Budgets & Notifications Section */}
      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Orçamentos do Mês</CardTitle>
              <p className="text-sm text-muted-foreground">Acompanhe seus limites por categoria</p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/orcamentos">Gerenciar</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : budgetsWithUsage.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Wallet2 className="mb-2 h-10 w-10 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">Nenhum orçamento definido</p>
                <p className="text-xs text-muted-foreground">Defina limites para controlar seus gastos</p>
              </div>
            ) : (
              <div className="space-y-4">
                {budgetsWithUsage.slice(0, 5).map((budget) => (
                  <div key={budget.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{budget.category?.name ?? "Categoria"}</span>
                        {budget.isOverBudget && (
                          <Badge variant="destructive" className="text-xs">Excedido</Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {currencyFormatter.format(budget.spent)} / {currencyFormatter.format(budget.amount)}
                      </span>
                    </div>
                    <Progress
                      value={budget.usagePercent}
                      className={cn("h-2", budget.isOverBudget && "[&>div]:bg-destructive")}
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className={cn(unreadCount > 0 && "border-l-4 border-amber-500")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className={cn("h-5 w-5", unreadCount > 0 ? "text-amber-500" : "text-muted-foreground")} />
              Notificações
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {unreadCount} nova{unreadCount !== 1 ? "s" : ""}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Bell className="mb-2 h-10 w-10 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">Nenhuma notificação</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "rounded-lg border p-3",
                      notification.status === "unread" && "bg-muted/50"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <AlertCircle className={cn(
                        "mt-0.5 h-4 w-4 shrink-0",
                        notification.type === "budget_limit" ? "text-destructive" :
                        notification.type === "due_date" ? "text-amber-500" :
                        "text-muted-foreground"
                      )} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{notification.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                    className="rounded-sm bg-emerald-500"
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
