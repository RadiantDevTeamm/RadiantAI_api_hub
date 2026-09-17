import { Clock, MessageSquare, User, Settings } from 'lucide-react';
import type { ThemeId } from '@/types/theme';
import { RadiantLogo } from '@/components/RadiantLogo';

interface HeaderProps {
  theme: ThemeId;
  activeTab: 'history' | 'chat';
  onTabChange: (tab: 'history' | 'chat') => void;
  onOpenSettings: () => void;
}

export function Header({ activeTab, onTabChange, onOpenSettings }: HeaderProps) {
  return (
    <header className="safe-top relative z-10 px-4 pt-3 pb-2">
      <div className="relative flex h-10 items-center justify-between">
        <button
          onClick={onOpenSettings}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-muted transition-colors hover:border-accent/50 hover:text-text"
          aria-label="Profile & Settings"
        >
          <User size={18} />
        </button>

        <div className="absolute left-1/2 -translate-x-1/2">
          <RadiantLogo size="md" />
        </div>

        <button
          onClick={onOpenSettings}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-muted transition-colors hover:border-accent/50 hover:text-text"
          aria-label="Settings"
        >
          <Settings size={18} />
        </button>
      </div>

      <div className="mt-2 flex justify-center">
        <div className="flex items-center rounded-full border border-border bg-surface/85 p-0.5 shadow-theme backdrop-blur-sm">
          <button
            onClick={() => onTabChange('history')}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'history' ? 'bg-surface-2 text-text' : 'text-muted hover:text-text'
            }`}
          >
            <Clock size={15} />
            <span className="hidden xs:inline">История</span>
          </button>
          <button
            onClick={() => onTabChange('chat')}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'chat' ? 'bg-surface-2 text-text' : 'text-muted hover:text-text'
            }`}
          >
            <MessageSquare size={15} />
            <span className="hidden xs:inline">Чат</span>
          </button>
        </div>
      </div>
    </header>
  );
}
