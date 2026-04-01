"use client";

import { ReportFeaturePage } from "@/components/reports/report-feature-page";

export default function RelatorioTransacoesPage() {
  return (
    <ReportFeaturePage
      feature="transacoes"
      tag="Relatorios"
      title="Relatorio de transacoes"
      description="Analise entradas e saidas por categoria, status e janela temporal selecionada."
      sourceRoute="/app/extrato"
    />
  );
}
