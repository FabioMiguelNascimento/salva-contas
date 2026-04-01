"use client";

import { ReportFeaturePage } from "@/components/reports/report-feature-page";

export default function RelatorioAssinaturasPage() {
  return (
    <ReportFeaturePage
      feature="assinaturas"
      tag="Relatórios"
      title="Relatório de assinaturas"
      description="Consolide custos recorrentes e risco de renovações com maior impacto mensal."
      sourceRoute="/app/assinaturas"
    />
  );
}
