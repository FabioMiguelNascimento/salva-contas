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

  // keep input in sync if parent filters change externally
  useEffect(() => {
    setTerm(search);
  }, [search]);

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearchChange(term);
    }
  };

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="flex flex-1 items-center gap-2">
        <Input
          placeholder="Buscar por descrição ou categoria"
          value={term}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setTerm(e.target.value)}
          onKeyDown={handleKey}
          className="w-full sm:max-w-xs"
        />
        <Button size="sm" onClick={() => onSearchChange(term)}>
          Buscar
        </Button>
      </div>
      <Select value={String(month)} onValueChange={(v) => onMonthChange(Number(v))}>
        <SelectTrigger className="w-[110px]">
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
      <Select value={String(year)} onValueChange={(v) => onYearChange(Number(v))}>
        <SelectTrigger className="w-[110px]">
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
      <Select value={type} onValueChange={onTypeChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os tipos</SelectItem>
          <SelectItem value="expense">Despesas</SelectItem>
          <SelectItem value="income">Receitas</SelectItem>
        </SelectContent>
      </Select>
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="paid">Pagos</SelectItem>
          <SelectItem value="pending">Pendentes</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
