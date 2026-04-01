"use client";

import { ReportFeaturePage } from "@/components/reports/report-feature-page";

export default function RelatorioCofrinhosPage() {
  return (
    <ReportFeaturePage
      feature="cofrinhos"
      tag="Relatorios"
      title="Relatorio de cofrinhos"
      description="Visualize progresso de objetivos, aportes e estimativas de conclusao por cofrinho."
      sourceRoute="/app/cofrinhos"
    />
  );
}
