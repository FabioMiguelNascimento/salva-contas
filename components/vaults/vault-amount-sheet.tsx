"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Sheet,
    SheetBody,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle2, X } from "lucide-react";

const amountSchema = z.object({
  amount: z.coerce.number().refine((value) => Number.isFinite(value), {
    message: "Informe um valor numerico",
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
      <SheetContent className="flex flex-col overflow-y-auto" showCloseButton={false}>
        <SheetHeader className="gap-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <SheetTitle>{title}</SheetTitle>
              <SheetDescription>{description}</SheetDescription>
            </div>

            <TooltipProvider>
              <ButtonGroup aria-label="Ações de valor do cofrinho">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button type="button" variant="outline" size="icon-sm" aria-label="Ação de valor do cofrinho" disabled>
                      <CheckCircle2 />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Confirmar</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <SheetClose asChild>
                      <Button type="button" variant="outline" size="icon-sm" aria-label="Fechar">
                        <X />
                      </Button>
                    </SheetClose>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Fechar</TooltipContent>
                </Tooltip>
              </ButtonGroup>
            </TooltipProvider>
          </div>
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
