"use client";

import { chatWithAiAdvisor } from '@/services/ai-advisor';
import { confirmTransaction, updateTransaction } from '@/services/transactions';
import type {
    AiAdvisorChatHistoryMessage,
    ChatAttachment,
    ChatMessage
} from '@/types/ai-advisor';
import type { UpdateTransactionPayload } from '@/types/finance';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

const INITIAL_ASSISTANT_MESSAGE = {
  id: 'seed-1',
  role: 'assistant',
  content:
    'Oi! Eu sou o Boletinho, seu assistente financeiro. Pergunte algo sobre suas finanças para começar.',
} satisfies ChatMessage;

const UPDATE_TRANSACTION_KEYS: Array<keyof UpdateTransactionPayload> = [
  'amount',
  'description',
  'categoryId',
  'type',
  'status',
  'dueDate',
  'paymentDate',
  'creditCardId',
  'debitCardId',
  'splits',
];

type UseAiChatParams = {
  month: number;
  year: number;
};

const sanitizeStoredMessages = (messages: ChatMessage[]) =>
  messages.map(({ attachments, ...message }) => message);

const buildHistory = (messages: ChatMessage[]): AiAdvisorChatHistoryMessage[] =>
  messages
    .filter(
      (message) =>
        message.id !== INITIAL_ASSISTANT_MESSAGE.id &&
        !message.content.startsWith('[SISTEMA]:'),
    )
    .map((message) => ({ role: message.role, content: message.content }));

const cleanObject = (value: Record<string, any>) =>
  Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== null && item !== undefined),
  );

const buildUpdateTransactionPayload = (payload: Record<string, any>) => {
  const normalized = Object.fromEntries(
    UPDATE_TRANSACTION_KEYS.flatMap((key) => {
      const value = payload?.[key];

      if (value === null || value === undefined) {
        return [];
      }

      if (key === 'splits' && Array.isArray(value)) {
        if (value.length === 0) {
          return [];
        }

        return [
          [
            key,
            value.map((split: Record<string, any>) => {
              const { id: _id, creditCard: _creditCard, debitCard: _debitCard, ...rest } =
                split ?? {};
              return cleanObject(rest);
            }),
          ],
        ];
      }

      return [[key, value]];
    }),
  );

  return normalized as UpdateTransactionPayload;
};

