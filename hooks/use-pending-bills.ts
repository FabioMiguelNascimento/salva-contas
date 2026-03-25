import type { Transaction } from "@/types/finance";
import { differenceInCalendarDays } from "date-fns";
import { useMemo } from "react";

import { parseDateOnly } from "@/lib/utils";

export type PendingBillsFilter = "all" | "overdue" | "today" | "upcoming";

export interface PendingBillsSummary {
  total: number;
  overdueAmount: number;
  overdueCount: number;
  todayCount: number;
  upcomingCount: number;
}

export function usePendingBills(pendingBills: Transaction[], activeFilter: PendingBillsFilter) {
  const summary = useMemo<PendingBillsSummary>(() => {
    const overdue = pendingBills.filter((bill) => bill.dueDate && differenceInCalendarDays(parseDateOnly(bill.dueDate)!, new Date()) < 0);
    const today = pendingBills.filter((bill) => bill.dueDate && differenceInCalendarDays(parseDateOnly(bill.dueDate)!, new Date()) === 0);
    const soon = pendingBills.filter((bill) => {
      if (!bill.dueDate) return false;
      const diff = differenceInCalendarDays(parseDateOnly(bill.dueDate)!, new Date());
      return diff > 0 && diff <= 3;
    });

    return {
      total: pendingBills.reduce((sum, bill) => sum + bill.amount, 0),
      overdueAmount: overdue.reduce((sum, bill) => sum + bill.amount, 0),
      overdueCount: overdue.length,
      todayCount: today.length,
      upcomingCount: soon.length,
    };
  }, [pendingBills]);

  const filteredBills = useMemo(() => {
    return pendingBills.filter((bill) => {
      if (!bill.dueDate) return activeFilter === "all";
      const diff = differenceInCalendarDays(parseDateOnly(bill.dueDate)!, new Date());
      if (activeFilter === "overdue") return diff < 0;
      if (activeFilter === "today") return diff === 0;
      if (activeFilter === "upcoming") return diff > 0 && diff <= 3;
      return true;
    });
  }, [pendingBills, activeFilter]);

  return {
    summary,
    filteredBills,
  };
}
