"use client";

import ChatInputArea from '@/components/ai-advisor/ChatInputArea';
import ChatList from '@/components/ai-advisor/ChatList';
import { useAiChat } from '@/components/ai-advisor/hooks/useAiChat';
import { Button } from '@/components/ui/button';

interface AiAdvisorCardProps {
  month: number;
  year: number;
}

export default function AiAdvisorCard({ month, year }: AiAdvisorCardProps) {
  const {
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
  } = useAiChat({ month, year });

  const handleRemoveAttachment = (file: File) => {
    setAttachedFiles((currentFiles) => currentFiles.filter((attachedFile) => attachedFile !== file));
  };

  return (
    <div className="flex h-full min-h-0 flex-col rounded-xl bg-linear-to-b from-emerald-50/60 to-white">
      <ChatList
        messages={messages}
        isLoading={isLoading}
        onConfirmVisualization={handleConfirmVisualization}
        onCancelVisualization={handleCancelVisualization}
      />

      <div className="bg-white/70 px-2 pb-0 pt-2 sm:px-3">
        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClearHistory}
            disabled={messages.length <= 1 || isLoading}
          >
            Limpar histórico
          </Button>
        </div>
      </div>

      <ChatInputArea
        input={input}
        inputRef={inputRef}
        attachedFiles={attachedFiles}
        isLoading={isLoading}
        onChange={setInput}
        onSend={sendMessage}
        onSelectFiles={handleAttachFiles}
        onSelectPrompt={handleSelectToolPrompt}
        onRemoveAttachment={handleRemoveAttachment}
      />
    </div>
  );
}