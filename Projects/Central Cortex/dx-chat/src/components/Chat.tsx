import React, { useState, useCallback } from 'react';
import { useAgentStore } from '../lib/agents/store';
import { useMessageStore } from '../lib/messages/store';
import { useSoundStore } from '../lib/sounds/store';
import { playSound, type SoundName } from '../lib/sounds/engine';
import { showNotification, isWindowFocused } from '../lib/notifications/engine';
import { aiRouter } from '../lib/ai/router';
import { Send, Bot, Edit2 } from 'lucide-react';
import { Avatar } from '../lib/design-system';
import { BuddyList } from './BuddyList';
import { ChatWindow } from './ChatWindow';
import { ChatTabs } from './ChatTabs';
import { SettingsModal } from './SettingsModal';
import { AgentEditorModal } from './AgentEditorModal';
import { NotificationSettingsModal } from './NotificationSettingsModal';
import { SkinModal } from './SkinModal';
import { useThemeStore } from '../lib/themes/store';

export const Chat: React.FC = () => {
  const { agents, activeAgentId, setActiveAgent } = useAgentStore();
  const { threads, activeThreadId, addThread, addMessage, updateLastMessage, setActiveThread } = useMessageStore();
  const { reapply } = useThemeStore();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotifSettingsOpen, setIsNotifSettingsOpen] = useState(false);
  const [isSkinsOpen, setIsSkinsOpen] = useState(false);
  const [editingAgentId, setEditingAgentId] = useState<string | null>(null);
  const [isAgentEditorOpen, setIsAgentEditorOpen] = useState(false);
  const [openTabIds, setOpenTabIds] = useState<string[]>([]);

  // Reapply persisted theme on mount
  React.useEffect(() => { reapply(); }, [reapply]);

  const activeAgent = agents.find((a) => a.id === activeAgentId) || agents[0];
  const activeThread = threads.find((t) => t.id === activeThreadId);

  // Keep openTabIds in sync — add active thread to tabs if not present
  React.useEffect(() => {
    if (activeThreadId && !openTabIds.includes(activeThreadId)) {
      setOpenTabIds((prev) => [...prev, activeThreadId]);
    }
  }, [activeThreadId, openTabIds]);

  const triggerSound = useCallback((event: keyof ReturnType<typeof useSoundStore.getState>['eventSounds'], agentId?: string) => {
    const state = useSoundStore.getState();
    if (!state.soundsEnabled) return;
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

  const triggerNotification = useCallback((agentName: string, messagePreview: string) => {
    const state = useSoundStore.getState();
    if (!state.notificationsEnabled) return;
    if (state.notifyOnlyWhenUnfocused && isWindowFocused()) return;
    showNotification({
      title: agentName,
      body: state.notificationPreview ? messagePreview.slice(0, 120) : 'New message',
      tag: `dx-chat-${agentName}`,
    });
  }, []);

  const handleSend = async () => {
    if (!input.trim() || !activeAgent) return;

    let threadId = activeThreadId;
    if (!threadId) {
      threadId = await addThread({
        agentId: activeAgent.id,
        messages: [],
        title: `Chat with ${activeAgent.name}`,
      });
      setActiveThread(threadId);
    }

    const userMessage = { role: 'user' as const, content: input };
    await addMessage(threadId, userMessage);
    setInput('');
    setIsTyping(true);
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
    }
  };

  const openEditAgent = (id: string) => {
    setEditingAgentId(id);
    setIsAgentEditorOpen(true);
  };

  const openNewAgent = () => {
    setEditingAgentId(null);
    setIsAgentEditorOpen(true);
  };

  const handleCloseTab = (threadId: string) => {
    setOpenTabIds((prev) => prev.filter((id) => id !== threadId));
    if (activeThreadId === threadId) {
      const remaining = openTabIds.filter((id) => id !== threadId);
      setActiveThread(remaining.length > 0 ? remaining[remaining.length - 1] : null);
    }
  };

  const handleNewTab = () => {
    setActiveThread(null);
  };

  return (
    <div className="flex h-screen bg-aim-bg-primary text-aim-text-primary font-sans">
      {/* Buddy List Sidebar */}
      <BuddyList
        onSelectAgent={setActiveAgent}
        onEditAgent={openEditAgent}
        onNewAgent={openNewAgent}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenNotifSettings={() => setIsNotifSettingsOpen(true)}
        onOpenSkins={() => setIsSkinsOpen(true)}
        activeAgentId={activeAgentId}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Multi-chat tabs */}
        <ChatTabs
          threads={threads}
          openTabIds={openTabIds}
          activeTabId={activeThreadId}
          agents={agents}
          onSelectTab={setActiveThread}
          onCloseTab={handleCloseTab}
          onNewTab={handleNewTab}
        />

        {activeThread ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-aim-border flex items-center justify-between bg-aim-bg-secondary">
              <div className="flex items-center gap-3">
                <Avatar
                  src={activeAgent.avatar}
                  alt={activeAgent.name}
                  size="lg"
                  status={activeAgent.status}
                  fallback={<Bot size={20} className="text-aim-text-muted" />}
                />
                <div>
                  <div className="font-bold text-[length:--font-size-base]">{activeAgent.name}</div>
                  <div className="text-[length:--font-size-xs] text-aim-text-muted">{activeAgent.soul}</div>
                </div>
              </div>
              <button
                className="p-2 hover:bg-aim-bg-surface rounded-[--radius-sm] text-aim-text-muted hover:text-aim-text-primary transition-colors"
                onClick={() => openEditAgent(activeAgent.id)}
              >
                <Edit2 size={18} />
              </button>
            </div>

            {/* Chat Window with enhanced features */}
            <ChatWindow
              messages={activeThread.messages}
              agent={activeAgent}
              isTyping={isTyping}
            />

            {/* Input */}
            <div className="p-4 border-t border-aim-border bg-aim-bg-secondary">
              <div className="relative">
                <textarea
                  className="w-full bg-aim-bg-input border border-aim-border rounded-[--radius-md] p-3 pr-12 text-aim-text-primary placeholder:text-aim-text-muted focus:outline-none focus:ring-2 focus:ring-aim-border-focus focus:border-aim-border-focus resize-none text-[length:--font-size-sm] transition-[border-color,box-shadow]"
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
                  className="absolute right-3 bottom-3 p-2 text-aim-text-muted hover:text-aim-accent transition-colors"
                  onClick={handleSend}
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-aim-text-muted flex-col gap-4">
            <Bot size={48} className="opacity-20" />
            <span className="text-[length:--font-size-base]">Select an agent to start chatting</span>
            <button
              onClick={openNewAgent}
              className="bg-aim-accent hover:bg-aim-accent-hover text-aim-text-inverse px-4 py-2 rounded-[--radius-md] text-[length:--font-size-sm] font-medium transition-colors"
            >
              Create New Agent
            </button>
          </div>
        )}
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <AgentEditorModal isOpen={isAgentEditorOpen} onClose={() => setIsAgentEditorOpen(false)} agentId={editingAgentId} />
      <NotificationSettingsModal isOpen={isNotifSettingsOpen} onClose={() => setIsNotifSettingsOpen(false)} />
      <SkinModal isOpen={isSkinsOpen} onClose={() => setIsSkinsOpen(false)} />
    </div>
  );
};
