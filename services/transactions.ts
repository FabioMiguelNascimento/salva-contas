import { apiClient } from "@/lib/api-client";
import type {
    ManualTransactionPayload,
    ProcessTransactionPayload,
    Transaction,
    TransactionFilters,
    UpdateTransactionPayload,
} from "@/types/finance";

type ApiTransaction = Omit<Transaction, "amount" | "category"> & {
  amount: string | number;
  category?: string | null;
};

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
  };
};

const buildFormData = (payload: ProcessTransactionPayload) => {
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

  return formData;
};

export async function fetchTransactions(filters: TransactionFilters) {
  const response = await apiClient.get<ApiTransaction[]>("/transactions", {
    params: filters,
  });

  return response.data.map(normalizeTransaction);
}

export async function createTransaction(payload: ManualTransactionPayload) {
  const response = await apiClient.post<ApiTransaction>("/transactions", payload);
  return normalizeTransaction(response.data);
}

export async function processTransaction(payload: ProcessTransactionPayload) {
  const formData = buildFormData(payload);

  if (!formData.has("file") && !formData.has("text")) {
    throw new Error("Envie um arquivo ou informe um texto para processar a transação.");
  }

  const response = await apiClient.post<ApiTransaction>("/transactions/process", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return normalizeTransaction(response.data);
}

export async function updateTransaction(id: string, payload: UpdateTransactionPayload) {
  const response = await apiClient.patch<ApiTransaction>(`/transactions/${id}`, payload);
  return normalizeTransaction(response.data);
}

export async function deleteTransaction(id: string) {
  await apiClient.delete(`/transactions/${id}`);
}
