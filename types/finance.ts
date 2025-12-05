export type TransactionType = "expense" | "income";
export type TransactionStatus = "paid" | "pending";

export interface TransactionCategory {
  id: string;
  name: string;
  icon?: string | null;
  userId?: string;
}

export interface Transaction {
  id: string;
  userId?: string | null;
  description: string;
  amount: number;
  category: string;
  categoryId?: string | null;
  categoryName?: string | null;
  categoryRel?: TransactionCategory | null;
  status: TransactionStatus;
  type: TransactionType;
  dueDate: string | null;
  paymentDate: string | null;
  rawText?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardFinancialSummary {
  income: number;
  expenses: number;
  balance: number;
}

export interface DashboardPendingBillsSummary {
  count: number;
  totalAmount: number;
  overdue: number;
}

export interface CategoryBreakdownItem {
  category: string;
  total: number;
}

export interface DashboardMetrics {
  financials: DashboardFinancialSummary;
  pendingBills: DashboardPendingBillsSummary;
  categoryBreakdown: CategoryBreakdownItem[];
  lastUpdated?: string;
}

export interface TransactionFilters {
  month: number;
  year: number;
  status?: TransactionStatus;
  type?: TransactionType;
}

export interface ManualTransactionPayload {
  amount: number;
  description: string;
  category: string;
  categoryId?: string | null;
  type: TransactionType;
  status: TransactionStatus;
  dueDate?: string | null;
  paymentDate?: string | null;
}

export interface UpdateTransactionPayload {
  status?: TransactionStatus;
  description?: string;
  category?: string;
  categoryId?: string | null;
  amount?: number;
  type?: TransactionType;
  dueDate?: string | null;
  paymentDate?: string | null;
}

export interface ProcessTransactionPayload {
  file?: File | null;
  text?: string;
  isScheduled?: boolean;
  date?: string | null;
}
