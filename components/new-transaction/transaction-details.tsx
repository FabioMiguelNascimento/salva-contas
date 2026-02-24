"use client"

import { CreditCardSelect } from "@/components/credit-card-select"
import { DatePicker } from "@/components/date-picker"
import { SplitPaymentBuilder, SplitRow } from "@/components/new-transaction/split-payment-builder"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PAYMENT_METHOD_LABELS, PaymentMethod } from "@/types/finance"
import { SplitSquareHorizontal } from "lucide-react"

const PAYMENT_METHODS = Object.entries(PAYMENT_METHOD_LABELS) as [PaymentMethod, string][]

export type TransactionDetailsProps = {
  isScheduled: boolean
  onIsScheduledChange: (value: boolean) => void
  date?: Date | undefined
  onDateChange: (date?: Date) => void
  // Simple (no-split) mode
  creditCardId?: string | null
  onCreditCardChange: (id: string | null) => void
  paymentMethod?: PaymentMethod
  onPaymentMethodChange: (method: PaymentMethod) => void
  // Split mode
  isSplitMode: boolean
  onSplitModeChange: (v: boolean) => void
  splits: SplitRow[]
  onSplitsChange: (splits: SplitRow[]) => void
  totalAmount: number
  className?: string
}

export function TransactionDetails({
  isScheduled,
  onIsScheduledChange,
  date,
  onDateChange,
  creditCardId,
  onCreditCardChange,
  paymentMethod = "cash",
  onPaymentMethodChange,
  isSplitMode,
  onSplitModeChange,
  splits,
  onSplitsChange,
  totalAmount,
  className,
}: TransactionDetailsProps) {

  function toggleSplitMode() {
    if (!isSplitMode) {
      // Enter split mode — pre-populate with one row for the current selection
      const initialSplit: SplitRow = {
        amount: totalAmount || 0,
        paymentMethod: paymentMethod === "credit_card" ? "credit_card" : paymentMethod,
        creditCardId: paymentMethod === "credit_card" ? (creditCardId ?? null) : null,
      }
      onSplitsChange([initialSplit])
      onSplitModeChange(true)
    } else {
      onSplitsChange([])
      onSplitModeChange(false)
    }
  }

  return (
    <div className={className}>
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Detalhes do lançamento</Label>

        <label className="flex items-center gap-2 rounded-xl border border-border/60 p-4 cursor-pointer">
          <Checkbox id="schedule" checked={isScheduled} onCheckedChange={(value) => onIsScheduledChange(Boolean(value))} />
          <div className="space-y-0.5">
            <div className="font-medium">É uma conta a pagar/agendamento?</div>
            <p className="text-xs text-muted-foreground">
              Se marcado, definimos data de vencimento. Caso contrário, consideramos como compra já realizada.
            </p>
          </div>
        </label>

        <div className="grid gap-3 sm:grid-cols-1">
          <div className="space-y-2">
            <Label>{isScheduled ? "Data de vencimento" : "Data da compra"}</Label>
            <DatePicker date={date} onChange={onDateChange} placeholder={isScheduled ? "Quando vence?" : "Quando aconteceu?"} />
          </div>
        </div>

        {/* Payment section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Forma de pagamento</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 text-xs text-muted-foreground"
              onClick={toggleSplitMode}
            >
              <SplitSquareHorizontal className="h-3.5 w-3.5" />
              {isSplitMode ? "Pagamento único" : "Dividir pagamento"}
            </Button>
          </div>

          {isSplitMode ? (
            <SplitPaymentBuilder
              splits={splits}
              totalAmount={totalAmount}
              onChange={onSplitsChange}
            />
          ) : (
            <div className="space-y-2">
              <Select value={paymentMethod} onValueChange={(v) => onPaymentMethodChange(v as PaymentMethod)}>
                <SelectTrigger>
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

              {paymentMethod === "credit_card" && (
                <CreditCardSelect
                  value={creditCardId ?? null}
                  onValueChange={onCreditCardChange}
                  placeholder="Selecione o cartão"
                  allowClear
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TransactionDetails
