import type { Transaction } from "@/types/finance"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getTransactionCategoryLabel(
  transaction: Pick<Transaction, "category" | "categoryName" | "categoryRel">
) {
  return transaction.categoryName ?? transaction.categoryRel?.name ?? transaction.category
}
