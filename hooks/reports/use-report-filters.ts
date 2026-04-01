import type { ReportFilters } from "@/services/reports";
import { useMemo, useState } from "react";

export type ReportFilterForm = {
  month: number;
  year: number;
  status: string;
  startDate: string;
  endDate: string;
};

export function useReportFilters() {
  const now = new Date();
  const [form, setForm] = useState<ReportFilterForm>({
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    status: "all",
    startDate: "",
    endDate: "",
  });

  const [submittedFilters, setSubmittedFilters] = useState<ReportFilterForm>(form);

  const appliedFilters = useMemo<ReportFilters>(() => {
    return {
      month: submittedFilters.month,
      year: submittedFilters.year,
      ...(submittedFilters.status !== "all"
        ? { status: submittedFilters.status as "paid" | "pending" }
        : {}),
      ...(submittedFilters.startDate ? { startDate: submittedFilters.startDate } : {}),
      ...(submittedFilters.endDate ? { endDate: submittedFilters.endDate } : {}),
    };
  }, [submittedFilters]);

  const submitFilters = () => {
    setSubmittedFilters(form);
  };

  const clearPeriod = () => {
    setForm((prev) => ({
      ...prev,
      startDate: "",
      endDate: "",
    }));
  };

  return {
    form,
    setForm,
    appliedFilters,
    submitFilters,
    clearPeriod,
  };
}
