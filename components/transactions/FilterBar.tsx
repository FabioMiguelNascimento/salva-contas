import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAvailableYears, monthsShort } from "@/lib/subscriptions/constants";
import { ChangeEvent, useEffect, useState } from "react";

interface Props {
  search: string;
  type: string;
  status: string;
  month: number;
  year: number;
  onSearchChange: (value: string) => void;
  onMonthChange: (value: number) => void;
  onYearChange: (value: number) => void;
  onTypeChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export function FilterBar({
  search,
  type,
  status,
  month,
  year,
  onSearchChange,
  onMonthChange,
  onYearChange,
  onTypeChange,
  onStatusChange,
}: Props) {
  const years = getAvailableYears();
  const [term, setTerm] = useState(search);

  useEffect(() => {
    setTerm(search);
  }, [search]);

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
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
            className="w-full"
          />
        </div>
        <Button className="w-full sm:w-auto" onClick={() => onSearchChange(term)}>
          Buscar
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="col-span-1">
          <label htmlFor="transactions-filter-month" className="mb-1 block text-xs font-medium text-slate-600">
            Mês
          </label>
          <Select value={String(month)} onValueChange={(v) => onMonthChange(Number(v))}>
            <SelectTrigger id="transactions-filter-month" aria-label="Filtrar por mês" className="w-full">
              <SelectValue placeholder="Mês" />
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

        <div className="col-span-1">
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

        <div className="col-span-2 sm:col-span-1">
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

        <div className="col-span-2 sm:col-span-1">
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
