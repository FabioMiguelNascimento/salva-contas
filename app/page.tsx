"use client";

import { CategorySelect } from "@/components/category-select";
import BudgetsCard from "@/components/dashboard/BudgetsCard";
import CategoryBreakdownCard from "@/components/dashboard/CategoryBreakdownCard";
import CreditCardsCard from "@/components/dashboard/CreditCardsCard";
import RecentTransactionsCard from "@/components/dashboard/RecentTransactionsCard";
import SpendingCard from "@/components/dashboard/SpendingCard";
import SubscriptionsCard from "@/components/dashboard/SubscriptionsCard";
import UpcomingBillsCard from "@/components/dashboard/UpcomingBillsCard";
import { PageHeader } from "@/components/page-header";
import { SummaryCard } from "@/components/summary-card";
import { SummaryCardsGrid } from "@/components/summary-cards-grid";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNotifications } from "@/contexts/notifications-context";
import { useFinance } from "@/hooks/use-finance";
import { currencyFormatter, getAvailableYears, monthsShort } from "@/lib/subscriptions/constants";
import { differenceInCalendarDays, format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowDownRight,
  ArrowUpRight,
  TrendingUp,
  Wallet2
} from "lucide-react";
import { useMemo } from "react";

export default function DashboardPage() {
  const { metrics, transactions, pendingBills, subscriptions, creditCards, budgets, categories, filters, setFilters, isLoading, lastSync } =
    useFinance();
  const { notifications, unreadCount } = useNotifications();

  const years = getAvailableYears();

  const kpis = [
    {
      title: "Total gasto no mês",
      value: metrics?.financials.expenses ?? 0,
      change: `${(metrics?.financials.expensesChangePercent ?? 0) > 0 ? '+' : ''}${metrics?.financials.expensesChangePercent ?? 0}% vs mês anterior`,
      icon: ArrowDownRight,
      trend: "down",
    },
    {
      title: "Receitas",
      value: metrics?.financials.income ?? 0,
      change: `${(metrics?.financials.incomeChangePercent ?? 0) > 0 ? '+' : ''}${metrics?.financials.incomeChangePercent ?? 0}% vs mês anterior`,
      icon: ArrowUpRight,
      trend: "up",
    },
    {
      title: "Saldo atual",
      value: metrics?.financials.balance ?? 0,
      change: `${(metrics?.financials.balanceChangePercent ?? 0) > 0 ? '+' : ''}${metrics?.financials.balanceChangePercent ?? 0}% vs mês anterior`,
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

  const activeSubscriptions = subscriptions.filter((s) => s.isActive);
  const monthlySubscriptionTotal = useMemo(() => {
    return activeSubscriptions.reduce((sum, sub) => {
      if (sub.frequency === "monthly") return sum + sub.amount;
      if (sub.frequency === "weekly") return sum + sub.amount * 4;
      if (sub.frequency === "yearly") return sum + sub.amount / 12;
      return sum;
    }, 0);
  }, [activeSubscriptions]);

  const activeCards = creditCards.filter((c) => c.status === "active");
  const totalCreditLimit = activeCards.reduce((sum, c) => sum + c.limit, 0);
  const totalCreditUsed = activeCards.reduce((sum, c) => sum + (c.limit - c.availableLimit), 0);
  const creditUsagePercent = totalCreditLimit > 0 ? (totalCreditUsed / totalCreditLimit) * 100 : 0;

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

  const recentNotifications = notifications.slice(0, 3);

  const formatValue = (value: number | string) => (typeof value === "number" ? currencyFormatter.format(value) : value);

  const handleMonthChange = (value: string) => {
    setFilters({ ...filters, month: Number(value) });
  };

  const handleYearChange = (value: string) => {
    setFilters({ ...filters, year: Number(value) });
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 overflow-x-hidden">
      <PageHeader
        tag="Visão geral"
        title="Dashboard Financeiro"
        description={lastSync ? `Atualizado ${format(new Date(lastSync), "dd 'de' MMMM, HH:mm", { locale: ptBR })}` : "Sincronizando dados..."}
      >
        <div className="w-full max-w-xs">
          <CategorySelect
            value={filters.categoryId ?? null}
            onValueChange={(id) => setFilters({ ...filters, categoryId: id ?? undefined })}
            placeholder="Categoria"
          />
        </div>

        <Select value={String(filters.month)} onValueChange={handleMonthChange}>
          <SelectTrigger className="w-full sm:w-[110px]">
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
          <SelectTrigger className="w-full sm:w-[110px]">
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

      <SummaryCardsGrid>
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
      </SummaryCardsGrid>

      <section className="grid gap-4 lg:grid-cols-3 overflow-hidden">
        <SpendingCard data={dailySpending} isLoading={isLoading} />
        <CategoryBreakdownCard breakdown={categoryBreakdown} total={donutTotal} categoriesMeta={categories} isLoading={isLoading} />
      </section>

      <section className="grid gap-4 lg:grid-cols-3 overflow-hidden">
        <RecentTransactionsCard transactions={recentTransactions} isLoading={isLoading} />
        <UpcomingBillsCard urgentBills={urgentBills} nextBills={nextBills} isLoading={isLoading} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <CreditCardsCard activeCards={activeCards} totalCreditLimit={totalCreditLimit} totalCreditUsed={totalCreditUsed} creditUsagePercent={creditUsagePercent} isLoading={isLoading} />
        <SubscriptionsCard subscriptions={activeSubscriptions} monthlyTotal={monthlySubscriptionTotal} isLoading={isLoading} />
      </section>

      <section className="">
        <BudgetsCard budgetsWithUsage={budgetsWithUsage} isLoading={isLoading} />
      </section>
    </div>
  );
}


