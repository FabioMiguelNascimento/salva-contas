"use client";

import { CategorySelect } from "@/components/category-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { TransactionStatus, TransactionType } from "@/types/finance";

type ManualTransactionTabProps = {
  manualDescription: string;
  onManualDescriptionChange: (value: string) => void;
  manualAmount: string;
  onManualAmountChange: (value: string) => void;
  manualCategoryId: string | null;
  onManualCategoryIdChange: (value: string | null) => void;
  manualType: TransactionType;
  onManualTypeChange: (value: TransactionType) => void;
  manualStatus: TransactionStatus;
  onManualStatusChange: (value: TransactionStatus) => void;
};

export function ManualTransactionTab({
  manualDescription,
  onManualDescriptionChange,
  manualAmount,
  onManualAmountChange,
  manualCategoryId,
  onManualCategoryIdChange,
  manualType,
  onManualTypeChange,
  manualStatus,
  onManualStatusChange,
}: ManualTransactionTabProps) {
  return (
    <TabsContent value="manual" className="mt-4 flex flex-col gap-3">
      <div className="space-y-3">
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="space-y-1 sm:col-span-3">
            <Label htmlFor="manual-description" className="text-xs uppercase tracking-wider text-muted-foreground">
              Descrição
            </Label>
            <Input
              id="manual-description"
              value={manualDescription}
              onChange={(e) => onManualDescriptionChange(e.target.value)}
              placeholder="Ex.: Mercado da semana"
              className="rounded-sm"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="manual-amount" className="text-xs uppercase tracking-wider text-muted-foreground">
              Valor
            </Label>
            <Input
              id="manual-amount"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={manualAmount}
              onChange={(e) => onManualAmountChange(e.target.value)}
              placeholder="0,00"
              className="rounded-sm"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="manual-category" className="text-xs uppercase tracking-wider text-muted-foreground">
              Categoria
            </Label>
            <div className="w-full">
              <CategorySelect
                value={manualCategoryId}
                onValueChange={onManualCategoryIdChange}
                placeholder="Selecione a categoria"
              />
            </div>
          </div>

          <div className="space-y-1 sm:col-span-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Tipo</Label>
                <div className="mt-1 inline-flex rounded-md border border-muted bg-white p-1">
                  <Button
                    type="button"
                    variant={manualType === "expense" ? "default" : "ghost"}
                    className={cn(
                      "text-xs rounded-sm px-2 py-1",
                      manualType === "expense"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground"
                    )}
                    onClick={() => onManualTypeChange("expense")}
                  >
                    Despesa
                  </Button>
                  <Button
                    type="button"
                    variant={manualType === "income" ? "default" : "ghost"}
                    className={cn(
                      "text-xs rounded-sm px-2 py-1",
                      manualType === "income"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground"
                    )}
                    onClick={() => onManualTypeChange("income")}
                  >
                    Receita
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Status</Label>
                <div className="mt-1 inline-flex rounded-md border border-muted bg-white p-1">
                  <Button
                    type="button"
                    variant={manualStatus === "paid" ? "default" : "ghost"}
                    className={cn(
                      "text-xs rounded-sm px-2 py-1",
                      manualStatus === "paid"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground"
                    )}
                    onClick={() => onManualStatusChange("paid")}
                  >
                    Pago
                  </Button>
                  <Button
                    type="button"
                    variant={manualStatus === "pending" ? "default" : "ghost"}
                    className={cn(
                      "text-xs rounded-sm px-2 py-1",
                      manualStatus === "pending"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground"
                    )}
                    onClick={() => onManualStatusChange("pending")}
                  >
                    Pendente
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TabsContent>
  );
}

