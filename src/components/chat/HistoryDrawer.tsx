import { useState } from 'react';
import { Clock, Plus, Trash2, X, MessageSquare, Search } from 'lucide-react';
import { useConversations } from '@/hooks/useConversations';

interface HistoryDrawerProps {
  open: boolean;
  onClose: () => void;
  onNewChat: () => void;
}

function formatTime(ts: number): string {
  const now = Date.now();
  const diff = now - ts;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'только что';
  if (mins < 60) return `${mins} мин назад`;
  if (hours < 24) return `${hours} ч назад`;
  if (days < 7) return `${days} дн назад`;
  return new Date(ts).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

export function HistoryDrawer({ open, onClose, onNewChat }: HistoryDrawerProps) {
  const { conversations, activeId, setActiveId, deleteConversation } = useConversations();
  const [search, setSearch] = useState('');

  if (!open) return null;

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase().trim()),
  );

  const handleSelect = (id: string) => {
    setActiveId(id);
    onClose();
  };

  const handleNewChat = () => {
    onNewChat();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="animate-fade-in absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="animate-slide-in-right relative flex h-full w-full max-w-sm flex-col bg-surface shadow-lg-theme">
        {/* Header */}
        <div className="safe-top flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-accent" />
            <h2 className="text-base font-semibold">История чатов</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-text"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search + New chat */}
        <div className="space-y-2.5 border-b border-border px-4 py-3">
          <button
            onClick={handleNewChat}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-2.5 text-sm font-semibold text-accent-text transition-opacity hover:opacity-90"
          >
            <Plus size={17} />
            Новый чат
          </button>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по чатам..."
              className="w-full rounded-full border border-border bg-bg py-2 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted focus:border-accent"
            />
          </div>
        </div>

        {/* Chat list */}
        <div className="scroll-thin flex-1 overflow-y-auto px-2 py-2">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface-2">
                <MessageSquare size={22} className="text-muted" />
              </div>
              <p className="mb-1 text-sm font-medium">
                {conversations.length === 0 ? 'Нет сохранённых чатов' : 'Ничего не найдено'}
              </p>
              <p className="text-xs text-muted">
                {conversations.length === 0
                  ? 'Начните новый чат, и он появится здесь'
                  : 'Попробуйте изменить поисковый запрос'}
              </p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {filtered.map((c) => {
                const isActive = c.id === activeId;
                return (
                  <div
                    key={c.id}
                    className={`group flex items-center gap-2.5 rounded-2xl border p-2.5 transition-all ${
                      isActive
                        ? 'border-accent bg-accent-soft'
                        : 'border-transparent hover:bg-surface-2'
                    }`}
                  >
                    <button
                      onClick={() => handleSelect(c.id)}
                      className="flex flex-1 items-center gap-2.5 text-left"
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                          isActive ? 'bg-accent text-accent-text' : 'bg-surface-2 text-muted'
                        }`}
                      >
                        <MessageSquare size={15} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{c.title}</div>
                        <div className="text-xs text-muted">
                          {c.messages.length} сообщ. · {formatTime(c.updatedAt)}
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => deleteConversation(c.id)}
                      className="rounded-full p-1.5 text-muted opacity-0 transition-all hover:text-danger group-hover:opacity-100"
                      aria-label="Delete chat"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
