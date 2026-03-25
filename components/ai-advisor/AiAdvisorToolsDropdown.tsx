"use client";

import { DynamicIcon } from '@/components/dynamic-icon';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus } from 'lucide-react';
import { Button } from '../ui/button';

const TOOL_PROMPT_OPTIONS = [
  {
    id: 'get_monthly_summary',
    label: 'Resumo do mes',
    icon: 'scale',
    prompt: 'Mostre meu resumo financeiro deste mes (receitas, despesas e saldo).',
  },
  {
    id: 'get_expenses_by_category',
    label: 'Despesas por categoria',
    icon: 'pie-chart',
    prompt: 'Mostre minhas despesas por categoria neste mes.',
  },
  {
    id: 'get_spending_trend',
    label: 'Tendencia de gastos',
    icon: 'chart-line',
    prompt: 'Mostre a tendencia dos meus gastos dos ultimos 30 dias.',
  },
  {
    id: 'get_transaction_details',
    label: 'Detalhes de transação',
    icon: 'search',
    prompt: 'Busque os detalhes da transação com descrição: ',
  },
  {
    id: 'process_transaction_receipt',
    label: 'Processar comprovante',
    icon: 'receipt',
    prompt: 'Vou anexar um comprovante para você processar automaticamente.',
  },
  {
    id: 'create_transaction',
    label: 'Criar transação por texto',
    icon: 'plus-circle',
    prompt: 'Registre está transação: ',
  },
] as const;

type AiAdvisorToolsDropdownProps = {
  disabled?: boolean;
  onSelectPrompt: (prompt: string) => void;
};

export default function AiAdvisorToolsDropdown({
  disabled = false,
  onSelectPrompt,
}: AiAdvisorToolsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          disabled={disabled}
          className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          title="Sugestões de ferramentas"
          aria-label="Sugestões de ferramentas"
        >
         <Plus />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {TOOL_PROMPT_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.id}
            onClick={() => onSelectPrompt(option.prompt)}
            disabled={disabled}
          >
            <DynamicIcon name={option.icon} className="h-4 w-4 text-slate-500" />
            <span>{option.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}



