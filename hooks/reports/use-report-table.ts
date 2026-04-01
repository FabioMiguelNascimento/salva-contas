import type { ReportPreviewResult } from "@/services/reports";
import { useMemo } from "react";

const normalizeHeader = (header: string) =>
  header
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "");

const isDateHeader = (header: string) => {
  const normalized = normalizeHeader(header);
  return (
    normalized.includes("data") ||
    normalized.includes("vencimento") ||
    normalized.includes("pagamento") ||
    normalized.includes("criado")
  );
};

const formatTypeValue = (value: string) => {
  if (value === "expense") return "Despesa";
  if (value === "income") return "Receita";
  if (value === "weekly") return "Semanal";
  if (value === "monthly") return "Mensal";
  if (value === "yearly") return "Anual";
  return value;
};

const formatStatusValue = (value: string) => {
  if (value === "paid") return "Pago";
  if (value === "pending") return "Pendente";
  if (value === "active") return "Ativo";
  if (value === "inactive") return "Inativo";
  if (value === "blocked") return "Bloqueado";
  if (value === "expired") return "Expirado";
  if (value === "cancelled") return "Cancelado";
  return value;
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR");
};

const formatMoney = (value: number) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });

const parseMoneyValue = (value: string | number) => {
  if (typeof value === "number") return value;

  const normalized = value
    .trim()
    .replace(/[R$\s]/g, "")
    .replace(/\.(?=\d{3}(?:\D|$))/g, "")
    .replace(/,(?=\d{2}$)/, ".");

  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? null : parsed;
};

const formatHeaderLabel = (header: string) => {
  const normalized = normalizeHeader(header);
  const mapped: Record<string, string> = {
    descricao: "Descrição",
    categoria: "Categoria",
    tipo: "Tipo",
    status: "Status",
    valor: "Valor",
    datadepagamento: "Data de pagamento",
    datadevencimento: "Data de vencimento",
    vencimento: "Vencimento",
    pagamento: "Pagamento",
    criadoem: "Criado em",
    nome: "Nome",
    bandeira: "Bandeira",
    ultimos4digitos: "Últimos 4 dígitos",
    limitetotal: "Limite total",
    limitedisponivel: "Limite disponível",
    diadefechamento: "Dia de fechamento",
    diadevencimento: "Dia de vencimento",
    frequencia: "Frequência",
    valororcado: "Valor orçado",
    mes: "Mês",
    ano: "Ano",
    valoratual: "Valor atual",
    meta: "Meta",
  };

  return mapped[normalized] ?? header;
};

export function useReportTable(preview: ReportPreviewResult | null) {
  const visibleIndexes = useMemo(() => {
    if (!preview) return [] as number[];
    return preview.headers
      .map((header, index) => ({ header, index }))
      .filter((entry) => normalizeHeader(entry.header) !== "id")
      .map((entry) => entry.index);
  }, [preview]);

  const summary = useMemo(() => {
    if (!preview) return { total: 0, paid: 0, pending: 0, records: 0 };

    const valueIndex = preview.headers.findIndex((header) => normalizeHeader(header) === "valor");
    const statusIndex = preview.headers.findIndex((header) => normalizeHeader(header) === "status");

    let total = 0;
    let paid = 0;
    let pending = 0;

    preview.rows.forEach((row) => {
      const rawValue = valueIndex >= 0 ? row[valueIndex] : null;
      const statusValue = statusIndex >= 0 ? String(row[statusIndex] ?? "") : "";

      if (rawValue === null || rawValue === undefined || rawValue === "") return;
      const numericValue = parseMoneyValue(String(rawValue));
      if (numericValue === null) return;

      total += numericValue;
      if (statusValue.toLowerCase().includes("pago")) paid += numericValue;
      if (statusValue.toLowerCase().includes("pendente")) pending += numericValue;
    });

    return { total, paid, pending, records: preview.rows.length };
  }, [preview]);

  const formatCellValue = (header: string, cell: string | number | null) => {
    if (cell === null || cell === undefined || cell === "") return "-";

    const stringValue = String(cell);
    if (isDateHeader(header)) return formatDate(stringValue);

    const normalized = normalizeHeader(header);
    if (normalized === "tipo" || normalized === "frequencia") return formatTypeValue(stringValue);
    if (normalized === "status") return formatStatusValue(stringValue);

    return stringValue;
  };

  return {
    summary,
    visibleIndexes,
    formatMoney,
    formatHeaderLabel,
    formatCellValue,
  };
}
