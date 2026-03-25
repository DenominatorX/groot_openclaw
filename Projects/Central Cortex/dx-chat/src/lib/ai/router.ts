import { GeminiProvider } from './providers/gemini';
import type { AIProvider, ChatCompletionOptions, ChatCompletionChunk, ChatCompletionResponse } from './types';
import { useConfigStore } from './config';

class ModelRouter implements AIProvider {
  id = 'router';
  name = 'Model Router';

  private getProvider(model: string): AIProvider {
    const config = useConfigStore.getState().config;

    if (model.startsWith('gemini-')) {
      if (!config.googleKey) {
        throw new Error('Google API key not configured');
      }
      return new GeminiProvider(config.googleKey);
    }

    // Default or Fallback
    throw new Error(`No provider found for model: ${model}`);
  }

  async chat(options: ChatCompletionOptions): Promise<ChatCompletionResponse> {
    try {
      const provider = this.getProvider(options.model);
      return await provider.chat(options);
    } catch (error) {
      if (options.fallbackModel) {
        console.warn(`Falling back from ${options.model} to ${options.fallbackModel} due to error:`, error);
        const provider = this.getProvider(options.fallbackModel);
        return await provider.chat({ ...options, model: options.fallbackModel, fallbackModel: undefined });
      }
      throw error;
    }
  }

  async *streamChat(options: ChatCompletionOptions): AsyncGenerator<ChatCompletionChunk> {
    try {
      const provider = this.getProvider(options.model);
      yield* provider.streamChat(options);
    } catch (error) {
      if (options.fallbackModel) {
        console.warn(`Falling back from ${options.model} to ${options.fallbackModel} due to error:`, error);
        const provider = this.getProvider(options.fallbackModel);
        yield* provider.streamChat({ ...options, model: options.fallbackModel, fallbackModel: undefined });
      } else {
        throw error;
      }
    }
  }
}

export const aiRouter = new ModelRouter();
