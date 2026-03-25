import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GeminiProvider } from './gemini';

// Mock the Google AI SDK
vi.mock('@google/generative-ai', () => {
  const sendMessageMock = vi.fn().mockResolvedValue({
    response: {
      text: () => 'Hello, I am Gemini!',
      functionCalls: () => [],
    },
  });

  const sendMessageStreamMock = vi.fn().mockResolvedValue({
    stream: [
      { text: () => 'Hello,' },
      { text: () => ' I am' },
      { text: () => ' Gemini!' },
    ],
    response: Promise.resolve({
      functionCalls: () => [],
    }),
  });

  const startChatMock = vi.fn().mockReturnValue({
    sendMessage: sendMessageMock,
    sendMessageStream: sendMessageStreamMock,
  });

  const getGenerativeModelMock = vi.fn().mockReturnValue({
    startChat: startChatMock,
  });

  return {
    GoogleGenerativeAI: vi.fn().mockImplementation(function() {
      return {
        getGenerativeModel: getGenerativeModelMock,
      };
    }),
    HarmCategory: {},
    HarmBlockThreshold: {},
  };
});

describe('GeminiProvider', () => {
  let provider: GeminiProvider;

  beforeEach(() => {
    provider = new GeminiProvider('fake-api-key');
  });

  it('should call chat and return a response', async () => {
    const response = await provider.chat({
      model: 'gemini-1.5-pro',
      messages: [{ role: 'user', content: 'Hello' }],
    });

    expect(response.content).toBe('Hello, I am Gemini!');
  });

  it('should call streamChat and yield chunks', async () => {
    const chunks = [];
    for await (const chunk of provider.streamChat({
      model: 'gemini-1.5-pro',
      messages: [{ role: 'user', content: 'Hello' }],
    })) {
      chunks.push(chunk);
    }

    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[0].choices[0].delta.content).toBe('Hello,');
    expect(chunks[chunks.length - 1].choices[0].finish_reason).toBe('stop');
  });
});
