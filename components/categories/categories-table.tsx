"use client";

import { DynamicIcon } from "@/components/dynamic-icon";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { TransactionCategory } from "@/types/finance";
import { ChevronRight, Lock } from "lucide-react";

interface CategoriesTableProps {
  categories: TransactionCategory[];
  onSelect: (category: TransactionCategory) => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

function CategoryRow({
  category,
  onSelect,
}: {
  category: TransactionCategory;
  onSelect: (category: TransactionCategory) => void;
}) {
  const isEditable = !category.isGlobal;

  return (
    <TableRow
      className={cn(
        "transition-colors",
        isEditable ? "cursor-pointer hover:bg-muted/30" : "cursor-not-allowed bg-muted/10 opacity-70",
      )}
      title={isEditable ? "Abrir categoria" : "Categoria global somente leitura"}
      aria-disabled={!isEditable}
      tabIndex={isEditable ? 0 : -1}
      onClick={() => {
        if (isEditable) {
          onSelect(category);
        }
      }}
      onKeyDown={(event) => {
        if (!isEditable) {
          return;
        }

        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(category);
        }
      }}
    >
      <TableCell className="whitespace-normal">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted/40 text-muted-foreground">
            <DynamicIcon name={category.icon ?? "tag"} className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{category.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {category.isGlobal ? "Categoria compartilhada" : "Categoria pessoal"}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-right">
        <Badge variant={category.isGlobal ? "secondary" : "outline"}>
          {category.isGlobal ? "Global" : "Pessoal"}
        </Badge>
      </TableCell>
    </TableRow>
  );
}

export function CategoriesTable({
  categories,
  onSelect,
  emptyTitle = "Nenhuma categoria encontrada.",
  emptyDescription = "Ajuste o filtro ou limpe a busca para ver todas as categorias.",
}: CategoriesTableProps) {
  if (categories.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center">
        <p className="text-sm font-medium text-foreground">{emptyTitle}</p>
        <p className="mt-2 text-sm text-muted-foreground">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="hidden md:block">
        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Origem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <CategoryRow key={category.id} category={category} onSelect={onSelect} />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="grid gap-3 md:hidden">
        {categories.map((category) => (
          <Card
            key={category.id}
            className={cn(
              "border-border/60 transition-colors",
              category.isGlobal ? "cursor-not-allowed bg-muted/10 opacity-70" : "cursor-pointer hover:bg-muted/30",
            )}
            title={category.isGlobal ? "Categoria global somente leitura" : "Abrir categoria"}
            role={category.isGlobal ? undefined : "button"}
            tabIndex={category.isGlobal ? -1 : 0}
            aria-disabled={category.isGlobal}
            onClick={() => {
              if (!category.isGlobal) {
                onSelect(category);
              }
            }}
            onKeyDown={(event) => {
              if (category.isGlobal) {
                return;
              }

              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect(category);
              }
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted/40 text-muted-foreground">
                  <DynamicIcon name={category.icon ?? "tag"} className="size-4" />
                </div>
                <div className="min-w-0 flex flex-1 flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{category.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {category.isGlobal ? "Categoria compartilhada" : "Categoria pessoal"}
                      </p>
                    </div>
                    <Badge variant={category.isGlobal ? "secondary" : "outline"}>
                      {category.isGlobal ? "Global" : "Pessoal"}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground/80">Ícone:</span>
                    <span className="font-mono">{category.icon?.trim() ? category.icon : "Sem ícone"}</span>
                  </div>
                  <div className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                    {category.isGlobal ? (
                      <>
                        Somente leitura <Lock className="size-3.5" />
                      </>
                    ) : (
                      <>
                        Abrir <ChevronRight className="size-3.5" />
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function CategoriesTableSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="hidden md:block">
        <div className="rounded-2xl border border-border/60">
          <div className="flex flex-col gap-3 p-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4 rounded-xl border border-border/60 p-4">
                <Skeleton className="size-10 rounded-xl" />
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-4 w-56 max-w-full rounded-full" />
                  <Skeleton className="h-3 w-32 max-w-full rounded-full" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-4 w-24 rounded-full" />
                <Skeleton className="h-4 w-12 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:hidden">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-border/60 p-4">
            <div className="flex items-start gap-3">
              <Skeleton className="size-11 rounded-xl" />
              <div className="min-w-0 flex-1 flex flex-col gap-2">
                <Skeleton className="h-4 w-40 max-w-full rounded-full" />
                <Skeleton className="h-3 w-28 max-w-full rounded-full" />
                <Skeleton className="h-3 w-24 rounded-full" />
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
