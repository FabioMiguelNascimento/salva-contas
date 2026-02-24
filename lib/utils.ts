import type { Transaction } from "@/types/finance";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

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
