"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { DynamicIcon } from "@/components/dynamic-icon";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { cn, formatCurrency } from "@/lib/utils";
import { fetchVaultHistory } from "@/services/vaults";
import type {
    CreateVaultPayload,
    UpdateVaultPayload,
    Vault,
    VaultHistoryEvent,
    VaultHistoryGroup,
    VaultHistoryResponse,
} from "@/types/finance";
import { HandCoins, Landmark, Pencil, Trash2, TrendingUp, X } from "lucide-react";

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
  name: z.string().trim().min(1, "Informe um nome").max(80, "Nome deve ter no maximo 80 caracteres"),
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
          .number({ message: "Informe um valor numerico valido" })
          .refine((num) => Number.isFinite(num), {
            message: "Informe um valor numerico valido",
          })
          .positive("Meta deve ser maior que zero"),
      ]),
  ).optional(),
  color: z.string().trim().max(32).optional(),
  icon: z.string().trim().max(64).optional(),
});

type VaultFormInput = z.input<typeof vaultFormSchema>;
type VaultFormValues = z.output<typeof vaultFormSchema>;

interface VaultFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vault?: Vault | null;
  onCreate: (payload: CreateVaultPayload) => Promise<void>;
  onUpdate: (id: string, payload: UpdateVaultPayload) => Promise<void>;
  onRequestDelete?: (vault: Vault) => void | Promise<void>;
  onOpenAmountAction?: (type: "deposit" | "withdraw" | "yield", vault: Vault) => void;
}

function mergeHistoryGroups(
  current: VaultHistoryGroup[],
  incoming: VaultHistoryGroup[],
): VaultHistoryGroup[] {
  const next = [...current];

  for (const group of incoming) {
    const existingIndex = next.findIndex((item) => item.date === group.date);

    if (existingIndex === -1) {
      next.push(group);
      continue;
    }

    next[existingIndex] = {
      ...next[existingIndex],
      items: [...next[existingIndex].items, ...group.items],
    };
  }

  return next;
}

function getHistoryEventLabel(type: VaultHistoryEvent["type"]): string {
  if (type === "deposit") return "Guardar";
  if (type === "withdraw") return "Resgatar";
  return "Rendimento";
}

function getHistoryEventAmountClass(type: VaultHistoryEvent["type"]): string {
  if (type === "withdraw") return "text-destructive";
  return "text-emerald-600";
}

function getHistoryGroupLabel(dateValue: string): string {
  const date = new Date(`${dateValue}T00:00:00`);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (isSameDay(date, today)) return "HOJE";
  if (isSameDay(date, yesterday)) return "ONTEM";

  return date
    .toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
    .toUpperCase();
}

function getHistoryEventIcon(type: VaultHistoryEvent["type"]): string {
  if (type === "deposit") return "arrow-down";
  if (type === "withdraw") return "arrow-up";
  return "trending-up";
}

function getHistoryEventBadgeClass(type: VaultHistoryEvent["type"]): string {
  if (type === "withdraw") {
    return "bg-destructive/15 text-destructive border-destructive/20";
  }

  return "bg-emerald-500/15 text-emerald-600 border-emerald-500/20";
}

