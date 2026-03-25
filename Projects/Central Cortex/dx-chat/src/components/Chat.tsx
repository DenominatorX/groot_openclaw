import React, { useState, useRef, useEffect } from 'react';
import { useAgentStore } from '../lib/agents/store';
import { useMessageStore } from '../lib/messages/store';
import { aiRouter } from '../lib/ai/router';
import { Send, User, Bot, Settings } from 'lucide-react';
import { useConfigStore } from '../lib/ai/config';

export const Chat: React.FC = () => {
  const { agents, activeAgentId, setActiveAgent } = useAgentStore();
  const { threads, activeThreadId, addThread, addMessage, updateLastMessage, setActiveThread } = useMessageStore();
  const { config, setConfig } = useConfigStore();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeAgent = agents.find((a) => a.id === activeAgentId) || agents[0];
  const activeThread = threads.find((t) => t.id === activeThreadId);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeThread?.messages]);

  const handleSend = async () => {
    if (!input.trim() || !activeAgent) return;

    let threadId = activeThreadId;
    if (!threadId) {
      threadId = addThread({
        agentId: activeAgent.id,
        messages: [],
        title: `Chat with ${activeAgent.name}`,
      });
      setActiveThread(threadId);
    }

    const userMessage = { role: 'user' as const, content: input };
    addMessage(threadId, userMessage);
    setInput('');
    setIsTyping(true);

    const updatedThread = useMessageStore.getState().threads.find(t => t.id === threadId);
    if (!updatedThread) return;

    try {
      const assistantMessage = { role: 'assistant' as const, content: '' };
      addMessage(threadId, assistantMessage);

      const systemPrompt = [
        activeAgent.systemPrompt,
        activeAgent.customInstructions ? `Custom Instructions:\n${activeAgent.customInstructions}` : '',
        activeAgent.knowledgeBase ? `Knowledge Base:\n${activeAgent.knowledgeBase}` : '',
      ].filter(Boolean).join('\n\n');

      let fullContent = '';
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
        }
      }
    } catch (error) {
      console.error(error);
      updateLastMessage(threadId, 'Error: ' + (error as Error).message);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#1e1e1e] text-[#d4d4d4] font-sans">
      {/* Sidebar / Buddy List */}
      <div className="w-64 border-r border-[#333] flex flex-col">
        <div className="p-4 border-b border-[#333] font-bold flex justify-between items-center">
          <span>Buddy List</span>
          <button className="p-1 hover:bg-[#333] rounded" onClick={() => {
            const key = prompt('Enter Google API Key', config.googleKey);
            if (key !== null) setConfig({ googleKey: key });
          }}>
            <Settings size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className={`p-3 flex items-center gap-3 cursor-pointer hover:bg-[#2d2d2d] ${
                activeAgentId === agent.id ? 'bg-[#37373d]' : ''
              }`}
              onClick={() => setActiveAgent(agent.id)}
            >
              <div className="relative">
                <div className="w-10 h-10 bg-[#444] rounded-full flex items-center justify-center">
                  <Bot size={20} />
                </div>
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#1e1e1e] ${
                  agent.status === 'online' ? 'bg-[#4caf50]' : 'bg-[#9e9e9e]'
                }`} />
              </div>
              <div>
                <div className="font-medium">{agent.name}</div>
                <div className="text-xs text-[#888] truncate w-32">{agent.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeThread ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-[#333] flex items-center gap-3">
              <Bot size={24} />
              <div>
                <div className="font-bold">{activeAgent.name}</div>
                <div className="text-xs text-[#888]">{activeAgent.soul}</div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4" ref={scrollRef}>
              {activeThread.messages.map((m, i) => (
                <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    m.role === 'user' ? 'bg-[#007acc]' : 'bg-[#444]'
                  }`}>
                    {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
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
          <div className="flex-1 flex items-center justify-center text-[#888]">
            Select an agent to start chatting
          </div>
        )}
      </div>
    </div>
  );
};
