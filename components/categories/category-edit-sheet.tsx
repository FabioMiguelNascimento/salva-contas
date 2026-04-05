"use client";

import { IconPicker } from "@/components/categories/icon-picker";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
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
import type { TransactionCategory } from "@/types/finance";
import { Lock, Pencil, Trash2, X } from "lucide-react";
import type { FormEvent } from "react";

interface CategoryEditSheetProps {
  open: boolean;
  category: TransactionCategory | null;
  name: string;
  icon: string;
  isSaving: boolean;
  error: string | null;
  onNameChange: (value: string) => void;
  onIconChange: (value: string) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onDelete: () => void;
}

export function CategoryEditSheet({
  open,
  category,
  name,
  icon,
  isSaving,
  error,
  onNameChange,
  onDelete,
  onIconChange,
  onClose,
  onSubmit,
}: CategoryEditSheetProps) {
  const isReadOnly = Boolean(category?.isGlobal);

  return (
    <Sheet open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <SheetContent className="flex min-h-0 flex-col" showCloseButton={false}>
        <SheetHeader className="gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <SheetTitle>{isReadOnly ? "Categoria protegida" : "Editar categoria"}</SheetTitle>
              <SheetDescription>
                {isReadOnly
                  ? "Categorias globais são mantidas pela plataforma e não podem ser alteradas."
                  : "Ajuste o nome e o ícone usados em toda a aplicação."}
              </SheetDescription>
            </div>

            <TooltipProvider>
              <ButtonGroup aria-label="Ações da categoria">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      aria-label={isReadOnly ? "Categoria protegida" : "Categoria em edição"}
                      disabled
                    >
                      {isReadOnly ? <Lock data-icon="inline-start" /> : <Pencil data-icon="inline-start" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{isReadOnly ? "Categoria protegida" : "Categoria em edição"}</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      aria-label="Excluir categoria"
                      onClick={onDelete}
                      disabled={isReadOnly}
                    >
                      <Trash2 data-icon="inline-start" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{isReadOnly ? "Categoria protegida" : "Excluir categoria"}</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button type="button" variant="outline" size="icon-sm" aria-label="Fechar" onClick={onClose}>
                      <X data-icon="inline-start" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Fechar</TooltipContent>
                </Tooltip>
              </ButtonGroup>
            </TooltipProvider>
          </div>
        </SheetHeader>

        <form id="category-edit-form" className="flex min-h-0 flex-1 flex-col" onSubmit={onSubmit}>
          <SheetBody className="flex min-h-0 flex-1 flex-col gap-4">
            {isReadOnly ? (
              <div className="rounded-xl border border-border/60 bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
                Somente categorias pessoais podem ser editadas.
              </div>
            ) : null}

            <div className="flex flex-col gap-2">
              <Label htmlFor="category-name">Nome</Label>
              <div className="flex items-center gap-2">
                <IconPicker value={icon || "tag"} onChange={onIconChange} disabled={isSaving || isReadOnly} />
                <Input
                  id="category-name"
                  autoFocus
                  value={name}
                  onChange={(event) => onNameChange(event.target.value)}
                  placeholder="Ex: Alimentação"
                  disabled={isSaving || isReadOnly}
                  className="flex-1"
                />
              </div>
            </div>

            {error ? (
              <p className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            ) : null}
          </SheetBody>

          <SheetFooter className="flex-row gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={isSaving}>
              {isReadOnly ? "Fechar" : "Cancelar"}
            </Button>
            {!isReadOnly ? (
              <Button type="submit" className="flex-1" disabled={isSaving}>
                Salvar
              </Button>
            ) : null}
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}