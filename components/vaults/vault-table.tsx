"use client";

import { DynamicIcon } from "@/components/dynamic-icon";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { Vault } from "@/types/finance";
import {
    HandCoins,
    Landmark,
    MoreHorizontal,
    Pencil,
    Trash2,
    TrendingUp
} from "lucide-react";

interface VaultTableProps {
  vaults: Vault[];
  onDeposit: (vault: Vault) => void;
  onWithdraw: (vault: Vault) => void;
  onYield: (vault: Vault) => void;
  onEdit: (vault: Vault) => void;
  onDelete: (vault: Vault) => void;
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function VaultTable({
  vaults,
  onDeposit,
  onWithdraw,
  onYield,
  onEdit,
  onDelete,
}: VaultTableProps) {
  return (
    <Table className="min-w-[940px]">
      <TableHeader>
        <TableRow>
          <TableHead>Cofrinho</TableHead>
          <TableHead className="text-right">Saldo atual</TableHead>
          <TableHead className="text-right">Meta</TableHead>
          <TableHead className="w-[200px]">Progresso</TableHead>
          <TableHead className="w-12" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {vaults.map((vault) => {
          const hasTarget = Boolean(vault.targetAmount && vault.targetAmount > 0);
          const percentage = hasTarget
            ? Math.min((vault.currentAmount / (vault.targetAmount ?? 1)) * 100, 100)
            : 0;

          return (
            <TableRow key={vault.id}>
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
                {currencyFormatter.format(vault.currentAmount)}
              </TableCell>

              <TableCell
                className={cn(
                  "text-right",
                  hasTarget ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {hasTarget
                  ? currencyFormatter.format(vault.targetAmount ?? 0)
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

              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Abrir menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onDeposit(vault)}>
                      <Landmark className="mr-2 h-4 w-4" />
                      Guardar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onWithdraw(vault)}>
                      <HandCoins className="mr-2 h-4 w-4" />
                      Resgatar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onYield(vault)}>
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Rendimento
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(vault)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(vault)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
