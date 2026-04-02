"use client";

import AiAdvisorVisualizationRenderer from "@/components/ai-advisor/AiAdvisorVisualizationRenderer";
import { VisualizationStatus } from "@/components/ai-advisor/visualizations/types";
import UserInitials from "@/components/ui/user-initials";
import { useAuth } from "@/hooks/use-auth";
import { AiVisualization } from "@/types/finance";
import ReactMarkdown from "react-markdown";

type ChatAttachment = {
  name: string;
  url: string;
  type: string;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  visualizations?: AiVisualization[];
  visualizationStatuses?: Record<string, VisualizationStatus>;
  attachments?: ChatAttachment[];
};

interface MessageBubbleProps {
  message: ChatMessage;
  onConfirmVisualization: (messageId: string, index: number, payload: any) => Promise<void>;
  onCancelVisualization: (messageId: string, index: number) => void;
}

export default function AiAdvisorMessageBubble({
  message,
  onConfirmVisualization,
  onCancelVisualization,
}: MessageBubbleProps) {
  if (message.content.startsWith("[SISTEMA]:")) {
    return null;
  }

  const isAssistant = message.role === "assistant";
  const { user } = useAuth();

  return (
    <div className={`flex w-full ${isAssistant ? "justify-start" : "justify-end"} items-end gap-2 mb-4`}>
      {isAssistant && (
        <UserInitials name="Boletinho" className="h-8 w-8" />
      )}
      
      <div
        className={`relative max-w-[85%] sm:max-w-[75%] px-4 py-2.5 shadow-sm ${
          isAssistant
            ? "bg-white border border-emerald-100 text-slate-800 rounded-2xl rounded-bl-none"
            : "bg-emerald-600 text-white rounded-2xl rounded-br-none"
        }`}
      >
        {isAssistant && (
          <div className="absolute -left-2 bottom-0 h-4 w-4 text-white">
            <svg width="100%" height="100%" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 16H0V0C0 0 2 12 16 16Z" fill="currentColor" />
              <path d="M16 16H0V0C0 0 2 12 16 16Z" fill="white" />
              <path d="M16 16H0V0C0 0 2 12 16 16Z" fill="none" stroke="#ecfdf5" strokeWidth="0.5" />
            </svg>
          </div>
        )}

        {!isAssistant && (
          <div className="absolute -right-2 bottom-0 h-4 w-4 text-emerald-600">
            <svg width="100%" height="100%" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 16H16V0C16 0 14 12 0 16Z" fill="currentColor" />
            </svg>
          </div>
        )}

        {isAssistant ? (
          <div className="prose prose-sm max-w-none wrap-break-word prose-p:my-1 prose-li:my-0.5 prose-headings:my-1 text-slate-800">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        ) : (
          <p className="wrap-break-word text-sm leading-relaxed">{message.content}</p>
        )}

        {message.attachments?.length ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.attachments.map((attachment) => (
              <div key={attachment.url} className="relative w-24 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
                {attachment.type.startsWith("image/") ? (
                  <img src={attachment.url} alt={attachment.name} className="h-24 w-24 object-cover" />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center text-xs text-slate-500">{attachment.name}</div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1 py-0.5 text-[10px] text-white backdrop-blur-xs">{attachment.name}</div>
              </div>
            ))}
          </div>
        ) : null}

        {isAssistant &&
          (message.visualizations || []).map((visual, index) => (
            <div key={`${message.id}-${visual.toolName}-${index}`} className="mt-3">
              <AiAdvisorVisualizationRenderer
                visualization={visual}
                status={message.visualizationStatuses?.[String(index)] ?? "idle"}
                onConfirmVisualization={(preparedPayload) => onConfirmVisualization(message.id, index, preparedPayload)}
                onCancelVisualization={() => onCancelVisualization(message.id, index)}
              />
            </div>
          ))}
      </div>
    </div>
  );
}
