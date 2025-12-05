import { apiClient } from "@/lib/api-client";
import type {
  ManualTransactionPayload,
  ProcessTransactionClientPayload,
  Transaction,
  TransactionFilters,
  UpdateTransactionPayload,
} from "@/types/finance";

type ApiTransaction = Omit<Transaction, "amount" | "category"> & {
  amount: string | number;
  category?: string | null;
};

type ApiResponse<T> = T | { data: T };

const toNumber = (value: string | number): number => {
  const parsed = typeof value === "string" ? Number(value) : value;
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeTransaction = (transaction: ApiTransaction): Transaction => {
  const categoryLabel =
    transaction.categoryName ?? transaction.categoryRel?.name ?? transaction.category ?? "Sem categoria";

  return {
    ...transaction,
    amount: toNumber(transaction.amount),
    category: categoryLabel,
    categoryName: categoryLabel,
    categoryId: transaction.categoryId ?? transaction.categoryRel?.id ?? null,
    categoryRel: transaction.categoryRel ?? null,
    creditCard: transaction.creditCard ?? null,
    creditCardId: transaction.creditCardId ?? transaction.creditCard?.id ?? null,
  };
};

const unwrapData = <T>(payload: ApiResponse<T>): T => {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
};

export async function fetchTransactions(filters: TransactionFilters) {
  const response = await apiClient.get<ApiResponse<ApiTransaction[]>>("/transactions", {
    params: filters,
  });

  const transactions = unwrapData(response.data);
  return (transactions ?? []).map(normalizeTransaction);
}

export async function createTransaction(payload: ManualTransactionPayload) {
  const response = await apiClient.post<ApiResponse<ApiTransaction>>("/transactions", payload);
  return normalizeTransaction(unwrapData(response.data));
}

export async function processTransaction(payload: ProcessTransactionClientPayload) {
  if (!payload.file && !payload.text) {
    throw new Error("Envie um arquivo ou informe um texto para processar a transação.");
  }

  const formData = new FormData();

  if (payload.file) {
    formData.append("file", payload.file);
  }

  if (payload.text) {
    formData.append("text", payload.text);
  }

  if (payload.date) {
    formData.append(payload.isScheduled ? "dueDate" : "paymentDate", payload.date);
  }

  const response = await apiClient.post<ApiResponse<ApiTransaction>>("/transactions", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return normalizeTransaction(unwrapData(response.data));
}

export async function updateTransaction(id: string, payload: UpdateTransactionPayload) {
  const response = await apiClient.patch<ApiResponse<ApiTransaction>>(`/transactions/${id}`, payload);
  return normalizeTransaction(unwrapData(response.data));
}

export async function deleteTransaction(id: string) {
  await apiClient.delete(`/transactions/${id}`);
}
