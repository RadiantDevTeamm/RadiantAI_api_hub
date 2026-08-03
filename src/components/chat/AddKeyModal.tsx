import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, ChevronDown, Eye, EyeOff, ExternalLink, KeyRound, Sparkles } from 'lucide-react';
import {
  detectProviderWithAmbiguity,
  getProvider,
  PROVIDER_MODELS,
  PROVIDERS,
  type ProviderId,
} from '@/types/models';
import { ProviderIcon } from '@/components/ProviderIcon';
import { useSavedModels } from '@/hooks/useSavedModels';

interface AddKeyModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddKeyModal({ open, onClose }: AddKeyModalProps) {
  const { addModel } = useSavedModels();
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [nickname, setNickname] = useState('');
  const [providerId, setProviderId] = useState<ProviderId | null>(null);
  const [modelId, setModelId] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [ambiguousCandidates, setAmbiguousCandidates] = useState<ProviderId[]>([]);

  // Auto-detect provider on key input
  useEffect(() => {
    if (!open) return;
    const { provider, candidates } = detectProviderWithAmbiguity(apiKey);
    setAmbiguousCandidates(candidates);

    if (provider && provider !== providerId) {
      setProviderId(provider);
      const models = PROVIDER_MODELS[provider];
      setModelId(models[0]?.id || '');
    } else if (!provider && candidates.length > 0) {
      // Ambiguous — don't auto-select, let user choose
      // Only clear if current provider isn't in candidates
      if (providerId && !candidates.includes(providerId)) {
        setProviderId(null);
        setModelId('');
      }
    } else if (!apiKey) {
      setProviderId(null);
      setModelId('');
      setAmbiguousCandidates([]);
    }
  }, [apiKey, open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset on close
  useEffect(() => {
    if (!open) {
      setApiKey('');
      setShowKey(false);
      setNickname('');
      setProviderId(null);
      setModelId('');
      setDropdownOpen(false);
      setSaved(false);
      setAmbiguousCandidates([]);
    }
  }, [open]);

  const availableModels = useMemo(
    () => (providerId ? PROVIDER_MODELS[providerId] : []),
    [providerId],
  );

  const selectedModel = availableModels.find((m) => m.id === modelId);
  const detectedProvider = providerId ? getProvider(providerId) : null;

  const canSave = apiKey.trim() && providerId && modelId && selectedModel;

  const handleSave = () => {
    if (!canSave || !providerId || !selectedModel) return;
    const nick = nickname.trim() || selectedModel.label;
    addModel({
      nickname: nick,
      provider: providerId,
      modelId: selectedModel.id,
      modelLabel: selectedModel.label,
      apiName: selectedModel.apiName,
      apiKey: apiKey.trim(),
    });
    setSaved(true);
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const handleManualProviderSelect = (id: ProviderId) => {
    setProviderId(id);
    const models = PROVIDER_MODELS[id];
    setModelId(models[0]?.id || '');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col">
      <div className="animate-fade-in absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="animate-sheet-up relative mt-auto flex max-h-[92vh] flex-col rounded-t-3xl border-t border-border bg-surface shadow-lg-theme">
        {/* Drag handle */}
        <div className="flex justify-center pt-3">
          <div className="h-1 w-10 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-text"
          >
            <ArrowLeft size={18} />
          </button>
          <h2 className="flex-1 text-base font-semibold">Добавить API ключ</h2>
          {saved && (
            <div className="flex items-center gap-1 text-sm font-medium text-accent animate-scale-in">
              <Check size={16} /> Сохранено
            </div>
          )}
        </div>

        <div className="scroll-thin flex-1 overflow-y-auto px-5 pb-4">
          {/* API Key Input */}
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium text-muted">API Key</label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Вставьте ваш API ключ..."
                className="w-full rounded-2xl border border-border bg-bg px-4 py-3 pr-24 font-mono text-sm outline-none transition-colors placeholder:text-muted focus:border-accent"
                autoComplete="off"
                spellCheck={false}
              />
              <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
                {detectedProvider && (
                  <div
                    className="flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-medium animate-scale-in"
                    style={{ backgroundColor: `${detectedProvider.color}15`, color: detectedProvider.color }}
                  >
                    <ProviderIcon provider={providerId!} size={12} />
                    {detectedProvider.label}
                  </div>
                )}
                <button
                  onClick={() => setShowKey((v) => !v)}
                  className="rounded-full p-1.5 text-muted transition-colors hover:text-text"
                  aria-label="Toggle key visibility"
                >
                  {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            {apiKey && !detectedProvider && ambiguousCandidates.length === 0 && (
              <p className="mt-1.5 text-xs text-muted">
                Не удалось определить провайдера. Выберите вручную ниже.
              </p>
            )}
            {apiKey && ambiguousCandidates.length > 1 && !detectedProvider && (
              <div className="mt-2 rounded-2xl border border-accent/30 bg-accent-soft p-2.5">
                <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-accent">
                  <Sparkles size={12} />
                  Несколько провайдеров подходят к этому ключу. Выберите один:
                </p>
                <div className="flex flex-wrap gap-2">
                  {ambiguousCandidates.map((id) => {
                    const p = getProvider(id);
                    return (
                      <button
                        key={id}
                        onClick={() => handleManualProviderSelect(id)}
                        className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all hover:scale-105"
                        style={{ borderColor: `${p.color}40`, color: p.color, backgroundColor: `${p.color}10` }}
                      >
                        <ProviderIcon provider={id} size={13} />
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Nickname Input */}
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium text-muted">
              Кастомное название <span className="text-muted/60">(необязательно)</span>
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder={selectedModel?.label ? `Например, "${selectedModel.label} Turbo"` : 'Например, "Мой рабочий GPT-4"'}
              className="w-full rounded-2xl border border-border bg-bg px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted focus:border-accent"
              maxLength={40}
            />
          </div>

          {/* Provider manual selector */}
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium text-muted">Провайдер</label>
            <div className="flex flex-wrap gap-2">
              {PROVIDERS.map((p) => {
                const active = providerId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleManualProviderSelect(p.id)}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                      active
                        ? 'border-transparent'
                        : 'border-border bg-bg text-muted hover:text-text'
                    }`}
                    style={
                      active
                        ? { backgroundColor: `${p.color}15`, color: p.color, borderColor: `${p.color}40` }
                        : undefined
                    }
                  >
                    <ProviderIcon provider={p.id} size={13} />
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Model Dropdown */}
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium text-muted">Модель</label>
            <div className="relative">
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                disabled={!providerId}
                className="flex w-full items-center justify-between rounded-2xl border border-border bg-bg px-4 py-3 text-sm transition-colors disabled:opacity-50 hover:border-accent"
              >
                <span className={selectedModel ? 'font-medium' : 'text-muted'}>
                  {selectedModel ? selectedModel.label : 'Выберите провайдера сначала'}
                </span>
                <ChevronDown size={16} className={`text-muted transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {dropdownOpen && availableModels.length > 0 && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                  <div className="animate-scale-in absolute left-0 right-0 top-full z-20 mt-1.5 rounded-2xl border border-border bg-surface p-1.5 shadow-lg-theme">
                    {availableModels.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          setModelId(m.id);
                          setDropdownOpen(false);
                        }}
                        className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                          m.id === modelId ? 'bg-accent-soft font-medium' : 'hover:bg-surface-2'
                        }`}
                      >
                        {m.id === modelId && <Check size={14} className="text-accent" />}
                        <span className={m.id === modelId ? '' : 'pl-5'}>{m.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Help link */}
          {detectedProvider && (
            <a
              href={detectedProvider.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-accent transition-colors hover:underline"
            >
              <KeyRound size={12} />
              Получить ключ {detectedProvider.label}
              <ExternalLink size={10} />
            </a>
          )}
        </div>

        {/* Save button */}
        <div className="safe-bottom border-t border-border p-4">
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-3.5 text-sm font-semibold text-accent-text transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Check size={18} />
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}
