"use client";

import { ReportFeaturePage } from "@/components/reports/report-feature-page";

export default function RelatorioCartoesPage() {
  return (
    <ReportFeaturePage
      feature="cartoes"
      tag="Relatorios"
      title="Relatorio de cartoes"
      description="Acompanhe uso de limite, faturamento e concentracao de gastos por cartao."
      sourceRoute="/app/cartoes"
    />
  );
}
