"use client";

import type { AiVisualization } from "@/types/finance";
import { useState } from "react";
import ConfirmationListVisualization from "./visualizations/ConfirmationListVisualization";
import DonutChartVisualization from "./visualizations/DonutChartVisualization";
import LineChartVisualization from "./visualizations/LineChartVisualization";
import SingleTransactionSummaryVisualization from "./visualizations/SingleTransactionSummaryVisualization";
import SummaryVisualization from "./visualizations/SummaryVisualization";
import TransactionDetailsVisualization from "./visualizations/TransactionDetailsVisualization";
import TransactionVisualization from "./visualizations/TransactionVisualization";
import { VisualizationStatus } from "./visualizations/types";
import VaultActionSummaryVisualization from "./visualizations/VaultActionSummaryVisualization";


interface AiAdvisorVisualizationRendererProps {
  visualization: AiVisualization;
  status: VisualizationStatus;
  onConfirmVisualization: (payload: any) => Promise<void>;
  onCancelVisualization: () => void;
}

export default function AiAdvisorVisualizationRenderer({
  visualization,
  status,
  onConfirmVisualization,
  onCancelVisualization,
}: AiAdvisorVisualizationRendererProps) {
  const payload = visualization.payload || {};
  const requiresConfirmation = Boolean((payload as any).requiresConfirmation);
  const [deselectedIndices, setDeselectedIndices] = useState<Set<number>>(new Set());

  const confirmData = () => {
    const proposedTransactions = Array.isArray((payload as any).proposedTransactions)
      ? (payload as any).proposedTransactions
      : null;

    if (proposedTransactions) {
      return proposedTransactions.filter((_: any, idx: number) => !deselectedIndices.has(idx));
    }

    if (payload && typeof payload === "object") {
      const { requiresConfirmation: _req, proposedTransactions: _prop, ...rest } = payload as any;
      return [rest];
    }

    return [];
  };

  const onConfirm = async () => {
    if (!requiresConfirmation || status === "confirming" || status === "confirmed") return;
    await onConfirmVisualization(confirmData());
  };

  const onCancel = () => {
    if (!requiresConfirmation || status === "confirmed") return;
    onCancelVisualization();
  };

  // Transaction visualization
  if (visualization.type === "transaction") {
    return (
      <TransactionVisualization
        visualization={visualization}
        status={status}
        onConfirm={onConfirm}
        onCancel={onCancel}
        requiresConfirmation={requiresConfirmation}
      />
    );
  }

  // Line chart visualization
  if (visualization.type === "chart_line") {
    return (
      <LineChartVisualization
        visualization={visualization}
        status={status}
        onConfirm={onConfirm}
        onCancel={onCancel}
        requiresConfirmation={requiresConfirmation}
      />
    );
  }

  // Donut chart visualization
  if (visualization.type === "chart_donut") {
    return (
      <DonutChartVisualization
        visualization={visualization}
        status={status}
        onConfirm={onConfirm}
        onCancel={onCancel}
        requiresConfirmation={requiresConfirmation}
      />
    );
  }

  // Transaction details search results
  if (
    visualization.type === "table_summary" &&
    visualization.toolName === "get_transaction_details" &&
    Array.isArray((payload as any).items)
  ) {
    return (
      <TransactionDetailsVisualization
        visualization={visualization}
        status={status}
        onConfirm={onConfirm}
        onCancel={onCancel}
        requiresConfirmation={requiresConfirmation}
      />
    );
  }

  // Single transaction summary
  if (
    visualization.type === "table_summary" &&
    visualization.payload &&
    typeof visualization.payload === "object" &&
    "description" in visualization.payload &&
    "amount" in visualization.payload
  ) {
    return (
      <SingleTransactionSummaryVisualization
        visualization={visualization}
        status={status}
        onConfirm={onConfirm}
        onCancel={onCancel}
        requiresConfirmation={requiresConfirmation}
      />
    );
  }

  // Confirmation list with checkboxes
  if (requiresConfirmation && Array.isArray(payload.items)) {
    return (
      <ConfirmationListVisualization
        visualization={visualization}
        status={status}
        onConfirm={onConfirm}
        onCancel={onCancel}
        requiresConfirmation={requiresConfirmation}
      />
    );
  }

  // Vault action summary (AI tool)
  if (visualization.type === "table_summary" && visualization.toolName === "vault_ai_action") {
    return (
      <VaultActionSummaryVisualization
        visualization={visualization}
        status={status}
        onConfirm={onConfirm}
        onCancel={onCancel}
        requiresConfirmation={requiresConfirmation}
      />
    );
  }

  // Default summary visualization
  return (
    <SummaryVisualization
      visualization={visualization}
      status={status}
      onConfirm={onConfirm}
      onCancel={onCancel}
      requiresConfirmation={requiresConfirmation}
    />
  );
}