function getHistoryMonthLabel(monthValue: string): string {
  const [year, month] = monthValue.split("-").map(Number);

  if (!year || !month) {
    return monthValue;
  }

  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function VaultFormSheet({
  open,
  onOpenChange,
  vault,
  onCreate,
  onUpdate,
  onRequestDelete,
  onOpenAmountAction,
}: VaultFormSheetProps) {
  const [history, setHistory] = useState<VaultHistoryResponse | null>(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isLoadingMoreHistory, setIsLoadingMoreHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

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

  useEffect(() => {
    if (!open || !vault?.id) {
      setHistory(null);
      setHistoryError(null);
      return;
    }

    let isCancelled = false;

    const loadHistory = async () => {
      setIsHistoryLoading(true);
      setHistoryError(null);

      try {
        const result = await fetchVaultHistory(vault.id, { limit: 20 });
        if (!isCancelled) {
          setHistory(result);
        }
      } catch (error) {
        if (!isCancelled) {
          setHistoryError(
            error instanceof Error
              ? error.message
              : "Não foi possível carregar o histórico do cofrinho.",
          );
        }
      } finally {
        if (!isCancelled) {
          setIsHistoryLoading(false);
        }
      }
    };

    void loadHistory();

    return () => {
      isCancelled = true;
    };
  }, [open, vault?.id]);

  const loadMoreHistory = async () => {
    if (!vault?.id || !history?.pagination.nextCursor || isLoadingMoreHistory) {
      return;
    }

    setIsLoadingMoreHistory(true);

    try {
      const result = await fetchVaultHistory(vault.id, {
        limit: history.pagination.limit,
        cursor: history.pagination.nextCursor,
      });

      setHistory((prev) => {
        if (!prev) return result;

        return {
          ...prev,
          groups: mergeHistoryGroups(prev.groups, result.groups),
          pagination: result.pagination,
        };
      });
    } catch (error) {
      setHistoryError(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar mais histórico.",
      );
    } finally {
      setIsLoadingMoreHistory(false);
    }
  };

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
      <SheetContent className="flex flex-col overflow-y-auto" showCloseButton={!vault}>
        <SheetHeader className="gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <SheetTitle>{vault ? "Editar cofrinho" : "Novo cofrinho"}</SheetTitle>
              <SheetDescription>
                {vault
                  ? "Atualize nome, meta e visual do objetivo."
                  : "Crie um objetivo financeiro para separar dinheiro do saldo principal."}
              </SheetDescription>
            </div>

            {vault ? (
              <TooltipProvider>
                <ButtonGroup aria-label="Ações do cofrinho">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button type="button" variant="outline" size="icon-sm" aria-label="Editando cofrinho atual" disabled>
                        <Pencil />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Editando</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        aria-label="Guardar valor"
                        onClick={() => onOpenAmountAction?.("deposit", vault)}
                      >
                        <Landmark />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Guardar</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        aria-label="Resgatar valor"
                        onClick={() => onOpenAmountAction?.("withdraw", vault)}
                      >
                        <HandCoins />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Resgatar</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        aria-label="Adicionar rendimento"
                        onClick={() => onOpenAmountAction?.("yield", vault)}
                      >
                        <TrendingUp />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Rendimento</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        aria-label="Excluir cofrinho"
                        onClick={() => void onRequestDelete?.(vault)}
                      >
                        <Trash2 />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Excluir</TooltipContent>
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
            ) : null}
          </div>
        </SheetHeader>

        <form onSubmit={submit} className="flex h-full flex-col">
          <input type="hidden" {...register("color")} />
          <input type="hidden" {...register("icon")} />

          <SheetBody className="flex min-h-0 h-full flex-col gap-4">
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
                        aria-label="Selecionar icone e cor"
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
                          <p className="text-xs font-medium text-muted-foreground">Icone</p>
                          <div className="grid grid-cols-6 gap-2.5">
                            {VAULT_ICONS.map((iconName) => (
                              <button
                                key={iconName}
                                type="button"
                                className={cn(
                                  "flex size-10 items-center justify-center rounded-md border bg-background transition-colors hover:bg-muted",
                                  selectedIcon === iconName && "border-foreground",
                                )}
                                aria-label={`Selecionar icone ${iconName}`}
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
                <InputGroupInput id="vault-name" placeholder="Reserva de emergencia" {...register("name")} />
              </InputGroup>
              {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="vault-target">Meta (opcional)</Label>
              <Input id="vault-target" type="number" min="0" step="0.01" placeholder="0,00" {...register("targetAmount")} />
              {errors.targetAmount ? <p className="text-sm text-destructive">{errors.targetAmount.message as string}</p> : null}
            </div>

            {vault ? (
              <div className="flex flex-col gap-4 min-h-0 flex-1">
                <Label className="h-fit">Histórico do mes</Label>
                <div className="flex flex-1 min-h-0 flex-col rounded-xl border bg-background p-3">
                  {isHistoryLoading ? (
                    <p className="text-sm text-muted-foreground">Carregando histórico...</p>
                  ) : historyError ? (
                    <p className="text-sm text-destructive">{historyError}</p>
                  ) : history && history.groups.length > 0 ? (
                    <>
                      <div className="flex items-start justify-between border-b pb-2">
                        <div className="flex flex-col">
                          <p className="text-[11px] font-medium tracking-wide text-muted-foreground">
                            TOTAL DO MES
                          </p>
                          <p className="text-sm font-semibold capitalize text-foreground/90">
                            {getHistoryMonthLabel(history.month)}
                          </p>
                        </div>

                        <p className="text-base font-bold text-foreground">
                          {formatCurrency(history.summary.totalNetSaved)}
                        </p>
                      </div>

                      <ScrollArea className="mt-3 min-h-0 flex-1 pr-2">
                        <div className="flex flex-col gap-5 pb-1">
                          {history.groups.map((group) => (
                            <div key={group.date} className="flex flex-col gap-2.5">
                              <p className="text-xs font-semibold tracking-wide text-muted-foreground">
                                {getHistoryGroupLabel(group.date)}
                              </p>
                              <div className="flex flex-col gap-2">
                                {group.items.map((item) => (
                                  <div
                                    key={item.id}
                                    className="flex items-start justify-between gap-3 rounded-xl border bg-muted/20 px-3 py-2.5"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div
                                        className={cn(
                                          "flex size-10 items-center justify-center rounded-xl border",
                                          getHistoryEventBadgeClass(item.type),
                                        )}
                                      >
                                        <DynamicIcon name={getHistoryEventIcon(item.type)} />
                                      </div>

                                      <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-foreground">
                                          {getHistoryEventLabel(item.type)}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                          {new Date(item.happenedAt).toLocaleTimeString("pt-BR", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                          {" • "}
                                          Cofrinho
                                        </span>
                                      </div>
                                    </div>

                                    <div className="text-right">
                                      <p
                                        className={cn(
                                          "text-sm font-bold",
                                          getHistoryEventAmountClass(item.type),
                                        )}
                                      >
                                        {item.type === "withdraw" ? "- " : "+ "}
                                        {formatCurrency(item.amount)}
                                      </p>
                                      <p className="text-[11px] text-muted-foreground">
                                        Saldo: {formatCurrency(item.balanceAfter)}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}

                          {history.pagination.hasNextPage ? (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={loadMoreHistory}
                              disabled={isLoadingMoreHistory}
                            >
                              {isLoadingMoreHistory
                                ? "Carregando..."
                                : "Carregar mais"}
                            </Button>
                          ) : null}
                        </div>
                      </ScrollArea>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Sem movimentacoes para este mes.
                    </p>
                  )}
                </div>
              </div>
            ) : null}
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

