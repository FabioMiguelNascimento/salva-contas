"use client";

import { ReportFeaturePage } from "@/components/reports/report-feature-page";

export default function RelatorioCofrinhosPage() {
  return (
    <ReportFeaturePage
      feature="cofrinhos"
      tag="Relatórios"
      title="Relatório de cofrinhos"
      description="Visualize progresso de objetivos, aportes e estimativas de conclusão por cofrinho."
      sourceRoute="/app/cofrinhos"
    />
  );
}
