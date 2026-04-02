"use client";

import AiAdvisorAttachmentButton from '@/components/ai-advisor/AiAdvisorAttachmentButton';
import AiAdvisorToolsDropdown from '@/components/ai-advisor/AiAdvisorToolsDropdown';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { KeyboardEvent, RefObject } from 'react';

type ChatInputAreaProps = {
  input: string;
  inputRef: RefObject<HTMLInputElement | null>;
  attachedFiles: File[];
  isLoading: boolean;
  onChange: (value: string) => void;
  onSend: () => void;
  onSelectFiles: (files: File[]) => void;
  onSelectPrompt: (prompt: string) => void;
  onRemoveAttachment: (file: File) => void;
};

export default function ChatInputArea({
  input,
  inputRef,
  attachedFiles,
  isLoading,
  onChange,
  onSend,
  onSelectFiles,
  onSelectPrompt,
  onRemoveAttachment,
}: ChatInputAreaProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSend();
    }
  };

  return (
    <div className="bg-white/70 p-2 sm:p-3">
      <div className="flex flex-col gap-2">
        <div className="relative flex items-center rounded-full border border-slate-200 bg-white/80 px-3 py-2 shadow-sm">
          <AiAdvisorAttachmentButton disabled={isLoading} onSelectFiles={onSelectFiles} />

          <AiAdvisorToolsDropdown disabled={isLoading} onSelectPrompt={onSelectPrompt} />

          <Input
            ref={inputRef}
            value={input}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pergunte algo sobre suas finanças..."
            className="flex-1 border-none bg-transparent p-0 pl-2 pr-10 text-sm placeholder:text-slate-400 focus-visible:border-slate-300 focus-visible:outline-none focus-visible:ring-0"
          />

          <Button
            onClick={onSend}
            disabled={isLoading || (!input.trim() && attachedFiles.length === 0)}
            size="icon"
            aria-label="Enviar mensagem"
            className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-slate-400"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
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
                  onClick={() => onRemoveAttachment(file)}
                  className="rounded-full p-1 hover:bg-slate-200"
                  aria-label={`Remover ${file.name}`}
                >
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}