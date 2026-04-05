"use client";

import { AppShell } from "@/components/app-shell";
import BudgetsCard from "@/components/dashboard/BudgetsCard";
import CategoryBreakdownCard from "@/components/dashboard/CategoryBreakdownCard";
import CreditCardsCard from "@/components/dashboard/CreditCardsCard";
import RecentTransactionsCard from "@/components/dashboard/RecentTransactionsCard";
import SpendingCard from "@/components/dashboard/SpendingCard";
import SubscriptionsCard from "@/components/dashboard/SubscriptionsCard";
import UpcomingBillsCard from "@/components/dashboard/UpcomingBillsCard";
import { KpiSparklineCard } from "@/components/kpi-sparkline-card";
import { PageHeader } from "@/components/page-header";
import { SummaryCard } from "@/components/summary-card";
import { SummaryCardsGrid } from "@/components/summary-cards-grid";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { DashboardProvider, useDashboard } from "@/context/dashboard-context";
import { useFinancePeriod } from "@/context/finance-period-context";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatCurrency } from "@/lib/currency-utils";
import { getAvailableYears, monthsShort } from "@/lib/subscriptions/constants";
import { cn, parseDateOnly } from "@/lib/utils";
import { differenceInCalendarDays, eachDayOfInterval, endOfMonth, format, isSameMonth, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    ArrowDownRight,
    ArrowUpRight,
    CalendarIcon,
    PiggyBank,
    Wallet2
} from "lucide-react";
import { useMemo } from "react";
import type { DateRange } from "react-day-picker";

