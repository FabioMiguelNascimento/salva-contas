"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { DynamicIcon } from "@/components/dynamic-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Sheet,
    SheetBody,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { CreateVaultPayload, UpdateVaultPayload, Vault } from "@/types/finance";

const DEFAULT_COLOR = "#10b981";

const VAULT_COLORS = [
  "#10b981",
  "#22c55e",
  "#14b8a6",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
  "#ef4444",
  "#f97316",
  "#eab308",
];

const VAULT_ICONS = [
  "piggy-bank",
  "target",
  "wallet",
  "shield",
  "briefcase",
  "car",
  "plane",
  "home",
  "heart-pulse",
  "graduation-cap",
  "gift",
  "dumbbell",
  "stethoscope",
  "luggage",
  "sun",
  "moon",
  "rocket",
  "landmark",
  "coins",
  "banknote",
  "chart-column",
  "trending-up",
];

const vaultFormSchema = z.object({
  name: z.string().trim().min(1, "Informe um nome").max(80, "Nome deve ter no máximo 80 caracteres"),
  targetAmount: z.preprocess(
    (value) => {
      if (value === "" || value == null) {
        return undefined;
      }

      if (typeof value === "string") {
        return Number(value.replace(",", "."));
      }

      return value;
    },
    z
      .union([
        z.undefined(),
        z
          .number({ message: "Informe um valor numérico válido" })
          .refine((num) => Number.isFinite(num), {
            message: "Informe um valor numérico válido",
          })
          .positive("Meta deve ser maior que zero"),
      ]),
  ).optional(),
  color: z.string().trim().max(32).optional(),
  icon: z.string().trim().max(64).optional(),
});

type VaultFormInput = z.input<typeof vaultFormSchema>;
type VaultFormValues = z.output<typeof vaultFormSchema>;

interface VaultFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vault?: Vault | null;
  onCreate: (payload: CreateVaultPayload) => Promise<void>;
  onUpdate: (id: string, payload: UpdateVaultPayload) => Promise<void>;
}

export function VaultFormDialog({
  open,
  onOpenChange,
  vault,
  onCreate,
  onUpdate,
}: VaultFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<VaultFormInput, unknown, VaultFormValues>({
    resolver: zodResolver(vaultFormSchema),
    defaultValues: {
      name: "",
      targetAmount: undefined,
      color: "",
      icon: "",
    },
  });

  useEffect(() => {
    if (!open) {
      reset({
        name: "",
        targetAmount: undefined,
        color: "",
        icon: "",
      });
      return;
    }

    if (vault) {
      reset({
        name: vault.name,
        targetAmount: vault.targetAmount ?? undefined,
        color: vault.color ?? "",
        icon: vault.icon ?? "",
      });
    }
  }, [open, reset, vault]);

  const selectedColor = watch("color") || DEFAULT_COLOR;
  const selectedIcon = watch("icon") || "piggy-bank";

  const submit = handleSubmit(async (values) => {
    const normalizedTargetAmount =
      values.targetAmount == null || Number.isNaN(values.targetAmount)
        ? undefined
        : Number(values.targetAmount);

    if (vault) {
      await onUpdate(vault.id, {
        name: values.name,
        targetAmount: normalizedTargetAmount ?? null,
        color: values.color || null,
        icon: values.icon || null,
      });
    } else {
      await onCreate({
        name: values.name,
        targetAmount: normalizedTargetAmount,
        color: values.color || undefined,
        icon: values.icon || undefined,
      });
    }

    onOpenChange(false);
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{vault ? "Editar cofrinho" : "Novo cofrinho"}</SheetTitle>
          <SheetDescription>
            {vault
              ? "Atualize nome, meta e visual do objetivo."
              : "Crie um objetivo financeiro para separar dinheiro do saldo principal."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={submit} className="flex h-full flex-col">
          <input type="hidden" {...register("color")} />
          <input type="hidden" {...register("icon")} />

          <SheetBody className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="vault-name">Nome</Label>
              <InputGroup>
                <InputGroupAddon align="inline-start" className="pl-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <InputGroupButton
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="rounded-md"
                        aria-label="Selecionar ícone e cor"
                      >
                        <span
                          className="flex size-7 items-center justify-center rounded-md border bg-background"
                          style={{ backgroundColor: selectedColor }}
                        >
                          <DynamicIcon name={selectedIcon} className="text-foreground" />
                        </span>
                      </InputGroupButton>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 p-4" align="start" sideOffset={8} collisionPadding={12}>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">Cor</p>
                          <div className="grid grid-cols-6 gap-2">
                            {VAULT_COLORS.map((color) => (
                              <button
                                key={color}
                                type="button"
                                className={cn(
                                  "flex size-8 items-center justify-center rounded-md border transition-colors hover:bg-muted",
                                  selectedColor === color && "border-foreground",
                                )}
                                style={{ backgroundColor: color }}
                                aria-label={`Selecionar cor ${color}`}
                                onClick={() => setValue("color", color, { shouldDirty: true })}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">Ícone</p>
                          <div className="grid grid-cols-6 gap-2.5">
                            {VAULT_ICONS.map((iconName) => (
                              <button
                                key={iconName}
                                type="button"
                                className={cn(
                                  "flex size-10 items-center justify-center rounded-md border bg-background transition-colors hover:bg-muted",
                                  selectedIcon === iconName && "border-foreground",
                                )}
                                aria-label={`Selecionar ícone ${iconName}`}
                                onClick={() => setValue("icon", iconName, { shouldDirty: true })}
                              >
                                <DynamicIcon name={iconName} />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </InputGroupAddon>
                <InputGroupInput id="vault-name" placeholder="Reserva de emergência" {...register("name")} />
              </InputGroup>
              {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="vault-target">Meta (opcional)</Label>
              <Input id="vault-target" type="number" min="0" step="0.01" placeholder="0,00" {...register("targetAmount")} />
              {errors.targetAmount ? <p className="text-sm text-destructive">{errors.targetAmount.message as string}</p> : null}
            </div>
          </SheetBody>

          <SheetFooter className="flex-row gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {vault ? "Salvar" : "Criar"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
