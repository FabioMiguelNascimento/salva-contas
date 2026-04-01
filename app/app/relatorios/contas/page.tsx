"use client";

import { ReportFeaturePage } from "@/components/reports/report-feature-page";

export default function RelatorioContasPage() {
  return (
    <ReportFeaturePage
      feature="contas"
      tag="Relatorios"
      title="Relatorio de contas a pagar"
      description="Visualize previsoes de vencimento, pendencias e indicadores de pagamento por periodo."
      sourceRoute="/app/contas"
    />
  );
}
