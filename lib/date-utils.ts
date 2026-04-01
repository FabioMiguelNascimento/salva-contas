import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export function parseDateOnly(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const str = typeof value === "string" ? value : value.toISOString();
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  }
  return new Date(str);
}

export function formatDate(value?: string | Date | null, defaultValue = "—"): string {
  if (!value) return defaultValue;

  try {
    let date: Date;
    if (typeof value === "string") {
      const parsed = parseISO(value);
      if (Number.isNaN(parsed.getTime())) return String(value);
      date = parsed;
    } else {
      date = value;
    }

    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      return String(value);
    }

    return format(date, "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return String(value);
  }
}
