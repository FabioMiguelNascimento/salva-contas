"use client";

import { CategorySelect } from "@/components/category-select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SubscriptionFormHook } from "@/hooks/use-subscription-form";
import { frequencyOptions, months, weekDays } from "@/lib/subscriptions/constants";
import type { SubscriptionFrequency } from "@/types/finance";
import { Loader2 } from "lucide-react";

interface SubscriptionFormProps {
  form: SubscriptionFormHook;
}

export function SubscriptionForm({ form }: SubscriptionFormProps) {
  const { values, isSubmitting, error, successMessage, actions } = form;
  const { setValue, setFrequency, setIsActive, handleSubmit } = actions;

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Input
          id="description"
          value={values.description}
          onChange={(event) => setValue("description", event.target.value)}
          placeholder="Ex.: Netflix"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="amount">Valor</Label>
        <Input
          id="amount"
          value={values.amount}
          onChange={(event) => setValue("amount", event.target.value)}
          placeholder="120,00"
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Categoria</Label>
        <CategorySelect
          value={values.categoryId}
          onValueChange={(value) => setValue("categoryId", value ?? "")}
          placeholder="Selecione uma categoria"
        />
      </div>
      <div className="space-y-2">
        <Label>Frequência</Label>
        <Select value={values.frequency} onValueChange={(value: SubscriptionFrequency) => setFrequency(value)}>
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
        <Checkbox checked={values.isActive} onCheckedChange={(checked) => setIsActive(Boolean(checked))} />
        <div>
          <p className="font-medium">Ativar assinatura</p>
          <p className="text-sm text-muted-foreground">Desmarque para guardar a regra sem gerar faturas.</p>
        </div>
      </label>
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
      {successMessage && <p className="text-sm font-medium text-emerald-600">{successMessage}</p>}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Cadastrar assinatura
      </Button>
    </form>
  );
}
