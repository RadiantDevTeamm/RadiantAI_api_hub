import { useState } from 'react';
import { Check, Plus, Trash2, X, KeyRound, Search } from 'lucide-react';
import { useSavedModels } from '@/hooks/useSavedModels';
import { getProvider } from '@/types/models';
import { ProviderIcon } from '@/components/ProviderIcon';

interface ModelSheetProps {
  open: boolean;
  onClose: () => void;
  onAddKey: () => void;
}

export function ModelSheet({ open, onClose, onAddKey }: ModelSheetProps) {
  const { models, activeModelId, setActiveModelId, removeModel } = useSavedModels();
  const [search, setSearch] = useState('');

  if (!open) return null;

  const filtered = models.filter((m) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    const provider = getProvider(m.provider);
    return (
      m.nickname.toLowerCase().includes(q) ||
      m.modelLabel.toLowerCase().includes(q) ||
      provider.label.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="animate-fade-in absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="animate-sheet-up relative max-h-[80vh] rounded-t-3xl border-t border-border bg-surface shadow-lg-theme">
        {/* Drag handle */}
        <div className="flex justify-center pt-3">
          <div className="h-1 w-10 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3">
          <h2 className="text-base font-semibold">Выбор модели</h2>
          <button onClick={onClose} className="rounded-full p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-text">
            <X size={18} />
          </button>
        </div>

        {/* Search bar */}
        {models.length > 0 && (
          <div className="px-4 pb-2">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск по моделям и провайдерам..."
                className="w-full rounded-full border border-border bg-bg py-2 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted focus:border-accent"
              />
            </div>
          </div>
        )}

        {/* Model list */}
        <div className="scroll-thin max-h-[45vh] overflow-y-auto px-3 pb-2">
          {models.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft">
                <KeyRound size={22} className="text-accent" />
              </div>
              <p className="mb-1 text-sm font-medium">Нет добавленных моделей</p>
              <p className="text-xs text-muted">Добавьте API ключ, чтобы начать использовать Radiant</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
              <Search size={20} className="mb-2 text-muted" />
              <p className="text-sm text-muted">Ничего не найдено</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map((m) => {
                const provider = getProvider(m.provider);
                const isActive = m.id === activeModelId;
                return (
                  <div
                    key={m.id}
                    className={`group flex items-center gap-3 rounded-2xl border p-3 transition-all ${
                      isActive ? 'border-accent bg-accent-soft' : 'border-transparent hover:bg-surface-2'
                    }`}
                  >
                    <button
                      onClick={() => {
                        setActiveModelId(m.id);
                        onClose();
                      }}
                      className="flex flex-1 items-center gap-3 text-left"
                    >
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                        style={{ backgroundColor: `${provider.color}15`, color: provider.color }}
                      >
                        <ProviderIcon provider={m.provider} size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{m.nickname}</div>
                        <div className="truncate text-xs text-muted">{m.modelLabel} · {provider.label}</div>
                      </div>
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => removeModel(m.id)}
                        className="rounded-full p-1.5 text-muted opacity-0 transition-all hover:text-danger group-hover:opacity-100"
                        aria-label="Remove model"
                      >
                        <Trash2 size={15} />
                      </button>
                      {isActive && (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent">
                          <Check size={13} className="text-accent-text" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add key button */}
        <div className="safe-bottom border-t border-border p-4">
          <button
            onClick={() => {
              onClose();
              onAddKey();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-3 text-sm font-semibold text-accent-text transition-opacity hover:opacity-90"
          >
            <Plus size={18} />
            Добавить API ключ
          </button>
        </div>
      </div>
    </div>
  );
}
