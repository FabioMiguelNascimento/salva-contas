import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export function parseDate(value?: string | Date | null): Date | undefined {
  if (!value) return undefined;
  return parseDateOnly(value) ?? undefined;
}

export function parseDateOnly(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  }

  return new Date(value);
}

export function toDateOnlyString(value: Date | string | null | undefined): string | null {
  if (!value) return null;

  const parsed =
    value instanceof Date
      ? value
      : parseDateOnly(value);

  if (!parsed) return null;

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDate(value?: string | Date | null, defaultValue = "—"): string {
  if (!value) return defaultValue;

  try {
    if (typeof value === "string") {
      const datePrefixMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})(?:$|T)/);
      if (datePrefixMatch) {
        const [, year, month, day] = datePrefixMatch;
        return `${day}/${month}/${year}`;
      }
    }

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
