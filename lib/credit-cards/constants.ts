import type { CreditCardFlag, CreditCardStatus } from "@/types/finance";

export type CreditCardFlagOption = {
  value: CreditCardFlag;
  label: string;
  color: string;
};

export const creditCardFlags: CreditCardFlagOption[] = [
  { value: "visa", label: "Visa", color: "bg-blue-500" },
  { value: "mastercard", label: "Mastercard", color: "bg-red-500" },
  { value: "american_express", label: "American Express", color: "bg-sky-600" },
  { value: "elo", label: "Elo", color: "bg-yellow-500" },
  { value: "hipercard", label: "Hipercard", color: "bg-red-600" },
  { value: "other", label: "Outro", color: "bg-gray-500" },
];

export type CreditCardStatusOption = {
  value: CreditCardStatus;
  label: string;
  variant: "success" | "warning" | "danger" | "muted";
};

export const creditCardStatuses: CreditCardStatusOption[] = [
  { value: "active", label: "Ativo", variant: "success" },
  { value: "blocked", label: "Bloqueado", variant: "warning" },
  { value: "expired", label: "Expirado", variant: "danger" },
  { value: "cancelled", label: "Cancelado", variant: "muted" },
];

export function getFlagLabel(flag: CreditCardFlag): string {
  return creditCardFlags.find((f) => f.value === flag)?.label ?? flag;
}

export function getFlagColor(flag: CreditCardFlag): string {
  return creditCardFlags.find((f) => f.value === flag)?.color ?? "bg-gray-500";
}

export function getStatusLabel(status: CreditCardStatus): string {
  return creditCardStatuses.find((s) => s.value === status)?.label ?? status;
}

export function getStatusVariant(status: CreditCardStatus): CreditCardStatusOption["variant"] {
  return creditCardStatuses.find((s) => s.value === status)?.variant ?? "muted";
}

export function formatCardNumber(lastFourDigits?: string | null): string {
  if (!lastFourDigits) return "•••• ••••";
  return `•••• ${lastFourDigits}`;
}
