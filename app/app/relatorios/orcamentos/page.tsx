"use client";

import { ReportFeaturePage } from "@/components/reports/report-feature-page";

export default function RelatorioOrcamentosPage() {
  return (
    <ReportFeaturePage
      feature="orcamentos"
      tag="Relatórios"
      title="Relatório de orçamentos"
      description="Monitore metas de gastos por categoria e identifique extrapolações rapidamente."
      sourceRoute="/app/orcamentos"
    />
  );
}
