import { Clock, MessageSquare, User, Settings } from 'lucide-react';
import type { ThemeId } from '@/types/theme';

interface HeaderProps {
  theme: ThemeId;
  activeTab: 'history' | 'chat';
  onTabChange: (tab: 'history' | 'chat') => void;
  onOpenSettings: () => void;
}

export function Header({ activeTab, onTabChange, onOpenSettings }: HeaderProps) {
  return (
    <header className="safe-top flex items-center justify-between px-4 pt-3 pb-2">
      {/* Left: Profile icon */}
      <button
        onClick={onOpenSettings}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-muted transition-colors hover:text-text"
        aria-label="Profile & Settings"
      >
        <User size={18} />
      </button>

      {/* Center: Segmented control */}
      <div className="flex items-center rounded-full border border-border bg-surface p-0.5 shadow-theme">
        <button
          onClick={() => onTabChange('history')}
          className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
            activeTab === 'history'
              ? 'bg-surface-2 text-text'
              : 'text-muted hover:text-text'
          }`}
        >
          <Clock size={15} />
          <span className="hidden xs:inline">История</span>
        </button>
        <button
          onClick={() => onTabChange('chat')}
          className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
            activeTab === 'chat'
              ? 'bg-surface-2 text-text'
              : 'text-muted hover:text-text'
          }`}
        >
          <MessageSquare size={15} />
          <span className="hidden xs:inline">Чат</span>
        </button>
      </div>

      {/* Right: Settings */}
      <button
        onClick={onOpenSettings}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-muted transition-colors hover:text-text"
        aria-label="Settings"
      >
        <Settings size={18} />
      </button>
    </header>
  );
}
