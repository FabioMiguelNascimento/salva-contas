"use client";

import { DynamicIcon } from "@/components/dynamic-icon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { currencyFormatter } from "@/lib/subscriptions/constants";
import type { Vault } from "@/types/finance";
import { HandCoins, Landmark, TrendingUp } from "lucide-react";

interface VaultCardProps {
  vault: Vault;
  onDeposit: () => void;
  onWithdraw: () => void;
  onYield: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function VaultCard({
  vault,
  onDeposit,
  onWithdraw,
  onYield,
  onEdit,
  onDelete,
}: VaultCardProps) {
  const progress =
    vault.targetAmount && vault.targetAmount > 0
      ? Math.min((vault.currentAmount / vault.targetAmount) * 100, 100)
      : null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="text-base">{vault.name}</CardTitle>
          <CardDescription>
            Saldo atual: {currencyFormatter.format(vault.currentAmount)}
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
              <span>Meta: {currencyFormatter.format(vault.targetAmount ?? 0)}</span>
              <span>{progress.toFixed(0)}%</span>
            </div>
            <Progress value={progress} />
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Sem meta definida para este cofrinho.</p>
        )}

        <div className="grid grid-cols-3 gap-2">
          <Button size="sm" variant="outline" onClick={onDeposit}>
            <Landmark data-icon="inline-start" />
            Guardar
          </Button>
          <Button size="sm" variant="outline" onClick={onWithdraw}>
            <HandCoins data-icon="inline-start" />
            Resgatar
          </Button>
          <Button size="sm" variant="outline" onClick={onYield}>
            <TrendingUp data-icon="inline-start" />
            Rendimento
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" variant="ghost" onClick={onEdit}>Editar</Button>
          <Button size="sm" variant="ghost" onClick={onDelete} className="text-destructive">
            Excluir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
