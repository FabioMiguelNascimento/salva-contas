"use client";

import AiAdvisorVisualizationRenderer, { VisualizationStatus } from "@/components/dashboard/AiAdvisorVisualizationRenderer";
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
  const isAssistant = message.role === "assistant";

  return (
    <div className={`flex w-full min-w-0 ${isAssistant ? "justify-start" : "justify-end"}`}>
      <div
        className={`${
          isAssistant
            ? "w-full min-w-0 max-w-[86%]"
            : "w-auto max-w-[72%] sm:max-w-[68%]"
        } overflow-x-hidden rounded-2xl px-3.5 py-3 ${
          isAssistant
            ? "bg-white border border-emerald-100 shadow-sm text-slate-800"
            : "bg-emerald-600 text-white shadow-sm"
        }`}
      >
        {isAssistant ? (
          <div className="prose prose-sm max-w-none break-words prose-p:my-1.5 prose-li:my-0.5 prose-headings:my-1 text-slate-800">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        ) : (
          <p className="break-words text-sm leading-relaxed">{message.content}</p>
        )}

        {message.attachments?.length ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.attachments.map((attachment) => (
              <div key={attachment.url} className="relative w-24 overflow-hidden rounded-xl border border-slate-200 bg-white">
                {attachment.type.startsWith("image/") ? (
                  <img src={attachment.url} alt={attachment.name} className="h-24 w-24 object-cover" />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center text-xs text-slate-500">{attachment.name}</div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1 py-0.5 text-[10px] text-white">{attachment.name}</div>
              </div>
            ))}
          </div>
        ) : null}

        {isAssistant &&
          (message.visualizations || []).map((visual, index) => (
            <AiAdvisorVisualizationRenderer
              key={`${message.id}-${visual.toolName}-${index}`}
              visualization={visual}
              status={message.visualizationStatuses?.[String(index)] ?? "idle"}
              onConfirmVisualization={(preparedPayload) => onConfirmVisualization(message.id, index, preparedPayload)}
              onCancelVisualization={() => onCancelVisualization(message.id, index)}
            />
          ))}
      </div>
    </div>
  );
}
