export interface AIConfig {
  googleKey?: string;
  anthropicKey?: string;
  openaiKey?: string;
  openRouterKey?: string;
}

interface ConfigState {
  config: AIConfig;
  setConfig: (config: Partial<AIConfig>) => void;
}

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      config: {},
      setConfig: (config) => set((state) => ({ config: { ...state.config, ...config } })),
    }),
    {
      name: 'ai-config-storage',
    }
  )
);
