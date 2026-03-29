"use client";

import { Progress } from "@/components/ui/progress";
import { useUsage } from "@/hooks/use-usage";
import { BrainCircuit, ReceiptText } from "lucide-react";

export function UsageMeter() {
  const { usageData, isLoading } = useUsage();

  if (isLoading && !usageData) {
    return (
      <div className="space-y-4 p-4 rounded-xl border border-border bg-card/50">
        <div className="h-4 w-24 bg-muted animate-pulse rounded" />
        <div className="h-2 w-full bg-muted animate-pulse rounded" />
      </div>
    );
  }

  if (!usageData) return null;

  const { usage, limits, period } = usageData;

  // Se for FREE, não mostra o medidor de IA (pois os limites são 0)
  if (limits.aiInteractions === 0 && limits.receipts === 0) {
    return null;
  }

  const aiPercent = (usage.aiInteractions / limits.aiInteractions) * 100;
  const receiptsPercent = (usage.receipts / limits.receipts) * 100;

  return (
    <div className="space-y-6 p-5 rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground">Uso de IA no Mês</h4>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          Ciclo {period.month}/{period.year}
        </span>
      </div>

      <div className="space-y-4">
        {/* Chat IA */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <BrainCircuit className="h-3.5 w-3.5 text-primary" />
              <span>Consultor Boletinho</span>
            </div>
            <span className="font-medium">
              {usage.aiInteractions} / {limits.aiInteractions}
            </span>
          </div>
          <Progress value={aiPercent} className="h-1.5" />
        </div>

        {/* Recibos */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ReceiptText className="h-3.5 w-3.5 text-primary" />
              <span>Leitura de Recibos</span>
            </div>
            <span className="font-medium">
              {usage.receipts} / {limits.receipts}
            </span>
          </div>
          <Progress value={receiptsPercent} className="h-1.5" />
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground leading-relaxed">
        Suas cotas são resetadas automaticamente no primeiro dia de cada mês.
      </p>
    </div>
  );
}
