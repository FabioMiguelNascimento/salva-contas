"use client";

import type { AiVisualization } from "@/types/ai-advisor";
import { ReactNode } from "react";
import ConfirmationListVisualization from "./visualizations/ConfirmationListVisualization";
import DonutChartVisualization from "./visualizations/DonutChartVisualization";
import LineChartVisualization from "./visualizations/LineChartVisualization";
import SingleTransactionSummaryVisualization from "./visualizations/SingleTransactionSummaryVisualization";
import SummaryVisualization from "./visualizations/SummaryVisualization";
import TransactionDetailsVisualization from "./visualizations/TransactionDetailsVisualization";
import TransactionDiffVisualization from "./visualizations/TransactionDiffVisualization";
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

  const buildConfirmPayload = () => {
    if (payload && typeof payload === 'object' && Array.isArray((payload as any).proposedTransactions)) {
      return (payload as any).proposedTransactions;
    }

    if (payload && typeof payload === 'object') {
      const { requiresConfirmation: _requiresConfirmation, proposedTransactions: _proposedTransactions, ...rest } = payload as any;
      return [rest];
    }

    return [];
  };

  const onConfirm = async (selectedItems?: any[]) => {
    if (!requiresConfirmation || status === 'confirming' || status === 'confirmed') {
      return;
    }

    await onConfirmVisualization(selectedItems ?? buildConfirmPayload());
  };

  const onCancel = () => {
    if (!requiresConfirmation || status === "confirmed") return;
    onCancelVisualization();
  };

  const renderers: Record<string, ReactNode> = {
    transaction: (
      <TransactionVisualization
        visualization={visualization}
        status={status}
        onConfirm={() => onConfirm()}
        onCancel={onCancel}
        requiresConfirmation={requiresConfirmation}
      />
    ),
    transaction_diff: (
      <TransactionDiffVisualization
        visualization={visualization}
        status={status}
        onConfirm={(payload) => onConfirm(payload)}
        onCancel={onCancel}
        requiresConfirmation={requiresConfirmation}
      />
    ),
    chart_line: (
      <LineChartVisualization
        visualization={visualization}
        status={status}
        onConfirm={() => onConfirm()}
        onCancel={onCancel}
        requiresConfirmation={requiresConfirmation}
      />
    ),
    chart_donut: (
      <DonutChartVisualization
        visualization={visualization}
        status={status}
        onConfirm={() => onConfirm()}
        onCancel={onCancel}
        requiresConfirmation={requiresConfirmation}
      />
    ),
    transaction_details: (
      <TransactionDetailsVisualization
        visualization={visualization}
        status={status}
        onConfirm={() => onConfirm()}
        onCancel={onCancel}
        requiresConfirmation={requiresConfirmation}
      />
    ),
    single_transaction_summary: (
      <SingleTransactionSummaryVisualization
        visualization={visualization}
        status={status}
        onConfirm={() => onConfirm()}
        onCancel={onCancel}
        requiresConfirmation={requiresConfirmation}
      />
    ),
    confirmation_list: (
      <ConfirmationListVisualization
        visualization={visualization}
        status={status}
        onConfirm={(selectedItems) => onConfirm(selectedItems)}
        onCancel={onCancel}
        requiresConfirmation={requiresConfirmation}
      />
    ),
    vault_ai_action: (
      <VaultActionSummaryVisualization
        visualization={visualization}
        status={status}
        onConfirm={() => onConfirm()}
        onCancel={onCancel}
        requiresConfirmation={requiresConfirmation}
      />
    ),
    summary: (
      <SummaryVisualization
        visualization={visualization}
        status={status}
        onConfirm={() => onConfirm()}
        onCancel={onCancel}
        requiresConfirmation={requiresConfirmation}
      />
    ),
  };

  const rendererKey =
    visualization.type === 'table_summary' && visualization.toolName === 'get_transaction_details' && Array.isArray((payload as any).items)
      ? 'transaction_details'
      : visualization.type === 'table_summary' && visualization.toolName === 'vault_ai_action'
        ? 'vault_ai_action'
        : visualization.type === 'table_summary' && requiresConfirmation && Array.isArray((payload as any).items)
          ? 'confirmation_list'
          : visualization.type === 'table_summary' && payload && typeof payload === 'object' && 'description' in visualization.payload && 'amount' in visualization.payload
            ? 'single_transaction_summary'
            : visualization.type;

  return renderers[rendererKey] ?? renderers.summary;
}
