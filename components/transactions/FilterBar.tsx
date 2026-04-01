import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAvailableYears, monthsShort } from "@/lib/subscriptions/constants";
import type { TransactionCategory } from "@/types/finance";
import { Loader2 } from "lucide-react";
import { ChangeEvent, useEffect, useState } from "react";

interface Props {
  search: string;
  type: string;
  status: string;
  month: number;
  year: number;
  categoryId: string | null;
  categories: TransactionCategory[];
  isSearching?: boolean;
  onSearchChange: (value: string) => void;
  onMonthChange: (value: number) => void;
  onYearChange: (value: number) => void;
  onCategoryChange: (value: string | null) => void;
  onTypeChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export function FilterBar({
  search,
  type,
  status,
  month,
  year,
  categoryId,
  categories,
  isSearching = false,
  onSearchChange,
  onMonthChange,
  onYearChange,
  onCategoryChange,
  onTypeChange,
  onStatusChange,
}: Props) {
  const years = getAvailableYears();
  const [term, setTerm] = useState(search);

  useEffect(() => {
    setTerm(search);
  }, [search]);

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isSearching) {
      onSearchChange(term);
    }
  };

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="transactions-filter-search" className="mb-1 block text-xs font-medium text-slate-600">
            Buscar
          </label>
          <Input
            id="transactions-filter-search"
            placeholder="Buscar por descrição ou categoria"
            value={term}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setTerm(e.target.value)}
            onKeyDown={handleKey}
            disabled={isSearching}
            className="w-full"
          />
        </div>
        <Button className="w-full sm:w-auto" onClick={() => onSearchChange(term)} disabled={isSearching}>
          {isSearching ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Buscando...
            </>
          ) : (
            "Buscar"
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[120px_120px_minmax(220px,1fr)_minmax(160px,1fr)_minmax(160px,1fr)]">
        <div className="min-w-0">
          <label htmlFor="transactions-filter-month" className="mb-1 block text-xs font-medium text-slate-600">
            Mes
          </label>
          <Select value={String(month)} onValueChange={(v) => onMonthChange(Number(v))}>
            <SelectTrigger id="transactions-filter-month" aria-label="Filtrar por mes" className="w-full">
              <SelectValue placeholder="Mes" />
            </SelectTrigger>
            <SelectContent>
              {monthsShort.map((m) => (
                <SelectItem key={m.value} value={String(m.value)}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-0">
          <label htmlFor="transactions-filter-year" className="mb-1 block text-xs font-medium text-slate-600">
            Ano
          </label>
          <Select value={String(year)} onValueChange={(v) => onYearChange(Number(v))}>
            <SelectTrigger id="transactions-filter-year" aria-label="Filtrar por ano" className="w-full">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-0">
          <label htmlFor="transactions-filter-category" className="mb-1 block text-xs font-medium text-slate-600">
            Categoria
          </label>
          <Select value={categoryId ?? "all"} onValueChange={(v) => onCategoryChange(v === "all" ? null : v)}>
            <SelectTrigger id="transactions-filter-category" aria-label="Filtrar por categoria" className="w-full">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-0">
          <label htmlFor="transactions-filter-type" className="mb-1 block text-xs font-medium text-slate-600">
            Tipo
          </label>
          <Select value={type} onValueChange={onTypeChange}>
            <SelectTrigger id="transactions-filter-type" aria-label="Filtrar por tipo" className="w-full">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="expense">Despesas</SelectItem>
              <SelectItem value="income">Receitas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-0">
          <label htmlFor="transactions-filter-status" className="mb-1 block text-xs font-medium text-slate-600">
            Status
          </label>
          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger id="transactions-filter-status" aria-label="Filtrar por status" className="w-full">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="paid">Pagos</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

