export type TransactionType = "expense" | "income";
export type TransactionStatus = "paid" | "pending";
export type SubscriptionFrequency = "weekly" | "monthly" | "yearly";
export type CreditCardFlag = "visa" | "mastercard" | "american_express" | "elo" | "hipercard" | "other";
export type CreditCardStatus = "active" | "blocked" | "expired" | "cancelled";
export type DebitCardStatus = "active" | "blocked" | "expired" | "cancelled";
export type PaymentMethod = "credit_card" | "debit" | "pix" | "cash" | "transfer" | "other";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  credit_card: "Cartão de crédito",
  debit: "Cartão de débito",
  pix: "PIX",
  cash: "Dinheiro",
  transfer: "Transferência",
  other: "Outro",
};

export interface TransactionSplit {
  id?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  creditCardId?: string | null;
  debitCardId?: string | null;
  creditCard?: CreditCard | null;
  debitCard?: DebitCard | null;
}

export interface TransactionCategory {
  id: string;
  name: string;
  icon?: string | null;
  userId?: string;
  isGlobal?: boolean;
}

export interface CreditCard {
  id: string;
  userId?: string | null;
  createdById?: string | null;
  name: string;
  flag: CreditCardFlag;
  lastFourDigits?: string | null;
  limit: number;
  availableLimit: number;
  closingDay: number;
  dueDay: number;
  status: CreditCardStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreditCardSummary {
  creditCard: CreditCard;
  currentDebt: number;
  availableLimit: number;
  nextClosingDate: string;
  nextDueDate: string;
}

export interface DebitCard {
  id: string;
  userId?: string | null;
  createdById?: string | null;
  name: string;
  flag: CreditCardFlag;
  lastFourDigits?: string | null;
  status: DebitCardStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Transaction {
  id: string;
  userId?: string | null;
  createdById?: string | null;
  createdByName?: string | null;
  description: string;
  amount: number;
  category: string;
  categoryId?: string | null;
  categoryName?: string | null;
  categoryRel?: TransactionCategory | null;
  creditCard?: CreditCard | null;
  creditCardId?: string | null;
  debitCard?: DebitCard | null;
  debitCardId?: string | null;
  vaultId?: string | null;
  status: TransactionStatus;
  type: TransactionType;
  dueDate: string | null;
  paymentDate: string | null;
  rawText?: string | null;
  
  // Campos de anexo
  attachmentKey?: string | null;
  attachmentOriginalName?: string | null;
  attachmentMimeType?: string | null;
  attachmentSize?: number | null;
  attachmentUrl?: string | null; // URL pré-assinada gerada pelo backend

  splits?: TransactionSplit[];

  createdAt?: string;
  updatedAt?: string;
}

export interface Subscription {
  id: string;
  userId?: string | null;
  createdById?: string | null;
  description: string;
  amount: number;
  categoryId: string;
  category?: TransactionCategory | null;
  creditCardId?: string | null;
  creditCard?: CreditCard | null;
  debitCardId?: string | null;
  debitCard?: DebitCard | null;
  frequency: SubscriptionFrequency;
  dayOfMonth?: number | null;
  dayOfWeek?: number | null;
  month?: number | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardFinancialSummary {
  income: number;
  expenses: number;
  balance: number;
  availableBalance?: number;
  savedAmount?: number;
  incomeChangePercent?: number;
  expensesChangePercent?: number;
  balanceChangePercent?: number;
  previousMonth?: {
    income: number;
    expenses: number;
    balance: number;
  };
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

export interface Vault {
  id: string;
  userId?: string | null;
  name: string;
  targetAmount?: number | null;
  currentAmount: number;
  color?: string | null;
  icon?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateVaultPayload {
  name: string;
  targetAmount?: number;
  color?: string;
  icon?: string;
}

export interface UpdateVaultPayload {
  name?: string;
  targetAmount?: number | null;
  color?: string | null;
  icon?: string | null;
}

export interface VaultAmountPayload {
  amount: number;
}

export type VaultHistoryEventType = "deposit" | "withdraw" | "yield";

export interface VaultHistoryEvent {
  id: string;
  type: VaultHistoryEventType;
  amount: number;
  balanceAfter: number;
  happenedAt: string;
}

export interface VaultHistoryGroup {
  date: string;
  items: VaultHistoryEvent[];
}

export interface VaultHistoryResponse {
  month: string;
  summary: {
    totalDeposited: number;
    totalWithdrawn: number;
    totalYield: number;
    totalNetSaved: number;
    totalEvents: number;
  };
  groups: VaultHistoryGroup[];
  pagination: {
    limit: number;
    nextCursor: string | null;
    hasNextPage: boolean;
  };
}

export interface VaultHistoryQuery {
  month?: number;
  year?: number;
  limit?: number;
  cursor?: string;
}

export interface TransactionFilters {
  month: number;
  year: number;
  startDate?: string;
  endDate?: string;
  status?: TransactionStatus;
  type?: TransactionType;
  categoryId?: string;
  limit?: number;
  page?: number;
}

export interface UpdateTransactionPayload {
  amount?: number;
  description?: string;
  categoryId?: string | null;
  type?: TransactionType;
  status?: TransactionStatus;
  dueDate?: string | null;
  paymentDate?: string | null;
  creditCardId?: string | null;
  debitCardId?: string | null;
  splits?: Omit<TransactionSplit, 'id' | 'creditCard' | 'debitCard'>[];
}

export interface CreateSubscriptionPayload {
  description: string;
  amount: number;
  categoryId: string;
  creditCardId?: string;
  frequency: SubscriptionFrequency;
  dayOfMonth?: number | null;
  dayOfWeek?: number | null;
  month?: number | null;
  isActive?: boolean;
}

export interface UpdateSubscriptionPayload extends Partial<CreateSubscriptionPayload> {}

export interface ProcessTransactionPayload {
  imageBase64?: string;
  description?: string;
}

export interface ProcessTransactionClientPayload {
  file?: File | null;
  text?: string;
  isScheduled?: boolean;
  date?: string | null;
  creditCardId?: string;
  debitCardId?: string;
}

// Budget types
export interface Budget {
  id: string;
  userId?: string;
  categoryId: string;
  category?: TransactionCategory | null;
  amount: number;
  month: number;
  year: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BudgetProgress {
  budget: Budget;
  spent: number;
  remaining: number;
  percentage: number;
}

export interface BudgetFilters {
  month?: number;
  year?: number;
}

export interface CreateBudgetPayload {
  categoryId: string;
  amount: number;
  month: number;
  year: number;
}

export interface UpdateBudgetPayload {
  amount?: number;
}

// Credit Card types
export interface CreateCreditCardPayload {
  name: string;
  flag: CreditCardFlag;
  lastFourDigits?: string;
  limit: number;
  closingDay: number;
  dueDay: number;
}

export interface UpdateCreditCardPayload {
  name?: string;
  flag?: CreditCardFlag;
  lastFourDigits?: string;
  limit?: number;
  closingDay?: number;
  dueDay?: number;
  status?: CreditCardStatus;
}

export interface CreditCardFilters {
  status?: CreditCardStatus;
  page?: number;
  limit?: number;
}

export interface CreateDebitCardPayload {
  name: string;
  flag: CreditCardFlag;
  lastFourDigits?: string;
}

export interface UpdateDebitCardPayload {
  name?: string;
  flag?: CreditCardFlag;
  lastFourDigits?: string;
  status?: DebitCardStatus;
}

export interface DebitCardFilters {
  status?: DebitCardStatus;
  page?: number;
  limit?: number;
}

// Notification types
export type NotificationType =
  | "due_date"
  | "budget_limit"
  | "payment_reminder"
  | "subscription_renewal"
  | "general";

export type NotificationStatus = "unread" | "read";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  status: NotificationStatus;
  relatedId: string | null;
  createdAt: string;
  readAt: string | null;
}

export interface CreateNotificationPayload {
  title: string;
  message: string;
  type: NotificationType;
  relatedId?: string;
}

export type AiVisualizationType = "chart_donut" | "chart_line" | "table_summary" | "transaction";

export interface AiVisualization {
  type: AiVisualizationType;
  toolName: string;
  title: string;
  payload: Record<string, any>;
}

export interface AiAdvisorChatHistoryMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AiAdvisorChatResponse {
  message: string;
  toolCalls: string[];
  visualization: AiVisualization | null;
  visualizations: AiVisualization[];
}
