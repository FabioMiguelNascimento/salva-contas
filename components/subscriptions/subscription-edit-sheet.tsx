import { CategorySelect } from "@/components/category-select";
import { CreditCardSelect } from "@/components/credit-card-select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { SubscriptionEditorHook } from "@/hooks/use-subscription-editor";
import { frequencyOptions, months, weekDays } from "@/lib/subscriptions/constants";
import type { SubscriptionFrequency } from "@/types/finance";
import { Loader2 } from "lucide-react";

interface SubscriptionEditSheetProps {
  editor: SubscriptionEditorHook;
}

export function SubscriptionEditSheet({ editor }: SubscriptionEditSheetProps) {
  const { editing, values, error, isSubmitting, actions } = editor;
  const { setValue, closeEdit, handleEditSubmit } = actions;

  return (
    <Sheet open={!!editing} onOpenChange={(open) => (!open ? closeEdit() : undefined)}>
      <SheetContent className="flex flex-col overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Editar assinatura</SheetTitle>
          <SheetDescription>Ajuste valores ou frequência desta recorrência.</SheetDescription>
        </SheetHeader>
        {editing && (
          <form className="flex flex-1 flex-col" onSubmit={handleEditSubmit}>
            <SheetBody className="space-y-4">
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input value={values.description} onChange={(event) => setValue("description", event.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Valor</Label>
                <Input value={values.amount} onChange={(event) => setValue("amount", event.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <CategorySelect
                  value={values.categoryId}
                  onValueChange={(value) => setValue("categoryId", value ?? "")}
                />
              </div>
              <div className="space-y-2">
                <Label>Cartão de crédito</Label>
                <CreditCardSelect
                  value={values.creditCardId}
                  onValueChange={(value) => setValue("creditCardId", value)}
                  placeholder="Nenhum (opcional)"
                />
              </div>
              <div className="space-y-2">
                <Label>Frequência</Label>
                <Select value={values.frequency} onValueChange={(value: SubscriptionFrequency) => setValue("frequency", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencyOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {(values.frequency === "monthly" || values.frequency === "yearly") && (
                <div className="space-y-2">
                  <Label>Dia do mês</Label>
                  <Input
                    type="number"
                    min={1}
                    max={31}
                    value={values.dayOfMonth}
                    onChange={(event) => setValue("dayOfMonth", Number(event.target.value))}
                  />
                </div>
              )}
              {values.frequency === "weekly" && (
                <div className="space-y-2">
                  <Label>Dia da semana</Label>
                  <Select value={String(values.dayOfWeek)} onValueChange={(value) => setValue("dayOfWeek", Number(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {weekDays.map((day) => (
                        <SelectItem key={day.value} value={String(day.value)}>
                          {day.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {values.frequency === "yearly" && (
                <div className="space-y-2">
                  <Label>Mês</Label>
                  <Select value={String(values.month)} onValueChange={(value) => setValue("month", Number(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month.value} value={String(month.value)}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="active-edit"
                  checked={values.isActive}
                  onCheckedChange={(checked) => setValue("isActive", Boolean(checked))}
                />
                <Label htmlFor="active-edit" className="cursor-pointer">
                  Assinatura ativa
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Inativa não gera novos lançamentos.
              </p>
              {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            </SheetBody>
            <SheetFooter className="flex-row gap-2">
              <Button type="button" variant="outline" onClick={closeEdit} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar
              </Button>
            </SheetFooter>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
