"use client";

import BudgetsCard from "@/components/dashboard/BudgetsCard";
import CategoryBreakdownCard from "@/components/dashboard/CategoryBreakdownCard";
import CreditCardsCard from "@/components/dashboard/CreditCardsCard";
import RecentTransactionsCard from "@/components/dashboard/RecentTransactionsCard";
import SpendingCard from "@/components/dashboard/SpendingCard";
import SubscriptionsCard from "@/components/dashboard/SubscriptionsCard";
import UpcomingBillsCard from "@/components/dashboard/UpcomingBillsCard";
import { KpiSparklineCard } from "@/components/kpi-sparkline-card";
import { PageHeader } from "@/components/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFinance } from "@/hooks/use-finance";
import { currencyFormatter, getAvailableYears, monthsShort } from "@/lib/subscriptions/constants";
import { differenceInCalendarDays, format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowDownRight,
  ArrowUpRight,
  Wallet2
} from "lucide-react";
import { useMemo } from "react";

export default function DashboardPage() {
  const { metrics, transactions, pendingBills, subscriptions, creditCards, budgets, categories, filters, setFilters, isLoading, lastSync } =
    useFinance();

  const years = getAvailableYears();

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
    return Array.from({ length: 7 }).map((_, index) => {
      const date = subDays(today, 6 - index);
      const total = transactions
        .filter(
          (t) =>
            t.type === "expense" &&
            t.paymentDate &&
            format(new Date(t.paymentDate), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
        )
        .reduce((sum, t) => sum + t.amount, 0);
      return { day: format(date, "dd/MM"), amount: total };
    });
  }, [transactions]);

  const sparklineExpense = useMemo(
    () => dailySpending.map((d) => ({ value: d.amount, day: d.day })),
    [dailySpending]
  );

  const sparklineIncome = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }).map((_, index) => {
      const date = subDays(today, 6 - index);
      const total = transactions
        .filter(
          (t) =>
            t.type === "income" &&
            t.paymentDate &&
            format(new Date(t.paymentDate), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
        )
        .reduce((sum, t) => sum + t.amount, 0);
      return { value: total, day: format(date, "dd/MM") };
    });
  }, [transactions]);

  const sparklineBalance = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }).map((_, index) => {
      const date = subDays(today, 6 - index);
      const dateStr = format(date, "yyyy-MM-dd");
      const dayTxs = transactions.filter(
        (t) => t.paymentDate && format(new Date(t.paymentDate), "yyyy-MM-dd") === dateStr
      );
      const inc = dayTxs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
      const exp = dayTxs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
      return { value: inc - exp, day: format(date, "dd/MM") };
    });
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

  const handleMonthChange = (value: string) => {
    setFilters({ ...filters, month: Number(value) });
  };

  const handleYearChange = (value: string) => {
    setFilters({ ...filters, year: Number(value) });
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 overflow-x-hidden bg-gray-50 min-h-screen">
      <PageHeader
        tag="Visão geral"
        title="Dashboard Financeiro"
        description={lastSync ? `Atualizado ${format(new Date(lastSync), "dd 'de' MMMM, HH:mm", { locale: ptBR })}` : "Sincronizando dados..."}
      >
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

      <section className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <KpiSparklineCard
          variant="expense"
          icon={ArrowDownRight}
          title="Total gasto no mês"
          value={currencyFormatter.format(metrics?.financials.expenses ?? 0)}
          change={`${(metrics?.financials.expensesChangePercent ?? 0) > 0 ? '+' : ''}${metrics?.financials.expensesChangePercent ?? 0}% vs mês anterior`}
          sparklineData={sparklineExpense}
          isLoading={isLoading}
        />
        <KpiSparklineCard
          variant="income"
          icon={ArrowUpRight}
          title="Receitas no mês"
          value={currencyFormatter.format(metrics?.financials.income ?? 0)}
          change={`${(metrics?.financials.incomeChangePercent ?? 0) > 0 ? '+' : ''}${metrics?.financials.incomeChangePercent ?? 0}% vs mês anterior`}
          sparklineData={sparklineIncome}
          isLoading={isLoading}
        />
        <KpiSparklineCard
          variant="balance"
          icon={Wallet2}
          title="Saldo atual"
          value={currencyFormatter.format(metrics?.financials.balance ?? 0)}
          change={`${(metrics?.financials.balanceChangePercent ?? 0) > 0 ? '+' : ''}${metrics?.financials.balanceChangePercent ?? 0}% vs mês anterior`}
          sparklineData={sparklineBalance}
          isLoading={isLoading}
        />
      </section>

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


