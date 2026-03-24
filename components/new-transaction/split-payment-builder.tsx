"use client";

import { CreditCardSelect } from "@/components/credit-card-select";
import { DebitCardSelect } from "@/components/debit-card-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { PAYMENT_METHOD_LABELS, PaymentMethod, TransactionSplit } from "@/types/finance";
import { PlusCircle, Trash2 } from "lucide-react";

export type SplitRow = Omit<TransactionSplit, "id" | "creditCard" | "debitCard">;

interface SplitPaymentBuilderProps {
  splits: SplitRow[];
  totalAmount: number;
  onChange: (splits: SplitRow[]) => void;
}

const PAYMENT_METHODS = Object.entries(PAYMENT_METHOD_LABELS) as [
  PaymentMethod,
  string,
][];

export function SplitPaymentBuilder({
  splits,
  totalAmount,
  onChange,
}: SplitPaymentBuilderProps) {
  const splitTotal = splits.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
  const remaining = Math.round((totalAmount - splitTotal) * 100) / 100;
  const isBalanced = Math.abs(remaining) < 0.01;

  function addRow() {
    const next: SplitRow = {
      amount: remaining > 0 ? remaining : 0,
      paymentMethod: "cash",
      creditCardId: null,
      debitCardId: null,
    };
    onChange([...splits, next]);
  }

  function removeRow(index: number) {
    onChange(splits.filter((_, i) => i !== index));
  }

  function updateRow(index: number, patch: Partial<SplitRow>) {
    onChange(
      splits.map((row, i) => {
        if (i !== index) return row;
        const updated = { ...row, ...patch };
        // Clear creditCardId when method is not credit_card
        if (patch.paymentMethod && patch.paymentMethod !== "credit_card") {
          updated.creditCardId = null;
        }
        if (patch.paymentMethod && patch.paymentMethod !== "debit") {
          updated.debitCardId = null;
        }
        return updated;
      }),
    );
  }

  return (
    <div className="space-y-2">
      {splits.map((split, index) => (
        <div key={index} className="rounded-xl border border-border/50 bg-muted/10 p-2">
          <div className="grid gap-2 sm:grid-cols-[7rem_minmax(0,1fr)_auto] items-start">
            {/* Amount */}
            <div className="min-w-0">
              <Input
                type="number"
                min={0}
                step={0.01}
                placeholder="0,00"
                value={split.amount || ""}
                onChange={(e) =>
                  updateRow(index, { amount: parseFloat(e.target.value) || 0 })
                }
                className="text-sm"
              />
            </div>

            {/* Payment method */}
            <div className="min-w-0">
              <Select
                value={split.paymentMethod}
                onValueChange={(v) =>
                  updateRow(index, { paymentMethod: v as PaymentMethod })
                }
              >
                <SelectTrigger className="text-sm w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Remove button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => removeRow(index)}
              disabled={splits.length <= 1}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {(split.paymentMethod === "credit_card" || split.paymentMethod === "debit") && (
            <div className="mt-2 min-w-0">
              {split.paymentMethod === "credit_card" && (
                <CreditCardSelect
                  value={split.creditCardId ?? null}
                  onValueChange={(v) => updateRow(index, { creditCardId: v })}
                  placeholder="Selecione o cartão"
                  allowClear={false}
                />
              )}
              {split.paymentMethod === "debit" && (
                <DebitCardSelect
                  value={(split as any).debitCardId ?? null}
                  onValueChange={(v) => updateRow(index, { debitCardId: v } as any)}
                  placeholder="Selecione o cartão de débito"
                  allowClear={false}
                />
              )}
            </div>
          )}
        </div>
      ))}

      {/* Balance indicator */}
      <div className="flex items-center justify-between text-xs px-1">
        <span className={isBalanced ? "text-emerald-600" : "text-destructive"}>
          {isBalanced
            ? "✓ Total distribuído corretamente"
            : remaining > 0
              ? `Faltam ${formatCurrency(remaining)} para distribuir`
              : `Excedendo ${formatCurrency(Math.abs(remaining))}`}
        </span>
        <span className="text-muted-foreground">
          {formatCurrency(splitTotal)} / {formatCurrency(totalAmount)}
        </span>
      </div>

      {/* Add row button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full gap-2 text-muted-foreground"
        onClick={addRow}
      >
        <PlusCircle className="h-4 w-4" />
        Adicionar forma de pagamento
      </Button>
    </div>
  );
}
