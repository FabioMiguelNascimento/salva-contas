import { apiClient } from "@/lib/api-client";
import type {
    PaymentMethod,
    ProcessTransactionClientPayload,
    Transaction,
    TransactionFilters,
    TransactionStatus,
    TransactionType,
    UpdateTransactionPayload,
} from "@/types/finance";

type ApiTransaction = Omit<Transaction, "amount" | "category"> & {
  amount: string | number;
  category?: string | null;
  createdById?: string | null;
  createdByName?: string | null;
};

type ApiResponse<T> = T | { data: T };

export type ManualTransactionPayload = {
  amount: number;
  description: string;
  category: string;
  type: TransactionType;
  status: TransactionStatus;
  dueDate?: string;
  paymentDate?: string;
  creditCardId?: string;
  debitCardId?: string;
  splits?: Array<{
    amount: number;
    paymentMethod: PaymentMethod;
    creditCardId?: string | null;
    debitCardId?: string | null;
  }>;
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
    creditCard: transaction.creditCard ?? null,
    creditCardId: transaction.creditCardId ?? transaction.creditCard?.id ?? null,
    debitCard: transaction.debitCard ?? null,
    debitCardId: transaction.debitCardId ?? transaction.debitCard?.id ?? null,
    createdById: transaction.createdById ?? null,
    createdByName: transaction.createdByName ?? null,
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

  if (payload.creditCardId) {
    formData.append("creditCardId", payload.creditCardId);
  }

  if (payload.debitCardId) {
    formData.append("debitCardId", payload.debitCardId);
  }

  const response = await apiClient.post<ApiResponse<ApiTransaction | ApiTransaction[]>>("/transactions", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  const data = unwrapData(response.data);
  const transactions = Array.isArray(data) ? data : [data];

  if (transactions.length === 0) {
    throw new Error("Nenhuma transação foi identificada no documento enviado.");
  }

  return normalizeTransaction(transactions[0]);
}

export async function confirmTransaction(payload: Record<string, any> | Record<string, any>[]) {
  const response = await apiClient.post<ApiResponse<ApiTransaction | ApiTransaction[]>>('/transactions/confirm', payload);
  const data = unwrapData(response.data);

  if (Array.isArray(data)) {
    return data.map(normalizeTransaction);
  }

  return normalizeTransaction(data);
}

export async function createManualTransaction(payload: ManualTransactionPayload) {
  const response = await apiClient.post<ApiResponse<ApiTransaction | ApiTransaction[]>>('/transactions/confirm', payload);
  const data = unwrapData(response.data);

  if (Array.isArray(data)) {
    if (data.length === 0) {
      throw new Error("Não foi possível criar a transação manual.");
    }
    return normalizeTransaction(data[0]);
  }

  return normalizeTransaction(data);
}

export async function updateTransaction(id: string, payload: UpdateTransactionPayload) {
  const response = await apiClient.patch<ApiResponse<ApiTransaction>>(`/transactions/${id}`, payload);
  return normalizeTransaction(unwrapData(response.data));
}

export async function deleteTransaction(id: string) {
  await apiClient.delete(`/transactions/${id}`);
}
