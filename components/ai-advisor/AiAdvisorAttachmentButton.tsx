"use client";

import { useRef } from 'react';
import { Button } from '../ui/button';

type AiAdvisorAttachmentButtonProps = {
  disabled?: boolean;
  onSelectFiles: (files: File[]) => void;
};

export default function AiAdvisorAttachmentButton({
  disabled = false,
  onSelectFiles,
}: AiAdvisorAttachmentButtonProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        multiple
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          if (files.length === 0) return;
          onSelectFiles(files);
          event.target.value = '';
        }}
      />

      <Button
        type="button"
        variant="ghost"
        disabled={disabled}
        className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => fileInputRef.current?.click()}
        title="Adicionar imagem"
        aria-label="Adicionar imagem"
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </Button>
    </>
  );
}
