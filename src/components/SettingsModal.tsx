import { Check, Moon, Sun, Coffee, Grid3x3, X, KeyRound, Plus } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useSavedModels } from '@/hooks/useSavedModels';
import { RadiantLogo } from '@/components/RadiantLogo';
import { THEMES, type ThemeId } from '@/types/theme';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  onAddKey: () => void;
}

export function SettingsModal({ open, onClose, onAddKey }: SettingsModalProps) {
  const { theme, setTheme } = useTheme();
  const { models } = useSavedModels();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col">
      <div className="animate-fade-in absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="animate-sheet-up relative mt-auto flex max-h-[88vh] flex-col rounded-t-3xl border-t border-border bg-surface shadow-lg-theme">
        {/* Drag handle */}
        <div className="flex justify-center pt-3">
          <div className="h-1 w-10 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3">
          <h2 className="text-base font-semibold">Настройки</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-text"
          >
            <X size={18} />
          </button>
        </div>

        <div className="scroll-thin flex-1 overflow-y-auto px-5 pb-4">
          {/* Theme section */}
          <div className="mb-5">
            <label className="mb-2 block text-xs font-medium text-muted">Тема оформления</label>
            <div className="grid grid-cols-2 gap-2.5">
              {THEMES.map((t) => {
                const Icon = t.icon;
                const isActive = theme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id as ThemeId)}
                    className={`relative flex flex-col items-start gap-2 rounded-2xl border p-3 text-left transition-all ${
                      isActive
                        ? 'border-accent bg-accent-soft'
                        : 'border-border bg-bg hover:border-accent/40'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute right-2.5 top-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent">
                        <Check size={11} className="text-accent-text" />
                      </div>
                    )}
                    {/* Swatch preview */}
                    <div className="flex w-full items-center gap-1.5">
                      <div
                        className="h-7 w-7 shrink-0 rounded-lg border border-border"
                        style={{ backgroundColor: t.swatch.bg }}
                      >
                        <div
                          className="m-auto mt-1 h-4 w-4 rounded-md"
                          style={{ backgroundColor: t.swatch.surface }}
                        >
                          <div
                            className="m-auto mt-1 h-2 w-2 rounded-full"
                            style={{ backgroundColor: t.swatch.accent }}
                          />
                        </div>
                      </div>
                      <Icon size={16} className="text-muted" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{t.label}</div>
                      <div className="text-[11px] text-muted">{t.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* API Keys section */}
          <div className="mb-4">
            <label className="mb-2 block text-xs font-medium text-muted">API Ключи</label>
            <div className="rounded-2xl border border-border bg-bg p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">
                  {models.length} {models.length === 1 ? 'ключ' : 'ключей'} добавлено
                </span>
                <button
                  onClick={() => {
                    onClose();
                    onAddKey();
                  }}
                  className="flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-accent-text transition-opacity hover:opacity-90"
                >
                  <Plus size={14} />
                  Добавить
                </button>
              </div>
              {models.length > 0 ? (
                <div className="space-y-1.5">
                  {models.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center gap-2 rounded-xl border border-border bg-surface px-2.5 py-2"
                    >
                      <KeyRound size={14} className="shrink-0 text-muted" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-medium">{m.nickname}</div>
                        <div className="truncate text-[10px] text-muted">{m.modelLabel}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted">Нет добавленных ключей</p>
              )}
            </div>
          </div>

          {/* About */}
          <div className="rounded-2xl border border-border bg-bg p-3">
            <div className="flex items-center justify-between gap-2">
              <RadiantLogo size="sm" />
              <span className="text-[11px] text-muted">v1.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
