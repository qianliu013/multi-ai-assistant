// 共享类型定义

export type AIProvider = 'chatgpt' | 'claude' | 'gemini';

export type ConversationMode = 'continue' | 'new';

export interface AITabStatus {
  [key: string]: boolean;
  chatgpt: boolean;
  claude: boolean;
  gemini: boolean;
}

export interface SendMessageRequest {
  action: 'sendToAIs';
  message: string;
  selectedAIs: AIProvider[];
  conversationMode: ConversationMode;
}

export interface CheckTabsRequest {
  action: 'checkAITabs';
}

export interface SendResultMessage {
  action: 'sendResult';
  ai: AIProvider;
  success: boolean;
  error?: string;
}

export interface PopupSettings {
  selectedAIs: AIProvider[];
  conversationMode: ConversationMode;
}

export interface MessageResponse {
  success: boolean;
  error?: string;
  tabStatus?: AITabStatus;
}

// Content Script 消息类型
export interface ContentMessage {
  action: 'sendMessage';
  message: string;
  conversationMode: ConversationMode;
}

export interface ContentResponse {
  success: boolean;
  error?: string;
  result?: any;
}

// AI 适配器接口
export interface AIAdapter {
  name: string;
  initialize(): Promise<void>;
  sendMessage(message: string, conversationMode: ConversationMode): Promise<ContentResponse>;
}

// AI 选择器配置
export interface AISelectors {
  inputBox: string;
  sendButton: string;
  newChatButton?: string;
  messageContainer?: string;
}

// AI 提供商 URLs
export const AI_URLS: Record<AIProvider, string> = {
  chatgpt: 'https://chat.openai.com',
  claude: 'https://claude.ai',
  gemini: 'https://gemini.google.com'
};

// AI 提供商显示名称
export const AI_DISPLAY_NAMES: Record<AIProvider, string> = {
  chatgpt: 'ChatGPT',
  claude: 'Claude',
  gemini: 'Gemini'
};