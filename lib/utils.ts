import { formatCurrency as formatCurrencyLib } from "@/lib/currency-utils";
import { parseDateOnly as parseDateOnlyLib } from "@/lib/date-utils";
import { getInitials as getInitialsLib } from "@/lib/text-utils";
import type { Transaction } from "@/types/finance";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = formatCurrencyLib;
export const parseDateOnly = parseDateOnlyLib;
export const getInitials = getInitialsLib;

export function removeAccents(str: string) {
  return str.normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

export function getTransactionCategoryLabel(
  transaction: Pick<Transaction, "category" | "categoryName" | "categoryRel">
) {
  return transaction.categoryName ?? transaction.categoryRel?.name ?? transaction.category
}

export function getPlanLabel(planTier?: string) {
  if (!planTier) return "Grátis";
  
  const labels: Record<string, string> = {
    FREE: "Grátis",
    PRO: "Pro",
    FAMILY: "Família",
  };

  return labels[planTier.toUpperCase()] ?? planTier;
}

export function getTransactionStatusLabel(status?: string | null) {
  if (!status) return "—";

  const labels: Record<string, string> = {
    paid: "Pago",
    pending: "Pendente",
    overdue: "Atrasado",
    cancelled: "Cancelado",
    canceled: "Cancelado",
  };

  const normalized = status.toLowerCase();
  return labels[normalized] ?? status;
}
