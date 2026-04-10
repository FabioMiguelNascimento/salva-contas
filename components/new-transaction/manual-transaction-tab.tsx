"use client"

import { CategorySelect } from "@/components/category-select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TabsContent } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { TransactionStatus, TransactionType } from "@/types/finance"

type ManualTransactionTabProps = {
  manualDescription: string
  onManualDescriptionChange: (value: string) => void
  manualAmount: string
  manualInstallments: string
  onManualInstallmentsChange: (value: string) => void
  onManualAmountChange: (value: string) => void
  manualCategoryId: string | null
  onManualCategoryIdChange: (value: string | null) => void
  manualType: TransactionType
  onManualTypeChange: (value: TransactionType) => void
  manualStatus: TransactionStatus
  onManualStatusChange: (value: TransactionStatus) => void
}

const toggleItemClass =
  "flex-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"

export function ManualTransactionTab({
  manualDescription,
  onManualDescriptionChange,
  manualAmount,
  onManualAmountChange,
  manualInstallments,
  onManualInstallmentsChange,
  manualCategoryId,
  onManualCategoryIdChange,
  manualType,
  onManualTypeChange,
  manualStatus,
  onManualStatusChange,
}: ManualTransactionTabProps) {
  return (
    <TabsContent value="manual" className="mt-4 flex flex-col gap-3">
      <div className="grid gap-4 sm:grid-cols-2">

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="manual-description">Descrição</Label>
          <Input
            id="manual-description"
            value={manualDescription}
            onChange={(e) => onManualDescriptionChange(e.target.value)}
            placeholder="Ex.: Mercado da semana"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="manual-amount">Valor</Label>
          <Input
            id="manual-amount"
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            value={manualAmount}
            onChange={(e) => onManualAmountChange(e.target.value)}
            placeholder="0,00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="manual-installments">Parcelas (opcional)</Label>
          <Input
            id="manual-installments"
            type="number"
            min={1}
            value={manualInstallments}
            onChange={(e) => onManualInstallmentsChange(e.target.value)}
            placeholder="1"
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label>Categoria</Label>
          <CategorySelect
            value={manualCategoryId}
            onValueChange={onManualCategoryIdChange}
            placeholder="Selecione a categoria"
          />
        </div>

        <div className="space-y-2">
          <Label>Tipo</Label>
          <ToggleGroup
            type="single"
            value={manualType}
            onValueChange={(v) => v && onManualTypeChange(v as TransactionType)}
            className="w-full"
          >
            <ToggleGroupItem value="expense" className={toggleItemClass}>Despesa</ToggleGroupItem>
            <ToggleGroupItem value="income" className={toggleItemClass}>Receita</ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <ToggleGroup
            type="single"
            value={manualStatus}
            onValueChange={(v) => v && onManualStatusChange(v as TransactionStatus)}
            className="w-full"
          >
            <ToggleGroupItem value="paid" className={toggleItemClass}>Pago</ToggleGroupItem>
            <ToggleGroupItem value="pending" className={toggleItemClass}>Pendente</ToggleGroupItem>
          </ToggleGroup>
        </div>

      </div>
    </TabsContent>
  )
}