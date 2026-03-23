"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const amountSchema = z.object({
  amount: z.coerce.number().refine((value) => Number.isFinite(value), {
    message: "Informe um valor numérico",
  }).positive("Informe um valor maior que zero"),
});

type AmountFormInput = z.input<typeof amountSchema>;
type AmountFormValues = z.output<typeof amountSchema>;

interface VaultAmountSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  submitLabel: string;
  onSubmit: (value: number) => Promise<void>;
}

export function VaultAmountSheet({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  onSubmit,
}: VaultAmountSheetProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AmountFormInput, unknown, AmountFormValues>({
    resolver: zodResolver(amountSchema),
    defaultValues: {
      amount: 0,
    },
  });

  useEffect(() => {
    if (!open) {
      reset({ amount: 0 });
    }
  }, [open, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit(values.amount);
    onOpenChange(false);
    reset({ amount: 0 });
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>

        <form onSubmit={submit} className="flex h-full flex-col">
          <SheetBody className="space-y-4">
            <div className="grid gap-2">
            <Label htmlFor="vault-amount">Valor</Label>
            <Input
              id="vault-amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              {...register("amount")}
            />
            {errors.amount ? (
              <p className="text-sm text-destructive">{errors.amount.message}</p>
            ) : null}
            </div>
          </SheetBody>

          <SheetFooter className="flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {submitLabel}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
