export const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatCurrency(value?: number | string | null): string {
  const n = parseAmount(value as any);
  return currencyFormatter.format(n);
}

export function parseNumber(value: string | number): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[^\d\-.,]/g, "").replace(/,/g, ".");
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

export function parseAmount(value?: number | string | null): number {
  if (value === undefined || value === null) return 0;
  return parseNumber(value as any);
}
