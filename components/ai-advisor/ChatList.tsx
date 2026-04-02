"use client";

import AiAdvisorMessageBubble from '@/components/ai-advisor/AiAdvisorMessageBubble';
import { ScrollArea } from '@/components/ui/scroll-area';
import UserInitials from '@/components/ui/user-initials';
import type { ChatMessage } from '@/types/ai-advisor';
import { useEffect, useRef } from 'react';

type ChatListProps = {
  messages: ChatMessage[];
  isLoading: boolean;
  onConfirmVisualization: (messageId: string, index: number, payload: any) => Promise<void>;
  onCancelVisualization: (messageId: string, index: number) => void;
};

export default function ChatList({
  messages,
  isLoading,
  onConfirmVisualization,
  onCancelVisualization,
}: ChatListProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    requestAnimationFrame(() => {
      viewport.scrollTop = viewport.scrollHeight;
    });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 min-h-0 p-2 sm:p-3">
      <ScrollArea
        ref={viewportRef}
        className="h-full overflow-x-hidden rounded-xl bg-emerald-50/40 p-2 sm:p-3"
      >
        <div className="min-w-0 space-y-3 overflow-x-hidden">
          {messages.map((message) => (
            <AiAdvisorMessageBubble
              key={message.id}
              message={message}
              onConfirmVisualization={onConfirmVisualization}
              onCancelVisualization={onCancelVisualization}
            />
          ))}

          {isLoading && (
            <div className="mb-4 flex w-full items-end justify-start gap-2">
              <UserInitials name="Boletinho" className="h-8 w-8 ring-white" />
              <div className="relative flex items-center gap-1 rounded-2xl rounded-bl-none border border-emerald-100 bg-white px-4 py-3 shadow-sm">
                <div className="absolute -left-2 bottom-0 h-4 w-4 text-white">
                  <svg width="100%" height="100%" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 16H0V0C0 0 2 12 16 16Z" fill="currentColor" />
                    <path d="M16 16H0V0C0 0 2 12 16 16Z" fill="white" />
                    <path d="M16 16H0V0C0 0 2 12 16 16Z" fill="none" stroke="#ecfdf5" strokeWidth="0.5" />
                  </svg>
                </div>
                <span className="h-1.5 w-1.5 animate-typing-dot rounded-full bg-emerald-600" />
                <span className="delay-200 h-1.5 w-1.5 animate-typing-dot rounded-full bg-emerald-600" />
                <span className="delay-400 h-1.5 w-1.5 animate-typing-dot rounded-full bg-emerald-600" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}