export type VisualizationStatus = 'idle' | 'confirming' | 'confirmed' | 'cancelled';

export type AiVisualizationType = 'chart_donut' | 'chart_line' | 'table_summary' | 'transaction' | 'transaction_diff';

export interface AiVisualization {
  type: AiVisualizationType;
  toolName: string;
  title: string;
  payload: Record<string, any>;
}

export interface ChatAttachment {
  name: string;
  url: string;
  type: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  visualizations?: AiVisualization[];
  visualizationStatuses?: Record<string, VisualizationStatus>;
  attachments?: ChatAttachment[];
}

export interface AiAdvisorChatHistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AiAdvisorChatResponse {
  message: string;
  toolCalls: string[];
  visualization: AiVisualization | null;
  visualizations: AiVisualization[];
}