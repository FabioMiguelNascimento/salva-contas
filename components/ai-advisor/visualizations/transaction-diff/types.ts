import type { ComponentType } from "react";

export type InstallmentPlanItem = {
  installment: number;
  totalInstallments: number;
  amount: number;
  dueDate: string | null;
  status: string;
};

export type ResolvedPaymentMethod = {
  kind: string;
  label: string;
  detail: string | null;
  flag: string | null;
  icon: ComponentType<{ className?: string }>;
};
