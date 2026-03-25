import React, { useState, useRef, useEffect } from 'react';
import { useAgentStore, type AgentProfile } from '../lib/agents/store';
import { Avatar } from '../lib/design-system';
import {
  Search, Plus, Settings, Bell, ChevronRight, ChevronDown,
  MessageSquare, UserCircle, Edit2, Archive, Bot, MoreHorizontal, Palette,
} from 'lucide-react';

interface BuddyGroup {
  name: string;
  agents: AgentProfile[];
}

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  agentId: string | null;
}

interface Props {
  onSelectAgent: (id: string) => void;
  onEditAgent: (id: string) => void;
  onNewAgent: () => void;
  onOpenSettings: () => void;
  onOpenNotifSettings: () => void;
  onOpenSkins: () => void;
  activeAgentId: string | null;
}

export const BuddyList: React.FC<Props> = ({
  onSelectAgent,
  onEditAgent,
  onNewAgent,
  onOpenSettings,
  onOpenNotifSettings,
  onOpenSkins,
  activeAgentId,
}) => {
  const { agents, updateAgent } = useAgentStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false, x: 0, y: 0, agentId: null,
  });
  const contextRef = useRef<HTMLDivElement>(null);

  // Close context menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (contextRef.current && !contextRef.current.contains(e.target as Node)) {
        setContextMenu((s) => ({ ...s, visible: false }));
      }
    };
    if (contextMenu.visible) {
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }
  }, [contextMenu.visible]);

  // Filter agents by search
  const filtered = agents.filter((a) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      a.role.toLowerCase().includes(q) ||
      a.personality.some((p) => p.toLowerCase().includes(q))
    );
  });

  // Group agents by status
  const groups: BuddyGroup[] = [
    { name: 'Online', agents: filtered.filter((a) => a.status === 'online') },
    { name: 'Away', agents: filtered.filter((a) => a.status === 'away') },
    { name: 'Offline', agents: filtered.filter((a) => a.status === 'offline') },
  ].filter((g) => g.agents.length > 0);

  const toggleGroup = (name: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const handleContextMenu = (e: React.MouseEvent, agentId: string) => {
    e.preventDefault();
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, agentId });
  };

  const closeContextMenu = () => setContextMenu((s) => ({ ...s, visible: false }));

  const contextAgent = agents.find((a) => a.id === contextMenu.agentId);

  return (
    <div className="w-64 border-r border-aim-border flex flex-col bg-aim-bg-secondary h-full">
      {/* Header */}
      <div className="p-3 border-b border-aim-border flex justify-between items-center">
        <span className="font-bold text-aim-text-primary text-[length:--font-size-sm]">Buddy List</span>
        <div className="flex gap-1">
          <button
            className="p-1.5 hover:bg-aim-bg-surface rounded-[--radius-sm] text-aim-text-muted hover:text-aim-text-primary transition-colors"
            onClick={onNewAgent}
            title="Add Agent"
          >
            <Plus size={15} />
          </button>
          <button
            className="p-1.5 hover:bg-aim-bg-surface rounded-[--radius-sm] text-aim-text-muted hover:text-aim-text-primary transition-colors"
            onClick={onOpenNotifSettings}
            title="Sounds & Notifications"
          >
            <Bell size={15} />
          </button>
          <button
            className="p-1.5 hover:bg-aim-bg-surface rounded-[--radius-sm] text-aim-text-muted hover:text-aim-text-primary transition-colors"
            onClick={onOpenSkins}
            title="Skins & Themes"
          >
            <Palette size={15} />
          </button>
          <button
            className="p-1.5 hover:bg-aim-bg-surface rounded-[--radius-sm] text-aim-text-muted hover:text-aim-text-primary transition-colors"
            onClick={onOpenSettings}
            title="Settings"
          >
            <Settings size={15} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-aim-border-subtle">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-aim-text-muted" />
          <input
            type="text"
            placeholder="Search buddies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-aim-bg-input border border-aim-border rounded-[--radius-md] pl-8 pr-3 py-1.5 text-[length:--font-size-xs] text-aim-text-primary placeholder:text-aim-text-muted focus:outline-none focus:border-aim-border-focus transition-colors"
          />
        </div>
      </div>

      {/* Agent Groups */}
      <div className="flex-1 overflow-y-auto">
        {groups.map((group) => {
          const isCollapsed = collapsedGroups.has(group.name);
          return (
            <div key={group.name}>
              {/* Group Header */}
              <button
                className="w-full flex items-center gap-1.5 px-3 py-1.5 text-[length:--font-size-xs] text-aim-text-muted hover:text-aim-text-secondary font-semibold uppercase tracking-wider"
                onClick={() => toggleGroup(group.name)}
              >
                {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                <span>{group.name}</span>
                <span className="ml-auto text-aim-text-muted font-normal">({group.agents.length})</span>
              </button>

              {/* Agent Items */}
              {!isCollapsed &&
                group.agents.map((agent) => (
                  <div
                    key={agent.id}
                    className={`px-3 py-2 flex items-center gap-2.5 cursor-pointer group transition-colors ${
                      activeAgentId === agent.id
                        ? 'bg-aim-accent-subtle border-l-2 border-aim-accent'
                        : 'hover:bg-aim-bg-surface border-l-2 border-transparent'
                    }`}
                    onClick={() => onSelectAgent(agent.id)}
                    onContextMenu={(e) => handleContextMenu(e, agent.id)}
                  >
                    <Avatar
                      src={agent.avatar}
                      alt={agent.name}
                      size="lg"
                      status={agent.status}
                      fallback={<Bot size={18} className="text-aim-text-muted" />}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-[length:--font-size-sm] text-aim-text-primary truncate">
                        {agent.name}
                      </div>
                      <div className="text-[length:--font-size-xs] text-aim-text-muted truncate">
                        {agent.role}
                      </div>
                    </div>
                    <button
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-aim-bg-elevated rounded-[--radius-sm] transition-opacity text-aim-text-muted hover:text-aim-text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleContextMenu(e as unknown as React.MouseEvent, agent.id);
                      }}
                    >
                      <MoreHorizontal size={14} />
                    </button>
                  </div>
                ))}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="p-4 text-center text-aim-text-muted text-[length:--font-size-xs]">
            {searchQuery ? 'No agents match your search' : 'No agents yet'}
          </div>
        )}
      </div>

      {/* Right-Click Context Menu */}
      {contextMenu.visible && contextAgent && (
        <div
          ref={contextRef}
          className="fixed z-[100] bg-aim-bg-elevated border border-aim-border rounded-[--radius-md] shadow-lg py-1 min-w-[180px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <ContextMenuItem
            icon={<MessageSquare size={14} />}
            label="Start Chat"
            onClick={() => { onSelectAgent(contextAgent.id); closeContextMenu(); }}
          />
          <ContextMenuItem
            icon={<UserCircle size={14} />}
            label="View Profile"
            onClick={() => { onEditAgent(contextAgent.id); closeContextMenu(); }}
          />
          <ContextMenuItem
            icon={<Edit2 size={14} />}
            label="Edit Agent"
            onClick={() => { onEditAgent(contextAgent.id); closeContextMenu(); }}
          />
          <div className="border-t border-aim-border my-1" />
          <ContextMenuItem
            icon={
              <div className={`w-2.5 h-2.5 rounded-full ${contextAgent.status === 'online' ? 'bg-aim-offline' : 'bg-aim-online'}`} />
            }
            label={contextAgent.status === 'online' ? 'Set Offline' : 'Set Online'}
            onClick={() => {
              updateAgent(contextAgent.id, {
                status: contextAgent.status === 'online' ? 'offline' : 'online',
              });
              closeContextMenu();
            }}
          />
          <div className="border-t border-aim-border my-1" />
          <ContextMenuItem
            icon={<Archive size={14} />}
            label="Archive"
            danger
            onClick={() => {
              updateAgent(contextAgent.id, { status: 'offline' });
              closeContextMenu();
            }}
          />
        </div>
      )}
    </div>
  );
};

/* Context Menu Item */
const ContextMenuItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
  onClick: () => void;
}> = ({ icon, label, danger, onClick }) => (
  <button
    className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-[length:--font-size-xs] transition-colors ${
      danger
        ? 'text-aim-red hover:bg-aim-red-subtle'
        : 'text-aim-text-primary hover:bg-aim-bg-surface'
    }`}
    onClick={onClick}
  >
    <span className="w-4 flex items-center justify-center">{icon}</span>
    {label}
  </button>
);
