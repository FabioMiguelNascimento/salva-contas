"use client";

import { DynamicIcon } from '@/components/dynamic-icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { chatWithAiAdvisor } from '@/services/ai-advisor';
import { confirmTransaction } from '@/services/transactions';
import type { AiVisualization } from '@/types/finance';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Paperclip, Send, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { toast } from 'sonner';

type ChatAttachment = {
  name: string;
  url: string;
  type: string;
};

type VisualizationStatus = 'idle' | 'confirming' | 'confirmed' | 'cancelled';
type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  visualizations?: AiVisualization[];
  visualizationStatuses?: Record<string, VisualizationStatus>;
  attachments?: ChatAttachment[];
};

const CHART_COLORS = ['#10b981', '#0ea5e9', '#f97316', '#6366f1', '#ec4899', '#14b8a6'];

function AiVisualizationRenderer({
  visualization,
  messageId,
  index,
  status,
  onConfirmVisualization,
  onCancelVisualization,
}: {
  visualization: AiVisualization;
  messageId: string;
  index: number;
  status: VisualizationStatus;
  onConfirmVisualization: (messageId: string, index: number, payload: any) => Promise<void>;
  onCancelVisualization: (messageId: string, index: number) => void;
}) {
  const requiresConfirmation = Boolean(visualization.payload?.requiresConfirmation);
  const proposedTransactions = Array.isArray(visualization.payload?.proposedTransactions)
    ? visualization.payload.proposedTransactions
    : null;

  const buildConfirmData = () => {
    if (proposedTransactions) return proposedTransactions;

    if (visualization.payload && typeof visualization.payload === 'object') {
      const { requiresConfirmation: _req, proposedTransactions: _prop, ...rest } = visualization.payload as any;
      return [rest];
    }

    return [];
  };

  const renderConfirmationActions = () => {
    if (!requiresConfirmation) return null;

    if (status === 'confirmed') {
      return (
        <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 p-2 text-sm text-emerald-700">
          Transação confirmada com sucesso.
        </div>
      );
    }

    if (status === 'cancelled') {
      return (
        <div className="mt-3 rounded-md border border-rose-200 bg-rose-50 p-2 text-sm text-rose-700">
          Transação cancelada. A ação não será realizada.
        </div>
      );
    }

    return (
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onConfirmVisualization(messageId, index, buildConfirmData())}
          disabled={status === 'confirming'}
        >
          {status === 'confirming' ? 'Confirmando...' : 'Confirmar'}
        </Button>
        <Button size="sm" variant="outline" onClick={() => onCancelVisualization(messageId, index)}>
          Cancelar
        </Button>
      </div>
    );
  };

  if (visualization.type === 'chart_donut') {
    const items = Array.isArray(visualization.payload?.items) ? visualization.payload.items : [];

    return (
      <div className="mt-3 rounded-xl border border-gray-100 bg-white p-3">
        <p className="text-xs font-semibold text-gray-600 mb-2">{visualization.title}</p>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={items} dataKey="total" nameKey="category" innerRadius={55} outerRadius={85}>
                {items.map((_: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => `R$ ${Number(value || 0).toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  if (visualization.type === 'chart_line') {
    const points = Array.isArray(visualization.payload?.points) ? visualization.payload.points : [];

    return (
      <div className="mt-3 rounded-xl border border-gray-100 bg-white p-3">
        <p className="text-xs font-semibold text-gray-600 mb-2">{visualization.title}</p>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value: any) => `R$ ${Number(value || 0).toFixed(2)}`} />
              <Line type="monotone" dataKey="total" stroke="#0ea5e9" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  if (visualization.type === 'transaction') {
    const transaction = visualization.payload as any;

    const formatDate = (value?: string | Date | null) => {
      if (!value) return null;
      try {
        let date: Date;

        if (typeof value === 'string') {
          date = parseISO(value);
        } else if (value instanceof Date) {
          date = value;
        } else {
          return String(value);
        }

        return format(date, "dd/MM/yyyy", { locale: ptBR });
      } catch {
        return String(value);
      }
    };

    const cardLabel = (() => {
      if (transaction.creditCard?.name) return transaction.creditCard.name;
      if (transaction.creditCardName) return transaction.creditCardName;
      if (transaction.creditCardId && typeof transaction.creditCardId === 'string') {
        const shortId = transaction.creditCardId.length > 10
          ? `${transaction.creditCardId.slice(0, 8)}...`
          : transaction.creditCardId;
        return `ID ${shortId}`;
      }
      return null;
    })();

    const cardFlag = (transaction.creditCard?.flag || transaction.creditCardFlag || '').toLowerCase();

    return (
      <div className="mt-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{transaction.description || 'Transação registrada'}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="flex items-center gap-2 whitespace-nowrap">
                {transaction.categoryIcon ? (
                  <DynamicIcon name={transaction.categoryIcon} className="h-4 w-4 text-slate-500" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                )}
                <span className="truncate">{transaction.categoryName ?? transaction.category ?? 'Sem categoria'}</span>
              </span>
              {transaction.createdByName ? (
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-slate-400" />
                  Criado por {transaction.createdByName}
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-base font-semibold text-emerald-700">R$ {Number(transaction.amount || 0).toFixed(2)}</p>
              <p className="text-xs text-slate-500">{transaction.status === 'paid' ? 'Liquidado' : 'Pendente'}</p>
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3 text-xs text-slate-500">
          {transaction.paymentDate && (
            <div className="rounded-md bg-slate-50 px-2 py-1">
              <span className="font-medium text-slate-600">Pago:</span> {formatDate(transaction.paymentDate)}
            </div>
          )}
          {transaction.dueDate && (
            <div className="rounded-md bg-slate-50 px-2 py-1">
              <span className="font-medium text-slate-600">Vencimento:</span> {formatDate(transaction.dueDate)}
            </div>
          )}
          <div className="rounded-md bg-slate-50 px-2 py-1">
            <span className="font-medium text-slate-600">Tipo:</span> {transaction.type === 'income' ? 'Receita' : 'Despesa'}
          </div>
        </div>
        {renderConfirmationActions()}
      </div>
    );
  }

  if (
    visualization.type === 'table_summary' &&
    visualization.payload &&
    typeof visualization.payload === 'object' &&
    'description' in visualization.payload &&
    'amount' in visualization.payload
  ) {
    const t = visualization.payload as any;

    const formatDate = (value?: string | Date | null) => {
      if (!value) return null;
      try {
        let date: Date;
        if (typeof value === 'string') date = parseISO(value);
        else if (value instanceof Date) date = value;
        else return String(value);
        return format(date, "dd/MM/yyyy", { locale: ptBR });
      } catch {
        return String(value);
      }
    };

    return (
      <div className="mt-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">{t.description || 'Transação'}</p>
            <p className="text-xs text-slate-500">{t.categoryName ?? t.category ?? 'Sem categoria'}</p>
          </div>
          <p className="text-base font-semibold text-emerald-700">R$ {Number(t.amount || 0).toFixed(2)}</p>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3 text-xs text-slate-500">
          {t.paymentDate && (
            <div className="rounded-md bg-slate-50 px-2 py-1">
              <span className="font-medium text-slate-600">Pago:</span> {formatDate(t.paymentDate)}
            </div>
          )}
          {t.dueDate && (
            <div className="rounded-md bg-slate-50 px-2 py-1">
              <span className="font-medium text-slate-600">Vencimento:</span> {formatDate(t.dueDate)}
            </div>
          )}
          {t.createdByName && (
            <div className="rounded-md bg-slate-50 px-2 py-1">
              <span className="font-medium text-slate-600">Criado por:</span> {t.createdByName}
            </div>
          )}
        </div>
      </div>
    );
  }

  const payload = visualization.payload || {};

  if (Array.isArray(payload.items)) {
    const items = payload.items as Array<{ description?: string; amount?: number; category?: string; createdByName?: string | null }>;
    const total = items.reduce((sum, item) => sum + Number(item.amount || 0), 0);

    return (
      <div className="mt-3 rounded-xl border border-gray-100 bg-white p-3">
        <p className="text-xs font-semibold text-gray-600 mb-2">{visualization.title}</p>
        <div className="mb-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
          <div className="rounded-lg bg-emerald-50 p-2">
            <p className="text-xs text-emerald-700">Transações</p>
            <p className="font-semibold text-emerald-800">{Number(payload.totalTransactions || items.length || 0)}</p>
          </div>
          <div className="rounded-lg bg-slate-100 p-2">
            <p className="text-xs text-slate-600">Valor total</p>
            <p className="font-semibold text-slate-800">R$ {total.toFixed(2)}</p>
          </div>
        </div>

        <div className="space-y-1 max-h-56 overflow-auto pr-1">
          {items.slice(0, 12).map((item, index) => (
            <div key={`${item.description || 'item'}-${index}`} className="rounded-md border border-slate-100 px-2 py-1.5">
              <p className="text-xs font-medium text-slate-800 truncate">{item.description || 'Sem descricao'}</p>
              <p className="text-[11px] text-slate-500">
                {item.category || 'Sem categoria'} • R$ {Number(item.amount || 0).toFixed(2)}
                {(item as any).id ? ` • ${(item as any).id.slice(0, 8)}…` : ''}
                {item.createdByName ? ` • Criado por ${item.createdByName}` : ''}
              </p>
            </div>
          ))}
          {items.length > 12 ? (
            <p className="text-[11px] text-slate-500">+ {items.length - 12} transações não exibidas</p>
          ) : null}
        </div>
        {renderConfirmationActions()}
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-xl border border-gray-100 bg-white p-3">
      <p className="text-xs font-semibold text-gray-600 mb-2">{visualization.title}</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
        <div className="rounded-lg bg-emerald-50 p-2">
          <p className="text-xs text-emerald-700">Receitas</p>
          <p className="font-semibold text-emerald-800">R$ {Number(payload.totalIncome || 0).toFixed(2)}</p>
        </div>
        <div className="rounded-lg bg-rose-50 p-2">
          <p className="text-xs text-rose-700">Despesas</p>
          <p className="font-semibold text-rose-800">R$ {Number(payload.totalExpenses || 0).toFixed(2)}</p>
        </div>
        <div className="rounded-lg bg-slate-100 p-2">
          <p className="text-xs text-slate-600">Saldo</p>
          <p className="font-semibold text-slate-800">R$ {Number(payload.balance || 0).toFixed(2)}</p>
        </div>
      </div>
      {payload.attachmentUrl && (
        <div className="mt-3 rounded-lg border border-dashed border-emerald-200 bg-emerald-50 p-3">
          <p className="text-xs font-semibold text-emerald-700 mb-1">Anexo disponível</p>
          <a
            href={payload.attachmentUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-emerald-700 hover:text-emerald-900"
          >
            {payload.attachmentOriginalName || 'Abrir anexo'}
          </a>
        </div>
      )}
      {renderConfirmationActions()}
    </div>
  );
}

function MessageBubble({
  message,
  onConfirmVisualization,
  onCancelVisualization,
}: {
  message: ChatMessage;
  onConfirmVisualization: (messageId: string, index: number, payload: any) => Promise<void>;
  onCancelVisualization: (messageId: string, index: number) => void;
}) {
  const isAssistant = message.role === 'assistant';
  return (
    <div className={`w-full flex ${isAssistant ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-[94%] rounded-2xl px-3.5 py-3 ${isAssistant ? 'bg-white border border-emerald-100 shadow-sm text-slate-800' : 'bg-emerald-600 text-white shadow-sm'}`}>
        {isAssistant ? (
          <div className="prose prose-sm max-w-none prose-p:my-1.5 prose-li:my-0.5 prose-headings:my-1 text-slate-800">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-sm leading-relaxed">{message.content}</p>
        )}

        {message.attachments?.length ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.attachments.map((attachment) => (
              <div
                key={attachment.url}
                className="relative w-24 overflow-hidden rounded-xl border border-slate-200 bg-white"
              >
                {attachment.type.startsWith('image/') ? (
                  <img
                    src={attachment.url}
                    alt={attachment.name}
                    className="h-24 w-24 object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center text-xs text-slate-500">
                    {attachment.name}
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1 py-0.5 text-[10px] text-white">
                  {attachment.name}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {isAssistant && (message.visualizations || []).map((visual, index) => (
          <AiVisualizationRenderer
            key={`${message.id}-${visual.toolName}-${index}`}
            visualization={visual}
            messageId={message.id}
            index={index}
            status={message.visualizationStatuses?.[String(index)] ?? 'idle'}
            onConfirmVisualization={onConfirmVisualization}
            onCancelVisualization={onCancelVisualization}
          />
        ))}
      </div>
    </div>
  );
}

interface AiAdvisorCardProps {
  month: number;
  year: number;
}

export default function AiAdvisorCard({ month, year }: AiAdvisorCardProps) {
  const initialMessages = useMemo<ChatMessage[]>(
    () => [
      {
        id: 'seed-1',
        role: 'assistant',
        content: 'Oi! Eu sou o Boletinho, seu assistente financeiro. Pergunte algo sobre suas finanças para começar.',
      },
    ],
    [],
  );

  const STORAGE_KEY = 'ai-advisor-messages';

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window === 'undefined') return initialMessages;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return initialMessages;

      const parsed = JSON.parse(stored) as Omit<ChatMessage, 'attachments'>[];
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : initialMessages;
    } catch {
      return initialMessages;
    }
  });

  const handleConfirmVisualization = async (messageId: string, idx: number, payload: any) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              visualizationStatuses: {
                ...(msg.visualizationStatuses ?? {}),
                [idx]: 'confirming',
              },
            }
          : msg,
      ),
    );

    try {
      const confirmed = await confirmTransaction(payload);
      toast.success(
        `Confirmação realizada: ${Array.isArray(confirmed) ? confirmed.length : 1} transação(ões)`,
      );
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                visualizationStatuses: {
                  ...(msg.visualizationStatuses ?? {}),
                  [idx]: 'confirmed',
                },
              }
            : msg,
        ),
      );
    } catch (error: any) {
      toast.error(error?.message || 'Falha ao confirmar transação. Tente novamente.');
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                visualizationStatuses: {
                  ...(msg.visualizationStatuses ?? {}),
                  [idx]: 'idle',
                },
              }
            : msg,
        ),
      );
    }
  };

  const handleCancelVisualization = (messageId: string, idx: number) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              visualizationStatuses: {
                ...(msg.visualizationStatuses ?? {}),
                [idx]: 'cancelled',
              },
            }
          : msg,
      ),
    );
    toast('Operação cancelada.');
  };

  const [input, setInput] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'waiting'>('idle');
  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const messagesToStore = messages.map(({ attachments, ...rest }) => rest);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messagesToStore));
  }, [messages]);

  const history = useMemo(
    () => messages.filter((m) => m.id !== 'seed-1').map((m) => ({ role: m.role, content: m.content })),
    [messages],
  );

  const scrollToBottom = () => {
    setTimeout(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    }, 0);
  };

  useEffect(() => {
    // Scroll to bottom on initial mount and whenever messages change.
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed && attachedFiles.length === 0) return;
    if (isLoading) return;

    const messageText = trimmed || 'Envio de anexo';

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText,
      attachments: attachedFiles.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type,
      })),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setAttachedFiles([]);
    setIsLoading(true);
    setStatus('sending');
    scrollToBottom();

    try {
      const response = await chatWithAiAdvisor({
        history,
        message: messageText,
        files: attachedFiles,
      });
      setStatus('waiting');

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.message,
        visualizations: response.visualizations,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      scrollToBottom();
    } catch (error: any) {
      toast.error(error?.message || 'Nao foi possivel conversar com o assistente agora.');
    } finally {
      setStatus('idle');
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full min-h-0 flex flex-col rounded-xl bg-linear-to-b from-emerald-50/60 to-white">
      <div className="flex flex-1 min-h-0 flex-col lg:flex-row">
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="flex-1 min-h-0 p-3 sm:p-4">
            <ScrollArea
              ref={listRef}
              className="h-full rounded-xl bg-emerald-50/40 p-3 sm:p-4"
            >
              <div className="space-y-3">
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    onConfirmVisualization={handleConfirmVisualization}
                    onCancelVisualization={handleCancelVisualization}
                  />
                ))}

                {isLoading && (
                  <div className="flex items-center gap-2 rounded-2xl bg-white/70 px-4 py-3 shadow-inner">
                    <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                    <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse delay-75" />
                    <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse delay-150" />
                    <span className="text-sm text-emerald-700">
                      {status === 'sending' ? 'Enviando...' : 'Aguardando resposta...'}
                    </span>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="bg-white/70 p-3 sm:p-4">
            <div className="flex flex-col gap-2">
              <div className="relative flex items-center rounded-full border border-slate-200 bg-white/80 px-3 py-2 shadow-sm">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  multiple
                  onChange={(event) => {
                    const files = Array.from(event.target.files ?? []);
                    if (files.length === 0) return;
                    setAttachedFiles((prev) => [...prev, ...files]);
                    // Reset to allow re-uploading same file if needed
                    event.target.value = '';
                  }}
                />

                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
                  onClick={() => fileInputRef.current?.click()}
                  title="Adicionar imagem"
                >
                  <Paperclip className="h-4 w-4" />
                </button>

                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Pergunte algo sobre suas finanças..."
                  className="flex-1 bg-transparent border-none p-0 pl-2 pr-10 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-0 focus-visible:border-slate-300"
                />

                <Button
                  onClick={sendMessage}
                  disabled={isLoading || (!input.trim() && attachedFiles.length === 0)}
                  size="icon"
                  aria-label="Enviar mensagem"
                  className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-slate-400"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              {attachedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {attachedFiles.map((file) => (
                    <div
                      key={`${file.name}-${file.size}-${file.lastModified}`}
                      className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700"
                    >
                      <span className="truncate max-w-[12rem]">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => setAttachedFiles((prev) => prev.filter((f) => f !== file))}
                        className="rounded-full p-1 hover:bg-slate-200"
                        aria-label={`Remover ${file.name}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
