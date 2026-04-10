"use client"

import { CreditCardSelect } from "@/components/credit-card-select"
import { DatePicker } from "@/components/date-picker"
import { DebitCardSelect } from "@/components/debit-card-select"
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
  creditCardId?: string | null
  onCreditCardChange: (id: string | null) => void
  debitCardId?: string | null
  onDebitCardChange: (id: string | null) => void
  paymentMethod?: PaymentMethod
  onPaymentMethodChange: (method: PaymentMethod) => void
  isSplitMode: boolean
  onSplitModeChange: (v: boolean) => void
  splits: SplitRow[]
  onSplitsChange: (splits: SplitRow[]) => void
  totalAmount: number
  className?: string
}

export function TransactionsDetails({
  isScheduled,
  onIsScheduledChange,
  date,
  onDateChange,
  creditCardId,
  onCreditCardChange,
  debitCardId,
  onDebitCardChange,
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
      const initialSplit: SplitRow = {
        amount: totalAmount || 0,
        paymentMethod,
        creditCardId: paymentMethod === "credit_card" ? (creditCardId ?? null) : null,
        debitCardId: paymentMethod === "debit" ? (debitCardId ?? null) : null,
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
      <div className="space-y-5">
        
        <h4 className="text-base font-semibold">Detalhes do lançamento</h4>

        <label className="flex flex-row items-center gap-3 rounded-lg border bg-muted/40 p-3 cursor-pointer hover:bg-muted/60 transition-colors">
          <Checkbox id="schedule" checked={isScheduled} onCheckedChange={(value) => onIsScheduledChange(Boolean(value))} />
          <span className="text-sm font-medium leading-none">É uma conta a pagar ou agendamento?</span>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>{isScheduled ? "Data de vencimento" : "Data da compra"}</Label>
            <DatePicker
              date={date}
              onChange={onDateChange}
              placeholder={isScheduled ? "Quando vence?" : "Quando aconteceu?"}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <div className="flex items-center justify-between">
              <Label>Forma de pagamento</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-muted-foreground"
                onClick={toggleSplitMode}
              >
                <SplitSquareHorizontal className="mr-1.5 h-3.5 w-3.5" />
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
              <div className="grid gap-4 sm:grid-cols-2">
                <div className={paymentMethod === "credit_card" || paymentMethod === "debit" ? "sm:col-span-1" : "sm:col-span-2"}>
                  <Select value={paymentMethod} onValueChange={(v) => onPaymentMethodChange(v as PaymentMethod)}>
                    <SelectTrigger className="w-full">
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

                {(paymentMethod === "credit_card" || paymentMethod === "debit") && (
                  <div className="sm:col-span-1">
                    {paymentMethod === "credit_card" ? (
                      <CreditCardSelect
                        value={creditCardId ?? null}
                        onValueChange={onCreditCardChange}
                        placeholder="Selecione o cartão"
                        allowClear
                      />
                    ) : (
                      <DebitCardSelect
                        value={debitCardId ?? null}
                        onValueChange={onDebitCardChange}
                        placeholder="Cartão de débito"
                        allowClear
                      />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TransactionsDetails