import { create } from 'zustand';
import * as db from '../db/messages';
import type { Message } from '../ai/types';

export interface ChatThread {
  id: string;
  agentId: string;
  messages: Message[];
  title: string;
  createdAt: number;
  hasMore: boolean;
  currentPage: number;
}

interface MessageState {
  threads: ChatThread[];
  activeThreadId: string | null;
  isLoaded: boolean;

  loadThreads: () => Promise<void>;
  addThread: (thread: Omit<ChatThread, 'id' | 'createdAt' | 'hasMore' | 'currentPage'>) => Promise<string>;
  archiveThread: (threadId: string) => Promise<void>;
  setActiveThread: (id: string | null) => void;

  addMessage: (threadId: string, message: Message) => Promise<string>;
  /** In-memory only — call every streaming chunk. */
  updateLastMessage: (threadId: string, content: string) => void;
  /** Flush final assistant message to DB after streaming completes. */
  persistLastMessage: (threadId: string) => Promise<void>;

  loadMoreMessages: (threadId: string) => Promise<void>;
  searchMessages: (query: string) => Promise<db.SearchResult[]>;
  exportThread: (threadId: string, format: 'json' | 'markdown') => Promise<string>;
}

function randomId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export const useMessageStore = create<MessageState>((set, get) => ({
  threads: [],
  activeThreadId: null,
  isLoaded: false,

  loadThreads: async () => {
    const dbThreads = await db.getAllThreads();
    const threads: ChatThread[] = await Promise.all(
      dbThreads.map(async (t) => {
        const msgs = await db.getThreadMessages(t.id, 0);
        return {
          id: t.id,
          agentId: t.agentId,
          title: t.title,
          createdAt: t.createdAt,
          messages: msgs.map((m) => ({ role: m.role as Message['role'], content: m.content })),
          hasMore: msgs.length === db.PAGE_SIZE,
          currentPage: 0,
        };
      }),
    );
    set({ threads, isLoaded: true });
  },

  addThread: async (thread) => {
    const id = randomId();
    await db.createThread({ id, agentId: thread.agentId, title: thread.title });
    const newThread: ChatThread = {
      ...thread,
      id,
      createdAt: Date.now(),
      hasMore: false,
      currentPage: 0,
    };
    set((state) => ({ threads: [newThread, ...state.threads] }));
    return id;
  },

  archiveThread: async (threadId) => {
    await db.archiveThread(threadId);
    set((state) => ({
      threads: state.threads.filter((t) => t.id !== threadId),
      activeThreadId: state.activeThreadId === threadId ? null : state.activeThreadId,
    }));
  },

  setActiveThread: (id) => set({ activeThreadId: id }),

  addMessage: async (threadId, message) => {
    const id = randomId();
    await db.addMessage(threadId, { ...message, id });
    set((state) => ({
      threads: state.threads.map((t) =>
        t.id === threadId ? { ...t, messages: [...t.messages, message] } : t,
      ),
    }));
    return id;
  },

  updateLastMessage: (threadId, content) => {
    set((state) => ({
      threads: state.threads.map((t) => {
        if (t.id !== threadId) return t;
        const messages = [...t.messages];
        const last = messages[messages.length - 1];
        if (last?.role === 'assistant') {
          messages[messages.length - 1] = { ...last, content };
        }
        return { ...t, messages };
      }),
    }));
  },

  persistLastMessage: async (threadId) => {
    const thread = get().threads.find((t) => t.id === threadId);
    if (!thread) return;
    const last = thread.messages[thread.messages.length - 1];
    if (last?.role === 'assistant' && typeof last.content === 'string') {
      await db.persistLastAssistantMessage(threadId, last.content);
    }
  },

  loadMoreMessages: async (threadId) => {
    const thread = get().threads.find((t) => t.id === threadId);
    if (!thread?.hasMore) return;
    const nextPage = thread.currentPage + 1;
    const msgs = await db.getThreadMessages(threadId, nextPage);
    set((state) => ({
      threads: state.threads.map((t) => {
        if (t.id !== threadId) return t;
        return {
          ...t,
          messages: [
            ...msgs.map((m) => ({ role: m.role as Message['role'], content: m.content })),
            ...t.messages,
          ],
          hasMore: msgs.length === db.PAGE_SIZE,
          currentPage: nextPage,
        };
      }),
    }));
  },

  searchMessages: (query) => db.searchMessages(query),

  exportThread: (threadId, format) => db.exportThread(threadId, format),
}));
