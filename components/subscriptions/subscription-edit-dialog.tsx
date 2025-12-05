import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SubscriptionEditorHook } from "@/hooks/use-subscription-editor";
import { frequencyOptions, months, weekDays } from "@/lib/subscriptions/constants";
import type { SubscriptionFrequency } from "@/types/finance";
import { Loader2 } from "lucide-react";

interface SubscriptionEditDialogProps {
  editor: SubscriptionEditorHook;
}

export function SubscriptionEditDialog({ editor }: SubscriptionEditDialogProps) {
  const { editing, values, error, isSubmitting, actions } = editor;
  const { setValue, closeEdit, handleEditSubmit } = actions;

  return (
    <Dialog open={!!editing} onOpenChange={(open) => (!open ? closeEdit() : undefined)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar assinatura</DialogTitle>
          <DialogDescription>Ajuste valores ou frequência desta recorrência.</DialogDescription>
        </DialogHeader>
        {editing && (
          <form className="space-y-4" onSubmit={handleEditSubmit}>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input value={values.description} onChange={(event) => setValue("description", event.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Valor</Label>
              <Input value={values.amount} onChange={(event) => setValue("amount", event.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Categoria (ID)</Label>
              <Input value={values.categoryId} onChange={(event) => setValue("categoryId", event.target.value)} required />
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
            <label className="flex items-start gap-3 rounded-xl border border-border/60 p-3">
              <Checkbox checked={values.isActive} onCheckedChange={(checked) => setValue("isActive", Boolean(checked))} />
              <div>
                <p className="font-medium">Assinatura ativa</p>
                <p className="text-sm text-muted-foreground">Inativa não gera novos lançamentos.</p>
              </div>
            </label>
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={closeEdit}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Salvar alterações
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
