"use client";

import { ReportFeaturePage } from "@/components/reports/report-feature-page";

export default function RelatorioOrcamentosPage() {
  return (
    <ReportFeaturePage
      feature="orcamentos"
      tag="Relatorios"
      title="Relatorio de orcamentos"
      description="Monitore metas de gastos por categoria e identifique extrapolacoes rapidamente."
      sourceRoute="/app/orcamentos"
    />
  );
}