export function useAiChat({ month, year }: UseAiChatParams) {
  const storageKey = useMemo(() => `ai-advisor-messages-${month}-${year}`, [month, year]);
  const initialMessages = useMemo<ChatMessage[]>(() => [INITIAL_ASSISTANT_MESSAGE], []);

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window === 'undefined') {
      return initialMessages;
    }

    try {
      const stored = sessionStorage.getItem(storageKey);
      if (!stored) {
        return initialMessages;
      }

      const parsed = JSON.parse(stored) as ChatMessage[];
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : initialMessages;
    } catch {
      return initialMessages;
    }
  });

  const messagesRef = useRef(messages);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [input, setInput] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'waiting'>('idle');

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    sessionStorage.setItem(storageKey, JSON.stringify(sanitizeStoredMessages(messages)));
  }, [messages, storageKey]);

  const handleClearHistory = useCallback(() => {
    setMessages(initialMessages);
    setInput('');
    setAttachedFiles([]);
    setStatus('idle');
    setIsLoading(false);

    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(storageKey);
    }

    toast.success('Histórico do assistente limpo para esta sessão.');
  }, [initialMessages, storageKey]);

  const handleSelectToolPrompt = useCallback((prompt: string) => {
    setInput(prompt);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  const handleAttachFiles = useCallback((files: File[]) => {
    setAttachedFiles((currentFiles) => [...currentFiles, ...files]);
  }, []);

  const handleConfirmVisualization = useCallback(
    async (messageId: string, index: number, payload: any) => {
      const currentMessage = messagesRef.current.find((message) => message.id === messageId);
      const visualization = currentMessage?.visualizations?.[index];
      const toolName = visualization?.toolName;

      if (!visualization) {
        toast.error('Não foi possível localizar a visualização para confirmação.');
        return;
      }

      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.id === messageId
            ? {
                ...message,
                visualizationStatuses: {
                  ...(message.visualizationStatuses ?? {}),
                  [index]: 'confirming',
                },
              }
            : message,
        ),
      );

      try {
        if (toolName === 'update_transaction') {
          const transactionId = payload?.transactionId ?? payload?.id;

          if (!transactionId) {
            throw new Error('Não foi possível identificar a transação para atualizar.');
          }

          const updatePayload = buildUpdateTransactionPayload(payload ?? {});
          const confirmed = await updateTransaction(transactionId, updatePayload);

          toast.success('Atualização realizada com sucesso.');

          setMessages((currentMessages) =>
            currentMessages.map((message) =>
              message.id === messageId
                ? {
                    ...message,
                    visualizationStatuses: {
                      ...(message.visualizationStatuses ?? {}),
                      [index]: 'confirmed',
                    },
                    visualizations: message.visualizations?.map((visualizationItem, visualIndex) =>
                      visualIndex === index
                        ? {
                            ...visualizationItem,
                            payload: {
                              ...(visualizationItem.payload as Record<string, any>),
                              ...confirmed,
                              requiresConfirmation: false,
                              transactionId,
                            },
                          }
                        : visualizationItem,
                    ),
                  }
                : message,
            ),
          );

          const systemMessage: ChatMessage = {
            id: `system-${Date.now()}`,
            role: 'user',
            content:
              `[SISTEMA]: A transação foi atualizada pelo usuário e salva no banco. ` +
              `O ID oficial é: ${confirmed.id}. Caso o usuário peça detalhes a partir de agora, use este ID.`,
          };

          setMessages((currentMessages) => [...currentMessages, systemMessage]);
          return;
        }

        const confirmed = await confirmTransaction(payload);
        const confirmedCount = Array.isArray(confirmed) ? confirmed.length : 1;

        toast.success(`Confirmação realizada: ${confirmedCount} transação(ões).`);

        setMessages((currentMessages) =>
          currentMessages.map((message) =>
            message.id === messageId
              ? {
                  ...message,
                  visualizationStatuses: {
                    ...(message.visualizationStatuses ?? {}),
                    [index]: 'confirmed',
                  },
                }
              : message,
          ),
        );

        const transactionIds = Array.isArray(confirmed) ? confirmed.map((transaction) => transaction.id) : [confirmed.id];
        const systemMessage: ChatMessage = {
          id: `system-${Date.now()}`,
          role: 'user',
          content:
            `[SISTEMA]: A transação pendente acabou de ser confirmada pelo usuário e salva no banco. ` +
            `O ID oficial gerado é: ${transactionIds.join(', ')}. Caso o usuário peça detalhes a partir de agora, use este ID.`,
        };

        setMessages((currentMessages) => [...currentMessages, systemMessage]);
      } catch (error: any) {
        toast.error(error?.message || 'Falha ao confirmar transação. Tente novamente.');

        setMessages((currentMessages) =>
          currentMessages.map((message) =>
            message.id === messageId
              ? {
                  ...message,
                  visualizationStatuses: {
                    ...(message.visualizationStatuses ?? {}),
                    [index]: 'idle',
                  },
                }
              : message,
          ),
        );
      }
    },
    [],
  );

  const handleCancelVisualization = useCallback((messageId: string, index: number) => {
    setMessages((currentMessages) =>
      currentMessages.map((message) =>
        message.id === messageId
          ? {
              ...message,
              visualizationStatuses: {
                ...(message.visualizationStatuses ?? {}),
                [index]: 'cancelled',
              },
            }
          : message,
      ),
    );

    toast('Operação cancelada.');
  }, []);

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();

    if (!trimmed && attachedFiles.length === 0) {
      return;
    }

    if (isLoading) {
      return;
    }

    const messageText = trimmed || 'Envio de anexo';
    const history = buildHistory(messagesRef.current);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText,
      attachments: attachedFiles.map((file): ChatAttachment => ({
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type,
      })),
    };

    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setInput('');
    setAttachedFiles([]);
    setIsLoading(true);
    setStatus('sending');

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

      setMessages((currentMessages) => [...currentMessages, assistantMessage]);
    } catch (error: any) {
      toast.error(error?.message || 'Não foi possível conversar com o assistente agora.');
    } finally {
      setStatus('idle');
      setIsLoading(false);
    }
  }, [attachedFiles, input, isLoading]);

  return {
    attachedFiles,
    handleAttachFiles,
    handleCancelVisualization,
    handleClearHistory,
    handleConfirmVisualization,
    handleSelectToolPrompt,
    input,
    inputRef,
    isLoading,
    messages,
    sendMessage,
    setAttachedFiles,
    setInput,
    status,
  };
}