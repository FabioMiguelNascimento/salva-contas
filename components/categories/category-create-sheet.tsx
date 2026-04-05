"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { IconPicker } from "@/components/categories/icon-picker";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { X } from "lucide-react";

const categoryFormSchema = z.object({
  name: z.string().trim().min(1, "Informe um nome").max(80, "M\u00e1ximo 80 caracteres"),
  icon: z.string().trim().max(64).optional(),
});

type CategoryFormInput = z.input<typeof categoryFormSchema>;
type CategoryFormValues = z.output<typeof categoryFormSchema>;

interface CategoryCreateSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (payload: { name: string; icon?: string }) => Promise<void>;
}

export function CategoryCreateSheet({ open, onOpenChange, onCreate }: CategoryCreateSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
  } = useForm<CategoryFormInput, unknown, CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: { name: "", icon: "" },
  });

  useEffect(() => {
    if (!open) {
      reset({ name: "", icon: "" });
    }
  }, [open, reset]);

  const selectedIcon = watch("icon") || "tag";

  const submit = handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      await onCreate({ name: values.name, icon: values.icon || undefined });
      onOpenChange(false);
    } catch (error) {
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex min-h-0 flex-col" showCloseButton={false}>
        <SheetHeader className="gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <SheetTitle>Nova categoria</SheetTitle>
              <SheetDescription>Crie uma categoria para organizar suas transações.</SheetDescription>
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="button" variant="outline" size="icon-sm" aria-label="Fechar" onClick={() => onOpenChange(false)}>
                    <X data-icon="inline-start" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Fechar</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </SheetHeader>

        <form id="category-create-form" onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <SheetBody className="flex min-h-0 flex-1 flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="category-create-name">Nome</Label>
              <div className="flex items-center gap-2">
                <IconPicker value={selectedIcon} onChange={(icon) => setValue("icon", icon, { shouldDirty: true })} />
                <Input
                  id="category-create-name"
                  autoFocus
                  placeholder="Ex: Alimentação"
                  disabled={isSubmitting}
                  className="flex-1"
                  {...register("name")}
                />
              </div>
            </div>
          </SheetBody>

          <SheetFooter className="flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Criando..." : "Criar"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
