"use client";

import { ReportFeaturePage } from "@/components/reports/report-feature-page";

export default function RelatorioTransacoesPage() {
  return (
    <ReportFeaturePage
      feature="transacoes"
      tag="Relatórios"
      title="Relatório de transações"
      description="Analise entradas e saídas por categoria, status e janela temporal selecionada."
      sourceRoute="/app/extrato"
    />
  );
}
