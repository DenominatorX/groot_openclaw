import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAgentStore } from '../lib/agents/store';
import { useMessageStore } from '../lib/messages/store';
import { useSoundStore } from '../lib/sounds/store';
import { playSound, type SoundName } from '../lib/sounds/engine';
import { showNotification, isWindowFocused } from '../lib/notifications/engine';
import { aiRouter } from '../lib/ai/router';
import { Send, User, Bot, Settings, Plus, Edit2, Bell, Search, Download, Archive, ChevronUp } from 'lucide-react';
import { SettingsModal } from './SettingsModal';
import { AgentEditorModal } from './AgentEditorModal';
import { NotificationSettingsModal } from './NotificationSettingsModal';
import type { SearchResult } from '../lib/db/messages';

export const Chat: React.FC = () => {
  const { agents, activeAgentId, setActiveAgent } = useAgentStore();
  const {
    threads,
    activeThreadId,
    isLoaded,
    loadThreads,
    addThread,
    addMessage,
    updateLastMessage,
    persistLastMessage,
    setActiveThread,
    archiveThread,
    loadMoreMessages,
    searchMessages,
    exportThread,
  } = useMessageStore();
  const soundStore = useSoundStore();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotifSettingsOpen, setIsNotifSettingsOpen] = useState(false);
  const [editingAgentId, setEditingAgentId] = useState<string | null>(null);
  const [isAgentEditorOpen, setIsAgentEditorOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const activeAgent = agents.find((a) => a.id === activeAgentId) || agents[0];
  const activeThread = threads.find((t) => t.id === activeThreadId);

  // Load persisted threads on first mount
  useEffect(() => {
    if (!isLoaded) loadThreads().catch(console.error);
  }, [isLoaded, loadThreads]);

  /** Play a sound event, respecting global and per-agent settings */
  const triggerSound = useCallback((event: keyof typeof soundStore.eventSounds, agentId?: string) => {
    const state = useSoundStore.getState();
    if (!state.soundsEnabled) return;

    // Check per-agent override
    if (agentId) {
      const override = state.agentOverrides[agentId];
      if (override?.enabled === false) return;
    }

    const soundName = state.eventSounds[event];
    if (soundName === 'none') return;

    const agentVol = agentId ? state.agentOverrides[agentId]?.volume : null;
    const volume = agentVol ?? state.globalVolume;
    playSound(soundName as SoundName, volume);
  }, []);

  /** Send a desktop notification for an incoming message */
  const triggerNotification = useCallback((agentName: string, messagePreview: string) => {
    const state = useSoundStore.getState();
    if (!state.notificationsEnabled) return;
    if (state.notifyOnlyWhenUnfocused && isWindowFocused()) return;

    showNotification({
      title: `${agentName}`,
      body: state.notificationPreview ? messagePreview.slice(0, 120) : 'New message',
      tag: `dx-chat-${agentName}`,
    });
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeThread?.messages]);

  const handleSend = async () => {
    if (!input.trim() || !activeAgent) return;

    let threadId = activeThreadId;
    if (!threadId) {
      threadId = await addThread({
        agentId: activeAgent.id,
        messages: [],
        title: input.trim().slice(0, 60) || `Chat with ${activeAgent.name}`,
      });
      setActiveThread(threadId);
    }

    const userMessage = { role: 'user' as const, content: input };
    await addMessage(threadId, userMessage);
    setInput('');
    setIsTyping(true);

    // Play send sound
    triggerSound('imSent', activeAgent.id);

    const updatedThread = useMessageStore.getState().threads.find(t => t.id === threadId);
    if (!updatedThread) return;

    try {
      const assistantMessage = { role: 'assistant' as const, content: '' };
      await addMessage(threadId, assistantMessage);

      const systemPrompt = [
        activeAgent.systemPrompt,
        activeAgent.customInstructions ? `Custom Instructions:\n${activeAgent.customInstructions}` : '',
        activeAgent.knowledgeBase ? `Knowledge Base:\n${activeAgent.knowledgeBase}` : '',
      ].filter(Boolean).join('\n\n');

      let fullContent = '';
      let notified = false;
      for await (const chunk of aiRouter.streamChat({
        model: activeAgent.defaultModel,
        fallbackModel: activeAgent.fallbackModel,
        messages: updatedThread.messages.concat(userMessage),
        systemPrompt,
        temperature: activeAgent.modelParams?.temperature,
        topP: activeAgent.modelParams?.topP,
        maxTokens: activeAgent.modelParams?.maxTokens,
      })) {
        const delta = chunk.choices[0].delta.content;
        if (delta) {
          fullContent += delta;
          updateLastMessage(threadId, fullContent);

          // Play receive sound and notify on first chunk
          if (!notified) {
            notified = true;
            triggerSound('imReceived', activeAgent.id);
            triggerNotification(activeAgent.name, fullContent);
          }
        }
      }
    } catch (error) {
      console.error(error);
      updateLastMessage(threadId, 'Error: ' + (error as Error).message);
      triggerSound('error', activeAgent.id);
    } finally {
      setIsTyping(false);
      // Persist final assistant message to encrypted SQLite DB
      await persistLastMessage(threadId!);
    }
  };

  const handleSearch = useCallback(async (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) { setSearchResults([]); return; }
    try {
      setSearchResults(await searchMessages(q));
    } catch { setSearchResults([]); }
  }, [searchMessages]);

  const handleExport = async (format: 'json' | 'markdown') => {
    if (!activeThreadId) return;
    try {
      const content = await exportThread(activeThreadId, format);
      const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat-${activeThreadId}.${format === 'json' ? 'json' : 'md'}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) { console.error('Export failed', e); }
  };

  const handleLoadMore = async () => {
    if (!activeThreadId || isLoadingMore) return;
    setIsLoadingMore(true);
    try { await loadMoreMessages(activeThreadId); }
    finally { setIsLoadingMore(false); }
  };

  const openEditAgent = (id: string) => {
    setEditingAgentId(id);
    setIsAgentEditorOpen(true);
  };

  const openNewAgent = () => {
    setEditingAgentId(null);
    setIsAgentEditorOpen(true);
  };

  return (
    <div className="flex h-screen bg-[#1e1e1e] text-[#d4d4d4] font-sans">
      {/* Sidebar / Buddy List */}
      <div className="w-64 border-r border-[#333] flex flex-col">
        <div className="p-4 border-b border-[#333] font-bold flex justify-between items-center">
          <span>Buddy List</span>
          <div className="flex gap-1">
            <button className="p-1 hover:bg-[#333] rounded text-[#888] hover:text-[#ccc]" title="Search" onClick={() => setIsSearchOpen(v => !v)}>
              <Search size={16} />
            </button>
            <button className="p-1 hover:bg-[#333] rounded text-[#888] hover:text-[#ccc]" onClick={openNewAgent}>
              <Plus size={16} />
            </button>
            <button className="p-1 hover:bg-[#333] rounded text-[#888] hover:text-[#ccc]" onClick={() => setIsNotifSettingsOpen(true)} title="Sounds & Notifications">
              <Bell size={16} />
            </button>
            <button className="p-1 hover:bg-[#333] rounded text-[#888] hover:text-[#ccc]" onClick={() => setIsSettingsOpen(true)}>
              <Settings size={16} />
            </button>
          </div>
        </div>

        {/* Full-text search panel */}
        {isSearchOpen && (
          <div className="p-2 border-b border-[#333]">
            <input
              className="w-full bg-[#3c3c3c] text-[#ccc] text-sm rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#007acc]"
              placeholder="Search messages…"
              value={searchQuery}
              autoFocus
              onChange={(e) => handleSearch(e.target.value)}
            />
            {searchResults.length > 0 && (
              <div className="mt-2 max-h-52 overflow-y-auto space-y-1">
                {searchResults.map((r) => (
                  <button
                    key={r.id}
                    className="w-full text-left px-2 py-1 hover:bg-[#2d2d2d] rounded text-xs"
                    onClick={() => {
                      setActiveThread(r.threadId);
                      setIsSearchOpen(false);
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                  >
                    <div className="text-[#666] truncate">{r.threadTitle}</div>
                    <div className="text-[#aaa] truncate">{r.content.slice(0, 80)}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className={`p-3 flex items-center gap-3 cursor-pointer group hover:bg-[#2d2d2d] ${
                activeAgentId === agent.id ? 'bg-[#37373d]' : ''
              }`}
              onClick={() => setActiveAgent(agent.id)}
            >
              <div className="relative">
                <div className="w-10 h-10 bg-[#444] rounded-full flex items-center justify-center overflow-hidden">
                  {agent.avatar ? (
                    <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover" />
                  ) : (
                    <Bot size={20} />
                  )}
                </div>
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#1e1e1e] ${
                  agent.status === 'online' ? 'bg-[#4caf50]' : 'bg-[#9e9e9e]'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{agent.name}</div>
                <div className="text-xs text-[#888] truncate">{agent.role}</div>
              </div>
              <button 
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#444] rounded transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  openEditAgent(agent.id);
                }}
              >
                <Edit2 size={12} />
              </button>
            </div>
          ))}
        </div>

        {/* Conversation history */}
        {threads.length > 0 && (
          <div className="border-t border-[#333] max-h-44 overflow-y-auto">
            <div className="px-3 py-1 text-xs text-[#555] font-semibold uppercase tracking-wide">History</div>
            {threads.map((t) => (
              <div
                key={t.id}
                className={`px-3 py-1.5 flex items-center gap-2 cursor-pointer hover:bg-[#2d2d2d] group text-sm ${
                  activeThreadId === t.id ? 'bg-[#37373d]' : ''
                }`}
                onClick={() => setActiveThread(t.id)}
              >
                <span className="flex-1 truncate text-[#999]">{t.title}</span>
                <button
                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-400 transition-opacity"
                  title="Archive thread"
                  onClick={(e) => { e.stopPropagation(); archiveThread(t.id); }}
                >
                  <Archive size={11} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeThread ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-[#333] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#444] rounded-full flex items-center justify-center overflow-hidden shrink-0">
                  {activeAgent.avatar ? (
                    <img src={activeAgent.avatar} alt={activeAgent.name} className="w-full h-full object-cover" />
                  ) : (
                    <Bot size={24} />
                  )}
                </div>
                <div>
                  <div className="font-bold">{activeAgent.name}</div>
                  <div className="text-xs text-[#888]">{activeAgent.soul}</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 hover:bg-[#333] rounded text-[#888] hover:text-[#ccc] text-xs flex items-center gap-1" title="Export as Markdown" onClick={() => handleExport('markdown')}>
                  <Download size={14} /><span className="hidden sm:inline">MD</span>
                </button>
                <button className="p-2 hover:bg-[#333] rounded text-[#888] hover:text-[#ccc] text-xs flex items-center gap-1" title="Export as JSON" onClick={() => handleExport('json')}>
                  <Download size={14} /><span className="hidden sm:inline">JSON</span>
                </button>
                <button className="p-2 hover:bg-[#333] rounded text-[#888] hover:text-red-400" title="Archive thread" onClick={() => archiveThread(activeThread.id)}>
                  <Archive size={18} />
                </button>
                <button className="p-2 hover:bg-[#333] rounded text-[#888] hover:text-[#ccc]" onClick={() => openEditAgent(activeAgent.id)}>
                  <Edit2 size={18} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4" ref={scrollRef}>
              {activeThread.hasMore && (
                <div className="flex justify-center">
                  <button
                    className="flex items-center gap-1 text-xs text-[#888] hover:text-[#ccc] px-3 py-1 rounded hover:bg-[#2d2d2d]"
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                  >
                    <ChevronUp size={14} />
                    {isLoadingMore ? 'Loading…' : 'Load older messages'}
                  </button>
                </div>
              )}
              {activeThread.messages.map((m, i) => (
                <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 overflow-hidden ${
                    m.role === 'user' ? 'bg-[#007acc]' : 'bg-[#444]'
                  }`}>
                    {m.role === 'user' ? (
                      <User size={16} />
                    ) : activeAgent.avatar ? (
                      <img src={activeAgent.avatar} alt={activeAgent.name} className="w-full h-full object-cover" />
                    ) : (
                      <Bot size={16} />
                    )}
                  </div>
                  <div className={`p-3 rounded-lg max-w-[80%] whitespace-pre-wrap ${
                    m.role === 'user' ? 'bg-[#2b3945] text-white' : 'bg-[#2d2d2d] text-[#d4d4d4]'
                  }`}>
                    {typeof m.content === 'string' ? m.content : 'Complex content not supported yet'}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#444] flex items-center justify-center">
                    <Bot size={16} />
                  </div>
                  <div className="p-3 bg-[#2d2d2d] rounded-lg animate-pulse">
                    ...
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-[#333]">
              <div className="relative">
                <textarea
                  className="w-full bg-[#3c3c3c] border-none rounded-md p-3 pr-12 text-[#ccc] focus:outline-none focus:ring-1 focus:ring-[#007acc] resize-none"
                  placeholder={`Message ${activeAgent.name}...`}
                  rows={2}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <button
                  className="absolute right-3 bottom-3 p-2 text-[#888] hover:text-[#007acc]"
                  onClick={handleSend}
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[#888] flex-col gap-4">
            <Bot size={48} className="opacity-20" />
            <span>Select an agent to start chatting</span>
            <button 
              onClick={openNewAgent}
              className="bg-[#007acc] hover:bg-[#0062a3] text-white px-4 py-2 rounded text-sm font-medium"
            >
              Create New Agent
            </button>
          </div>
        )}
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <AgentEditorModal isOpen={isAgentEditorOpen} onClose={() => setIsAgentEditorOpen(false)} agentId={editingAgentId} />
      <NotificationSettingsModal isOpen={isNotifSettingsOpen} onClose={() => setIsNotifSettingsOpen(false)} />
    </div>
  );
};