function DashboardContent() {
  const { metrics, transactions, pendingBills, subscriptions, creditCards, budgets, budgetProgress, categories, isLoading, lastSync } =
    useDashboard();
  const { filters, setFilters } = useFinancePeriod();
  const isMobile = useIsMobile();

  const years = getAvailableYears();
  const hasDateRange = Boolean(filters.startDate && filters.endDate);

  const selectedRange = useMemo<DateRange>(() => {
    if (filters.startDate && filters.endDate) {
      const from = parseDateOnly(filters.startDate);
      const to = parseDateOnly(filters.endDate);
      if (from && to) {
        return { from, to };
      }
    }

    const selectedMonthDate = new Date(filters.year, filters.month - 1, 1);
    const today = new Date();
    const monthEnd = endOfMonth(selectedMonthDate);
    const rangeEnd = isSameMonth(selectedMonthDate, today) ? today : monthEnd;

    return { from: subDays(rangeEnd, 6), to: rangeEnd };
  }, [filters.endDate, filters.month, filters.startDate, filters.year]);

  const rangeDays = useMemo(() => {
    if (!selectedRange.from || !selectedRange.to) return 0;
    return differenceInCalendarDays(selectedRange.to, selectedRange.from) + 1;
  }, [selectedRange.from, selectedRange.to]);

  const rangeDates = useMemo(() => {
    if (!selectedRange.from || !selectedRange.to) return [] as Date[];
    return eachDayOfInterval({ start: selectedRange.from, end: selectedRange.to });
  }, [selectedRange.from, selectedRange.to]);

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
    return rangeDates.map((date) => {
      const total = transactions
        .filter(
          (t) =>
            t.type === "expense" &&
            t.paymentDate &&
            format(parseDateOnly(t.paymentDate)!, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
        )
        .reduce((sum, t) => sum + t.amount, 0);
      return { day: format(date, "dd/MM"), amount: total };
    });
  }, [rangeDates, transactions]);

  const sparklineExpense = useMemo(
    () => dailySpending.map((d) => ({ value: d.amount, day: d.day })),
    [dailySpending]
  );

  const sparklineIncome = useMemo(() => {
    return rangeDates.map((date) => {
      const total = transactions
        .filter(
          (t) =>
            t.type === "income" &&
            t.paymentDate &&
            format(parseDateOnly(t.paymentDate)!, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
        )
        .reduce((sum, t) => sum + t.amount, 0);
      return { value: total, day: format(date, "dd/MM") };
    });
  }, [rangeDates, transactions]);

  const sparklineBalance = useMemo(() => {
    return rangeDates.map((date) => {
      const dateStr = format(date, "yyyy-MM-dd");
      const dayTxs = transactions.filter(
        (t) => t.paymentDate && format(parseDateOnly(t.paymentDate)!, "yyyy-MM-dd") === dateStr
      );
      const inc = dayTxs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
      const exp = dayTxs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
      return { value: inc - exp, day: format(date, "dd/MM") };
    });
  }, [rangeDates, transactions]);

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
    const progressByBudgetId = new Map(
      budgetProgress.map((progress) => [progress.budget.id, progress])
    );

    return budgets.map((budget) => {
      const progress = progressByBudgetId.get(budget.id);
      const spent = progress?.spent ?? 0;
      const usagePercent = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;

      return {
        ...budget,
        spent,
        usagePercent: Math.min(usagePercent, 100),
        isOverBudget: spent > budget.amount,
      };
    });
  }, [budgets, budgetProgress]);

  const handleMonthChange = (value: string) => {
    setFilters({
      ...filters,
      month: Number(value),
      startDate: undefined,
      endDate: undefined,
    });
  };

  const handleYearChange = (value: string) => {
    setFilters({
      ...filters,
      year: Number(value),
      startDate: undefined,
      endDate: undefined,
    });
  };

  const handleRangeChange = (range: DateRange | undefined) => {
    if (!range?.from) return;

    const from = range.from;
    const to = range.to ?? range.from;

    setFilters({
      ...filters,
      startDate: format(from, "yyyy-MM-dd"),
      endDate: format(to, "yyyy-MM-dd"),
      month: to.getMonth() + 1,
      year: to.getFullYear(),
    });
  };

  const clearDateRange = () => {
    setFilters({
      ...filters,
      startDate: undefined,
      endDate: undefined,
    });
  };

  const rangeLabel = hasDateRange && selectedRange.from && selectedRange.to
    ? `${format(selectedRange.from, "dd/MM/yyyy")} - ${format(selectedRange.to, "dd/MM/yyyy")}`
    : "Últimos 7 dias";

  const spendingTitle = hasDateRange
    ? `Gastos no período (${rangeDays} dias)`
    : "Gastos dos últimos 7 dias";

  const spendingInfo = hasDateRange
    ? `Este gráfico mostra os gastos do período selecionado (${rangeDays} dias), incluindo apenas despesas pagas.`
    : "Este gráfico mostra os gastos dos últimos 7 dias, incluindo apenas despesas pagas.";

  const comparisonLabel = hasDateRange ? "vs período anterior" : "vs mês anterior";

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 overflow-x-hidden bg-gray-50 min-h-screen">
      <PageHeader
        tag="Visão geral"
        title="Dashboard Financeiro"
        description={lastSync ? `Atualizado ${format(new Date(lastSync), "dd 'de' MMMM, HH:mm", { locale: ptBR })}` : "Sincronizando dados..."}
      />


      <section className="rounded-xl border bg-card p-0 overflow-hidden">
          <div className="p-4 sm:p-5 ">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              <div>
                <label htmlFor="dashboard-filter-range" className="mb-1 block text-xs font-medium text-muted-foreground">
                  Período
                </label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="dashboard-filter-range"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !hasDateRange && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon data-icon="inline-start" />
                        <span className="truncate">{rangeLabel}</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        selected={selectedRange}
                        onSelect={handleRangeChange}
                        numberOfMonths={isMobile ? 1 : 2}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {hasDateRange && (
                    <Button variant="outline" onClick={clearDateRange} className="w-full sm:w-auto">
                      Limpar
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="dashboard-filter-month" className="mb-1 block text-xs font-medium text-muted-foreground">
                    Mês
                  </label>
                  <Select value={String(filters.month)} onValueChange={handleMonthChange}>
                    <SelectTrigger id="dashboard-filter-month" aria-label="Filtrar dashboard por mês" className="w-full">
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
                </div>

                <div>
                  <label htmlFor="dashboard-filter-year" className="mb-1 block text-xs font-medium text-muted-foreground">
                    Ano
                  </label>
                  <Select value={String(filters.year)} onValueChange={handleYearChange}>
                    <SelectTrigger id="dashboard-filter-year" aria-label="Filtrar dashboard por ano" className="w-full">
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
                </div>
              </div>
            </div>
          </div>
      </section>

        <SummaryCardsGrid className="grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
          <KpiSparklineCard
            variant="expense"
            icon={ArrowDownRight}
            title={hasDateRange ? "Total gasto no período" : "Total gasto no mês"}
            value={formatCurrency(metrics?.financials.expenses ?? 0)}
            change={`${(metrics?.financials.expensesChangePercent ?? 0) > 0 ? '+' : ''}${metrics?.financials.expensesChangePercent ?? 0}% ${comparisonLabel}`}
            sparklineData={sparklineExpense}
            isLoading={isLoading}
          />
          <KpiSparklineCard
            variant="income"
            icon={ArrowUpRight}
            title={hasDateRange ? "Receitas no período" : "Receitas no mês"}
            value={formatCurrency(metrics?.financials.income ?? 0)}
            change={`${(metrics?.financials.incomeChangePercent ?? 0) > 0 ? '+' : ''}${metrics?.financials.incomeChangePercent ?? 0}% ${comparisonLabel}`}
            sparklineData={sparklineIncome}
            isLoading={isLoading}
          />
          <KpiSparklineCard
            variant="balance"
            icon={Wallet2}
            title="Saldo disponível atual"
            value={formatCurrency(metrics?.financials.availableBalance ?? metrics?.financials.balance ?? 0)}
            change={`${(metrics?.financials.balanceChangePercent ?? 0) > 0 ? '+' : ''}${metrics?.financials.balanceChangePercent ?? 0}% ${comparisonLabel}`}
            sparklineData={sparklineBalance}
            isLoading={isLoading}
          />
          <SummaryCard
            icon={PiggyBank}
            title="Dinheiro guardado"
            value={formatCurrency(metrics?.financials.savedAmount ?? 0)}
            helper="Total em cofrinhos"
            variant="success"
            isLoading={isLoading}
          />
        </SummaryCardsGrid>

      <section className="grid gap-4 lg:grid-cols-3 overflow-hidden">
        <SpendingCard data={dailySpending} isLoading={isLoading} title={spendingTitle} infoContent={spendingInfo} />
        <CategoryBreakdownCard breakdown={categoryBreakdown} total={donutTotal} categoriesMeta={categories} isLoading={isLoading} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.15fr_minmax(320px,0.85fr)] overflow-hidden items-stretch">
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

export default function DashboardPage() {
  return (
    <DashboardProvider>
      <AppShell>
        <DashboardContent />
      </AppShell>
    </DashboardProvider>
  );
}
