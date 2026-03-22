"use client";

import AiAdvisorAttachmentButton from '@/components/dashboard/AiAdvisorAttachmentButton';
import AiAdvisorMessageBubble from '@/components/dashboard/AiAdvisorMessageBubble';
import AiAdvisorToolsDropdown from '@/components/dashboard/AiAdvisorToolsDropdown';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { chatWithAiAdvisor } from '@/services/ai-advisor';
import { confirmTransaction } from '@/services/transactions';
import type { AiVisualization } from '@/types/finance';
import { useEffect, useMemo, useRef, useState } from 'react';
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
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (!stored) return initialMessages;

      const parsed = JSON.parse(stored) as ChatMessage[];
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : initialMessages;
    } catch {
      return initialMessages;
    }
  });

  const [input, setInput] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'waiting'>('idle');
  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const messagesToStore = messages.map(({ attachments, ...rest }) => rest);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messagesToStore));
  }, [messages]);

  const handleClearHistory = () => {
    setMessages(initialMessages);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(STORAGE_KEY);
    }
    toast.success('Historico do assistente limpo para esta sessao.');
  };

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
    scrollToBottom();
  }, [messages]);

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
      toast.success(`Confirmação realizada: ${Array.isArray(confirmed) ? confirmed.length : 1} transação(ões)`);
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

  const handleSelectToolPrompt = (prompt: string) => {
    setInput(prompt);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleAttachFiles = (files: File[]) => {
    setAttachedFiles((prev) => [...prev, ...files]);
  };

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
      const response = await chatWithAiAdvisor({ history, message: messageText, files: attachedFiles });
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
            <ScrollArea ref={listRef} className="h-full overflow-x-hidden rounded-xl bg-emerald-50/40 p-3 sm:p-4">
              <div className="min-w-0 space-y-3 overflow-x-hidden">
                {messages.map((message) => (
                  <AiAdvisorMessageBubble
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
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearHistory}
                  disabled={messages.length <= 1 || isLoading}
                >
                  Limpar historico
                </Button>
              </div>

              <div className="relative flex items-center rounded-full border border-slate-200 bg-white/80 px-3 py-2 shadow-sm">
                <AiAdvisorAttachmentButton
                  disabled={isLoading}
                  onSelectFiles={handleAttachFiles}
                />

                <AiAdvisorToolsDropdown
                  disabled={isLoading}
                  onSelectPrompt={handleSelectToolPrompt}
                />

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
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </Button>
              </div>

              {attachedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {attachedFiles.map((file) => (
                    <div
                      key={`${file.name}-${file.size}-${file.lastModified}`}
                      className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700"
                    >
                      <span className="max-w-48 truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => setAttachedFiles((prev) => prev.filter((f) => f !== file))}
                        className="rounded-full p-1 hover:bg-slate-200"
                        aria-label={`Remover ${file.name}`}
                      >
                        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
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
