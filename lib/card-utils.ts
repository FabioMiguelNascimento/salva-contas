import type { CreditCardFlag, CreditCardStatus, DebitCardStatus } from "@/types/finance";

interface CardFlags {
    value: CreditCardFlag;
    label: string;
    color: string;
}

interface CardStatuses {
    value: CreditCardStatus | DebitCardStatus;
    label: string;
    variant: "success" | "warning" | "danger" | "muted";
}

export const cardFlags: CardFlags[] = [
  { value: "visa", label: "Visa", color: "bg-blue-500" },
  { value: "mastercard", label: "Mastercard", color: "bg-[#ff5f00]" },
  { value: "american_express", label: "American Express", color: "bg-sky-600" },
  { value: "elo", label: "Elo", color: "bg-emerald-600" },
  { value: "hipercard", label: "Hipercard", color: "bg-red-600" },
  { value: "other", label: "Outro", color: "bg-gray-500" },
];

export const cardStatuses: CardStatuses[] = [
  { value: "active", label: "Ativo", variant: "success" },
  { value: "blocked", label: "Bloqueado", variant: "warning" },
  { value: "expired", label: "Expirado", variant: "danger" },
  { value: "cancelled", label: "Cancelado", variant: "muted" },
];

export function formatCardNumber(lastFourDigits?: string | null): string {
  if (!lastFourDigits) return "•••• ••••";
  return `•••• ${lastFourDigits}`;
}

export function formatDebitCardNumber(lastFourDigits?: string | null): string {
  return formatCardNumber(lastFourDigits);
}

export function getFlagLabel(flag: CreditCardFlag): string {
  return cardFlags.find((f) => f.value === flag)?.label ?? flag;
}

export function getFlagColor(flag: CreditCardFlag): string {
  return cardFlags.find((f) => f.value === flag)?.color ?? "bg-gray-500";
}

export function getStatusLabel(status: CreditCardStatus | DebitCardStatus): string {
  return cardStatuses.find((s) => s.value === status)?.label ?? status;
}

export function getStatusVariant(status: CreditCardStatus | DebitCardStatus) {
  return cardStatuses.find((s) => s.value === status)?.variant ?? "muted";
}
