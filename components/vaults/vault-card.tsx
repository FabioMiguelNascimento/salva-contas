"use client";

import { DynamicIcon } from "@/components/dynamic-icon";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/currency-utils";
import type { Vault } from "@/types/finance";

interface VaultCardProps {
  vault: Vault;
  onEdit: () => void;
}

export function VaultCard({
  vault,
  onEdit,
}: VaultCardProps) {
  const progress =
    vault.targetAmount && vault.targetAmount > 0
      ? Math.min((vault.currentAmount / vault.targetAmount) * 100, 100)
      : null;

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onEdit}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onEdit();
        }
      }}
      className="cursor-pointer"
    >
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="text-base">{vault.name}</CardTitle>
          <CardDescription>
            Saldo atual: {formatCurrency(vault.currentAmount)}
          </CardDescription>
        </div>
        <div
          className="flex size-10 items-center justify-center rounded-lg border"
          style={{ backgroundColor: vault.color || undefined }}
        >
          <DynamicIcon name={vault.icon || "target"} className="h-5 w-5 text-foreground" />
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {progress !== null ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Meta: {formatCurrency(vault.targetAmount ?? 0)}</span>
              <span>{progress.toFixed(0)}%</span>
            </div>
            <Progress value={progress} />
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Sem meta definida para este cofrinho.</p>
        )}

      </CardContent>
    </Card>
  );
}
