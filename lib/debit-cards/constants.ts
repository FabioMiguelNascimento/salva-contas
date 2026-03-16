import type { CreditCardFlag, DebitCardStatus } from '@/types/finance';

export type DebitCardStatusOption = {
  value: DebitCardStatus;
  label: string;
  variant: 'success' | 'warning' | 'danger' | 'muted';
};

export const debitCardStatuses: DebitCardStatusOption[] = [
  { value: 'active', label: 'Ativo', variant: 'success' },
  { value: 'blocked', label: 'Bloqueado', variant: 'warning' },
  { value: 'expired', label: 'Expirado', variant: 'danger' },
  { value: 'cancelled', label: 'Cancelado', variant: 'muted' },
];

export function getDebitStatusLabel(status: DebitCardStatus): string {
  return debitCardStatuses.find((s) => s.value === status)?.label ?? status;
}

export function getDebitStatusVariant(status: DebitCardStatus): DebitCardStatusOption['variant'] {
  return debitCardStatuses.find((s) => s.value === status)?.variant ?? 'muted';
}

export function formatDebitCardNumber(lastFourDigits?: string | null): string {
  if (!lastFourDigits) return '•••• ••••';
  return `•••• ${lastFourDigits}`;
}

export function getDebitFlagLabel(flag: CreditCardFlag): string {
  const map: Record<CreditCardFlag, string> = {
    visa: 'Visa',
    mastercard: 'Mastercard',
    american_express: 'American Express',
    elo: 'Elo',
    hipercard: 'Hipercard',
    other: 'Outro',
  };

  return map[flag] || flag;
}
