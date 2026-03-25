import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Message } from '../ai/types';

export interface ChatThread {
  id: string;
  agentId: string;
  messages: Message[];
  title: string;
  createdAt: number;
}

interface MessageState {
  threads: ChatThread[];
  activeThreadId: string | null;
  addThread: (thread: Omit<ChatThread, 'id' | 'createdAt'>) => string;
  addMessage: (threadId: string, message: Message) => void;
  updateLastMessage: (threadId: string, content: string) => void;
  setActiveThread: (id: string | null) => void;
}

export const useMessageStore = create<MessageState>()(
  persist(
    (set) => ({
      threads: [],
      activeThreadId: null,
      addThread: (thread) => {
        const id = Math.random().toString(36).substring(7);
        set((state) => ({
          threads: [
            ...state.threads,
            { ...thread, id, createdAt: Date.now() },
          ],
        }));
        return id;
      },
      addMessage: (threadId, message) =>
        set((state) => ({
          threads: state.threads.map((t) =>
            t.id === threadId ? { ...t, messages: [...t.messages, message] } : t
          ),
        })),
      updateLastMessage: (threadId, content) =>
        set((state) => ({
          threads: state.threads.map((t) => {
            if (t.id === threadId) {
              const messages = [...t.messages];
              const last = messages[messages.length - 1];
              if (last && last.role === 'assistant') {
                messages[messages.length - 1] = { ...last, content };
              }
              return { ...t, messages };
            }
            return t;
          }),
        })),
      setActiveThread: (id) => set({ activeThreadId: id }),
    }),
    {
      name: 'message-storage',
    }
  )
);
