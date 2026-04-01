"use client";

import { ReportFeaturePage } from "@/components/reports/report-feature-page";

export default function RelatorioContasPage() {
  return (
    <ReportFeaturePage
      feature="contas"
      tag="Relatórios"
      title="Relatório de contas a pagar"
      description="Visualize previsões de vencimento, pendências e indicadores de pagamento por período."
      sourceRoute="/app/contas"
    />
  );
}
