import type { SubscriptionFrequency } from "@/types/finance";

export interface ScheduleValidationParams {
  frequency: SubscriptionFrequency;
  dayOfMonth?: number | null;
  dayOfWeek?: number | null;
  month?: number | null;
}

export function validateSchedule(params: ScheduleValidationParams): string | null {
  const { frequency, dayOfMonth, dayOfWeek, month } = params;

  if ((frequency === "monthly" || frequency === "yearly") && (!dayOfMonth || dayOfMonth < 1 || dayOfMonth > 31)) {
    return "O dia do mês precisa estar entre 1 e 31.";
  }

  if (frequency === "weekly" && (dayOfWeek === undefined || dayOfWeek === null || dayOfWeek < 0 || dayOfWeek > 6)) {
    return "Selecione um dia da semana válido.";
  }

  if (frequency === "yearly" && (!month || month < 1 || month > 12)) {
    return "Selecione um mês válido.";
  }

  return null;
}

export function parseCurrencyInput(value: string): number {
  return Number(value.replace(/,/g, "."));
}
