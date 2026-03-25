import {
  GoogleGenerativeAI,
} from '@google/generative-ai';
import type {
  Content,
  Part,
} from '@google/generative-ai';
import type {
  AIProvider,
  ChatCompletionOptions,
  ChatCompletionResponse,
  ChatCompletionChunk,
  Message,
} from '../types';

export class GeminiProvider implements AIProvider {
  id = 'google';
  name = 'Google Gemini';
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  private mapMessagesToGemini(messages: Message[]): Content[] {
    return messages.map((m) => {
      let parts: Part[] = [];
      if (typeof m.content === 'string') {
        parts.push({ text: m.content });
      } else {
        parts = m.content.map((c) => {
          if (c.type === 'text') {
            return { text: c.text || '' };
          } else if (c.type === 'image' && c.image) {
            return {
              inlineData: {
                data: c.image.inlineData.data,
                mimeType: c.image.inlineData.mimeType,
              },
            };
          }
          return { text: '' };
        });
      }

      return {
        role: m.role === 'assistant' ? 'model' : 'user',
        parts,
      };
    });
  }

  async chat(options: ChatCompletionOptions): Promise<ChatCompletionResponse> {
    const model = this.genAI.getGenerativeModel({
      model: options.model,
      systemInstruction: options.systemPrompt,
      tools: options.tools ? [{ functionDeclarations: options.tools }] : undefined,
    });

    const geminiMessages = this.mapMessagesToGemini(options.messages);
    const lastMessage = geminiMessages.pop();
    const history = geminiMessages;

    const chatSession = model.startChat({
      history,
      generationConfig: {
        temperature: options.temperature,
        topP: options.topP,
        maxOutputTokens: options.maxTokens,
      },
    });

    if (!lastMessage) {
      throw new Error('No messages provided');
    }

    const result = await chatSession.sendMessage(lastMessage.parts);
    const response = await result.response;
    const text = response.text();
    const functionCalls = response.functionCalls();

    return {
      id: Math.random().toString(36).substring(7),
      content: text,
      finish_reason: functionCalls && functionCalls.length > 0 ? 'tool_calls' : 'stop',
      tool_calls: functionCalls,
    };
  }

  async *streamChat(
    options: ChatCompletionOptions
  ): AsyncGenerator<ChatCompletionChunk> {
    const model = this.genAI.getGenerativeModel({
      model: options.model,
      systemInstruction: options.systemPrompt,
      tools: options.tools ? [{ functionDeclarations: options.tools }] : undefined,
    });

    const geminiMessages = this.mapMessagesToGemini(options.messages);
    const lastMessage = geminiMessages.pop();
    const history = geminiMessages;

    const chatSession = model.startChat({
      history,
      generationConfig: {
        temperature: options.temperature,
        topP: options.topP,
        maxOutputTokens: options.maxTokens,
      },
    });

    if (!lastMessage) {
      throw new Error('No messages provided');
    }

    const result = await chatSession.sendMessageStream(lastMessage.parts);
    const id = Math.random().toString(36).substring(7);

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      yield {
        id,
        choices: [
          {
            delta: {
              content: chunkText,
            },
            finish_reason: null,
          },
        ],
      };
    }

    const response = await result.response;
    const functionCalls = response.functionCalls();

    yield {
      id,
      choices: [
        {
          delta: {
            tool_calls: functionCalls && functionCalls.length > 0 ? functionCalls : undefined,
          },
          finish_reason: functionCalls && functionCalls.length > 0 ? 'tool_calls' : 'stop',
        },
      ],
    };
  }
}
