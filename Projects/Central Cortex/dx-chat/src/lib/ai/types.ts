export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

export interface MessageContent {
  type: 'text' | 'image';
  text?: string;
  image?: {
    inlineData: {
      data: string;
      mimeType: string;
    };
  };
}

export interface Message {
  role: MessageRole;
  content: string | MessageContent[];
}

export interface ChatCompletionOptions {
  model: string;
  fallbackModel?: string;
  messages: Message[];
  stream?: boolean;
  systemPrompt?: string;
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  tools?: any[];
}

export interface ChatCompletionChunk {
  id: string;
  choices: {
    delta: {
      content?: string;
      tool_calls?: any[];
    };
    finish_reason: string | null;
  }[];
}

export interface ChatCompletionResponse {
  id: string;
  content: string;
  finish_reason: string;
  tool_calls?: any[];
}

export interface AIProvider {
  id: string;
  name: string;
  chat(options: ChatCompletionOptions): Promise<ChatCompletionResponse>;
  streamChat(options: ChatCompletionOptions): AsyncGenerator<ChatCompletionChunk>;
}
