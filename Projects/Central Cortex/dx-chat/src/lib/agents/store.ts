import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AgentProfile {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  soul: string;
  personality: string[];
  defaultModel: string;
  fallbackModel?: string;
  systemPrompt: string;
  customInstructions?: string;
  knowledgeBase?: string;
  modelParams?: {
    temperature?: number;
    topP?: number;
    maxTokens?: number;
  };
  status: 'online' | 'offline' | 'away';
}

interface AgentState {
  agents: AgentProfile[];
  activeAgentId: string | null;
  addAgent: (agent: Omit<AgentProfile, 'id'>) => void;
  updateAgent: (id: string, agent: Partial<AgentProfile>) => void;
  deleteAgent: (id: string) => void;
  setActiveAgent: (id: string | null) => void;
}

export const useAgentStore = create<AgentState>()(
  persist(
    (set) => ({
      agents: [
        {
          id: 'gemini-pro',
          name: 'Gemini Pro',
          role: 'AI Assistant',
          soul: 'A helpful and knowledgeable AI assistant powered by Google Gemini.',
          personality: ['helpful', 'concise', 'accurate'],
          defaultModel: 'gemini-1.5-pro',
          systemPrompt: 'You are a helpful AI assistant.',
          status: 'online',
        },
        {
          id: 'gemini-flash',
          name: 'Gemini Flash',
          role: 'Speedy Assistant',
          soul: 'A fast and efficient AI assistant optimized for speed.',
          personality: ['fast', 'efficient', 'direct'],
          defaultModel: 'gemini-1.5-flash',
          systemPrompt: 'You are a fast and efficient AI assistant.',
          status: 'online',
        },
      ],
      activeAgentId: 'gemini-pro',
      addAgent: (agent) =>
        set((state) => ({
          agents: [
            ...state.agents,
            { ...agent, id: Math.random().toString(36).substring(7) },
          ],
        })),
      updateAgent: (id, agent) =>
        set((state) => ({
          agents: state.agents.map((a) =>
            a.id === id ? { ...a, ...agent } : a
          ),
        })),
      deleteAgent: (id) =>
        set((state) => ({
          agents: state.agents.filter((a) => a.id !== id),
        })),
      setActiveAgent: (id) => set({ activeAgentId: id }),
    }),
    {
      name: 'agent-storage',
    }
  )
);
