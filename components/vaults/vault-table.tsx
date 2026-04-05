"use client";

import { DynamicIcon } from "@/components/dynamic-icon";
import { Progress } from "@/components/ui/progress";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/currency-utils";
import { cn } from "@/lib/utils";
import type { Vault } from "@/types/finance";

interface VaultTableProps {
  vaults: Vault[];
  onEdit: (vault: Vault) => void;
}

export function VaultTable({
  vaults,
  onEdit,
}: VaultTableProps) {
  return (
    <Table className="min-w-[940px]">
      <TableHeader>
        <TableRow>
          <TableHead>Cofrinho</TableHead>
          <TableHead className="text-right">Saldo atual</TableHead>
          <TableHead className="text-right">Meta</TableHead>
          <TableHead className="w-[200px]">Progresso</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {vaults.map((vault) => {
          const hasTarget = Boolean(vault.targetAmount && vault.targetAmount > 0);
          const percentage = hasTarget
            ? Math.min((vault.currentAmount / (vault.targetAmount ?? 1)) * 100, 100)
            : 0;

          return (
            <TableRow
              key={vault.id}
              onClick={() => onEdit(vault)}
              className="cursor-pointer hover:bg-muted/30"
            >
              <TableCell>
                <div className="flex items-center gap-2">
                  <span
                    className="flex size-7 items-center justify-center rounded-md border"
                    style={{ backgroundColor: vault.color || undefined }}
                  >
                    <DynamicIcon name={vault.icon || "target"} className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-medium text-foreground">{vault.name}</span>
                </div>
              </TableCell>

              <TableCell className="text-right font-medium">
                {formatCurrency(vault.currentAmount)}
              </TableCell>

              <TableCell
                className={cn(
                  "text-right",
                  hasTarget ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {hasTarget
                  ? formatCurrency(vault.targetAmount ?? 0)
                  : "-"}
              </TableCell>

              <TableCell>
                {hasTarget ? (
                  <div className="flex items-center gap-2">
                    <Progress value={percentage} className="h-2 flex-1" />
                    <span className="w-10 text-right text-xs text-muted-foreground">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">Sem meta definida</span>
                )}
              </TableCell>

            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
