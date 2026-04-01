"use client";

import { ReportFeaturePage } from "@/components/reports/report-feature-page";

export default function RelatorioAssinaturasPage() {
  return (
    <ReportFeaturePage
      feature="assinaturas"
      tag="Relatorios"
      title="Relatorio de assinaturas"
      description="Consolide custos recorrentes e risco de renovacoes com maior impacto mensal."
      sourceRoute="/app/assinaturas"
    />
  );
}
