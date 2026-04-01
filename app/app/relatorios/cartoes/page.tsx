"use client";

import { ReportFeaturePage } from "@/components/reports/report-feature-page";

export default function RelatorioCartoesPage() {
  return (
    <ReportFeaturePage
      feature="cartoes"
      tag="Relatórios"
      title="Relatório de cartões"
      description="Acompanhe uso de limite, faturamento e concentração de gastos por cartão."
      sourceRoute="/app/cartoes"
    />
  );
}
