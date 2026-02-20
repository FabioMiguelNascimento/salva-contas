"use client"

import { CreditCardSelect } from "@/components/credit-card-select"
import { DatePicker } from "@/components/date-picker"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export type TransactionDetailsProps = {
  isScheduled: boolean
  onIsScheduledChange: (value: boolean) => void
  date?: Date | undefined
  onDateChange: (date?: Date) => void
  creditCardId?: string | null
  onCreditCardChange: (id: string | null) => void
  className?: string
}

export function TransactionDetails({
  isScheduled,
  onIsScheduledChange,
  date,
  onDateChange,
  creditCardId,
  onCreditCardChange,
  className,
}: TransactionDetailsProps) {
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

        <div className="space-y-2">
          <Label>Cartão de crédito (opcional)</Label>
          <CreditCardSelect value={creditCardId ?? null} onValueChange={onCreditCardChange} placeholder="Nenhum" />
          <p className="text-xs text-muted-foreground">Se for uma compra no cartão, selecione para vincular automaticamente.</p>
        </div>
      </div>
    </div>
  )
}

export default TransactionDetails
