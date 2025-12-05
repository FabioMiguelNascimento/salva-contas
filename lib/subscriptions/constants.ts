import type { SubscriptionFrequency } from "@/types/finance";

export type FrequencyOption = {
  value: SubscriptionFrequency;
  label: string;
  helper: string;
};

export const frequencyOptions: FrequencyOption[] = [
  { value: "monthly", label: "Mensal", helper: "Repete em um dia específico todo mês" },
  { value: "weekly", label: "Semanal", helper: "Repete em um dia fixo da semana" },
  { value: "yearly", label: "Anual", helper: "Repete em um dia e mês específicos" },
];

export type WeekDayOption = {
  value: number;
  label: string;
};

export const weekDays: WeekDayOption[] = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda" },
  { value: 2, label: "Terça" },
  { value: 3, label: "Quarta" },
  { value: 4, label: "Quinta" },
  { value: 5, label: "Sexta" },
  { value: 6, label: "Sábado" },
];

export type MonthOption = {
  value: number;
  label: string;
};

export const months: MonthOption[] = [
  { value: 1, label: "Janeiro" },
  { value: 2, label: "Fevereiro" },
  { value: 3, label: "Março" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Maio" },
  { value: 6, label: "Junho" },
  { value: 7, label: "Julho" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Setembro" },
  { value: 10, label: "Outubro" },
  { value: 11, label: "Novembro" },
  { value: 12, label: "Dezembro" },
];

export const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

// Meses abreviados para filtros de período
export const monthsShort = [
  { value: 1, label: "Jan" },
  { value: 2, label: "Fev" },
  { value: 3, label: "Mar" },
  { value: 4, label: "Abr" },
  { value: 5, label: "Mai" },
  { value: 6, label: "Jun" },
  { value: 7, label: "Jul" },
  { value: 8, label: "Ago" },
  { value: 9, label: "Set" },
  { value: 10, label: "Out" },
  { value: 11, label: "Nov" },
  { value: 12, label: "Dez" },
] as const;

// Anos disponíveis para filtros
export const getAvailableYears = () => {
  const currentYear = new Date().getFullYear();
  return [currentYear - 1, currentYear, currentYear + 1];
};
