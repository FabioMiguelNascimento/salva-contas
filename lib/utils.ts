import type { Transaction } from "@/types/finance";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

/**
 * Parse a date-only value (ISO string like "2026-02-17T00:00:00.000Z" or "2026-02-17")
 * as a LOCAL date, avoiding the UTC-midnight → previous-day timezone shift.
 * Always safe to use for business dates (paymentDate, dueDate) from the API.
 */
export function parseDateOnly(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const str = typeof value === "string" ? value : value.toISOString();
  // Extract YYYY-MM-DD portion and build a local-midnight Date
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  }
  return new Date(str);
}

/**
 * Remove diacritic marks (accents) from a string for simpler comparisons.
 */
export function removeAccents(str: string) {
  return str.normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

export function getTransactionCategoryLabel(
  transaction: Pick<Transaction, "category" | "categoryName" | "categoryRel">
) {
  return transaction.categoryName ?? transaction.categoryRel?.name ?? transaction.category
}
