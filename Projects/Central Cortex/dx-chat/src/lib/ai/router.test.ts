import { describe, it, expect, vi, beforeEach } from 'vitest';
import { aiRouter } from './router';
import { useConfigStore } from './config';
import { GeminiProvider } from './providers/gemini';

// Mock the GeminiProvider
vi.mock('./providers/gemini', () => {
  return {
    GeminiProvider: class {
      chat = vi.fn().mockResolvedValue({ content: 'Mocked Response' });
      async *streamChat() {
        yield { choices: [{ delta: { content: 'Mocked' }, finish_reason: null }] };
        yield { choices: [{ delta: { content: ' Stream' }, finish_reason: 'stop' }] };
      }
    }
  };
});

describe('ModelRouter Fallback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fallback if primary model fails', async () => {
    // I need to make sure config.googleKey is set so GeminiProvider doesn't throw on its own.
    useConfigStore.getState().setConfig({ googleKey: 'valid-key' });

    const result = await aiRouter.chat({
      model: 'unknown-model',
      fallbackModel: 'gemini-pro',
      messages: [],
    });
    
    expect(result.content).toBe('Mocked Response');
  });

  it('should fallback in streamChat', async () => {
    useConfigStore.getState().setConfig({ googleKey: 'valid-key' });
    
    const chunks = [];
    for await (const chunk of aiRouter.streamChat({
      model: 'unknown-model',
      fallbackModel: 'gemini-pro',
      messages: [],
    })) {
      chunks.push(chunk);
    }
    
    expect(chunks.length).toBe(2);
    expect(chunks[0].choices[0].delta.content).toBe('Mocked');
  });
});
