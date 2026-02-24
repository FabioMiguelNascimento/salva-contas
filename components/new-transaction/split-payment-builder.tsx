"use client";

import { CreditCardSelect } from "@/components/credit-card-select";
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

export type SplitRow = Omit<TransactionSplit, "id" | "creditCard">;

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
        return updated;
      }),
    );
  }

  return (
    <div className="space-y-2">
      {splits.map((split, index) => (
        <div key={index} className="flex items-start gap-2">
          {/* Amount */}
          <div className="w-28 shrink-0">
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
          <div className="flex-1 min-w-0">
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

          {/* Credit card picker (only for credit_card method) */}
          {split.paymentMethod === "credit_card" && (
            <div className="flex-1 min-w-0">
              <CreditCardSelect
                value={split.creditCardId ?? null}
                onValueChange={(v) => updateRow(index, { creditCardId: v })}
                placeholder="Selecione o cartão"
                allowClear={false}
              />
            </div>
          )}

          {/* Remove button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 text-muted-foreground hover:text-destructive"
            onClick={() => removeRow(index)}
            disabled={splits.length <= 1}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
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
