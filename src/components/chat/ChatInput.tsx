import { useEffect, useRef, useState } from 'react';
import {
  ArrowUp, ChevronDown, ChevronUp, FileText, FileCode2, Braces, File, Music, Video,
  GitCompare, LineChart, Wrench, Code2, Lightbulb, PenLine, Languages,
  Mic, Paperclip, Plus, Sparkles, Square, X,
} from 'lucide-react';
import { useSavedModels } from '@/hooks/useSavedModels';
import { getProvider } from '@/types/models';
import { ProviderIcon } from '@/components/ProviderIcon';
import {
  ACCEPTED_FILE_TYPES, formatFileSize, formatDuration, getFileIconName,
  isAcceptedFile, preParseFile, type PendingFile,
} from '@/lib/fileParser';

const SUGGESTIONS = [
  { icon: GitCompare, label: 'Сравнить', prompt: 'Сравни React и Vue для нового проекта — плюсы, минусы, когда выбирать.' },
  { icon: LineChart, label: 'Финансы', prompt: 'Объясни простыми словами, как работают сложные проценты.' },
  { icon: Wrench, label: 'Устранение неполадок', prompt: 'Мой код выдаёт ошибку CORS при запросе к API. Как это исправить?' },
  { icon: Code2, label: 'Напиши код', prompt: 'Напиши TypeScript функцию для debounce с возможностью отмены.' },
  { icon: Lightbulb, label: 'Идеи', prompt: 'Дай 5 креативных названий для AI-приложения для продуктивности.' },
  { icon: PenLine, label: 'Напиши текст', prompt: 'Напиши дружелюбное письмо команде с просьбой обновить статус проекта.' },
  { icon: Languages, label: 'Перевод', prompt: 'Переведи на английский: «Добро пожаловать в наше сообщество!»' },
];

interface ChatInputProps {
  onSend: (text: string, files: PendingFile[]) => void;
  onStop: () => void;
  onOpenModelSheet: () => void;
  isStreaming: boolean;
  disabled?: boolean;
  placeholder?: string;
  showSuggestions?: boolean;
}

export function ChatInput({
  onSend,
  onStop,
  onOpenModelSheet,
  isStreaming,
  disabled,
  placeholder,
  showSuggestions = false,
}: ChatInputProps) {
  const [value, setValue] = useState('');
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { activeModel } = useSavedModels();

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  // Reset suggestions visibility when entering a new chat
  useEffect(() => {
    if (showSuggestions) setSuggestionsOpen(true);
  }, [showSuggestions]);

  const handleSubmit = () => {
    if (isStreaming || disabled) return;
    const text = value.trim();
    if (!text && pendingFiles.length === 0) return;
    onSend(text, pendingFiles);
    setValue('');
    setPendingFiles([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSuggestionClick = (prompt: string) => {
    setValue(prompt);
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
      const el = textareaRef.current;
      if (el) {
        el.style.height = 'auto';
        el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
      }
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const valid = files.filter(isAcceptedFile);
    const newPending: PendingFile[] = await Promise.all(
      valid.map(async (f) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const extra = await preParseFile(f);
        return {
          id,
          name: f.name,
          size: f.size,
          type: f.type,
          file: f,
          ...extra,
        } as PendingFile;
      }),
    );
    setPendingFiles((prev) => [...prev, ...newPending]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (id: string) => {
    setPendingFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const provider = activeModel ? getProvider(activeModel.provider) : null;
  const canSend = (value.trim() || pendingFiles.length > 0) && !disabled;

  return (
    <div className="relative">
      {/* Suggestion chips bar — sits right above the input dock */}
      {showSuggestions && (
        <div className="px-3 pb-1.5">
          <div
            className="overflow-hidden transition-all duration-300 ease-out"
            style={{
              maxHeight: suggestionsOpen ? '60px' : '0px',
              opacity: suggestionsOpen ? 1 : 0,
            }}
          >
            <div className="flex items-center gap-2">
              {/* Collapse toggle button */}
              <button
                onClick={() => setSuggestionsOpen(false)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-muted transition-colors hover:bg-surface-2 hover:text-text"
                aria-label="Hide suggestions"
              >
                <ChevronDown size={16} />
              </button>

              {/* Horizontally scrollable chips */}
              <div className="scroll-thin-x flex items-center gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
                {SUGGESTIONS.map((s) => {
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.label}
                      onClick={() => handleSuggestionClick(s.prompt)}
                      className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 py-2 text-xs font-medium text-text transition-all hover:border-accent hover:bg-surface-2 active:scale-95"
                    >
                      <Icon size={13} className="text-accent" />
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Expand toggle when collapsed */}
          {!suggestionsOpen && (
            <button
              onClick={() => setSuggestionsOpen(true)}
              className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted transition-colors hover:bg-surface-2 hover:text-text"
              aria-label="Show suggestions"
            >
              <ChevronUp size={14} />
              <span>Подсказки</span>
            </button>
          )}
        </div>
      )}

      {/* Input dock */}
      <div className="px-3 pb-2 safe-bottom">
        <div className="rounded-3xl border border-border bg-surface shadow-lg-theme transition-colors focus-within:border-accent">
          {/* File preview chips */}
          {pendingFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 px-3 pt-3">
              {pendingFiles.map((f) => {
                const ext = f.name.split('.').pop()?.toLowerCase() || '';
                const isImage = f.kind === 'image' && f.dataUrl;
                const isAudio = f.kind === 'audio';
                const isVideo = f.kind === 'video';
                const iconName = getFileIconName(ext);
                const DocIcon = iconName === 'FileText' ? FileText : iconName === 'FileCode2' ? FileCode2 : iconName === 'Braces' ? Braces : File;

                return (
                  <div
                    key={f.id}
                    className="animate-scale-in relative flex items-center gap-2 rounded-xl border border-border bg-bg/50 py-1.5 pl-1.5 pr-1.5"
                  >
                    {/* Thumbnail / icon */}
                    {isImage ? (
                      <img src={f.dataUrl} alt={f.name} className="h-8 w-8 shrink-0 rounded-lg object-cover" />
                    ) : isAudio ? (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/15">
                        <Music size={14} className="text-accent" />
                      </div>
                    ) : isVideo ? (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/15">
                        <Video size={14} className="text-accent" />
                      </div>
                    ) : (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-2">
                        <DocIcon size={14} className="text-muted" />
                      </div>
                    )}

                    {/* Name + meta */}
                    <div className="min-w-0 pr-0.5">
                      <div className="max-w-[100px] truncate text-xs font-medium">{f.name}</div>
                      <div className="text-[10px] text-muted/70">
                        {isAudio || isVideo
                          ? `${formatDuration(f.duration) || formatFileSize(f.size)} · ${formatFileSize(f.size)}`
                          : formatFileSize(f.size)}
                      </div>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => removeFile(f.id)}
                      className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-text"
                      aria-label="Remove file"
                    >
                      <X size={11} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Text area */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder || 'Задайте любой вопрос...'}
            rows={1}
            className="scroll-thin max-h-[160px] w-full resize-none bg-transparent px-4 pt-3.5 pb-1 text-[15px] leading-relaxed outline-none placeholder:text-muted"
          />

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_FILE_TYPES}
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Bottom toolbar */}
          <div className="flex items-center justify-between px-2.5 pb-2.5 pt-1">
            {/* Left side */}
            <div className="flex items-center gap-2">
              <button
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-text"
                aria-label="More options"
              >
                <Plus size={20} />
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-accent"
                aria-label="Attach file"
              >
                <Paperclip size={18} />
              </button>

              <button
                onClick={onOpenModelSheet}
                className="flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs font-medium transition-colors hover:border-accent"
              >
                {activeModel && provider ? (
                  <>
                    <ProviderIcon
                      provider={activeModel.provider}
                      size={14}
                      style={{ color: provider.color }}
                    />
                    <span
                      className="max-w-[100px] truncate"
                      style={{ color: provider.color }}
                    >
                      {activeModel.nickname}
                    </span>
                    <span className="hidden h-3.5 w-px bg-border sm:inline-block" />
                    <span className="hidden max-w-[80px] truncate text-muted sm:inline">
                      {activeModel.modelLabel}
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} className="text-muted" />
                    <span className="text-muted">Модель</span>
                  </>
                )}
                <ChevronDown size={13} className="text-muted" />
              </button>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              <button
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-text"
                aria-label="Voice input"
              >
                <Mic size={18} />
              </button>

              {isStreaming ? (
                <button
                  onClick={onStop}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-text transition-colors hover:bg-border"
                  aria-label="Stop"
                >
                  <Square size={14} className="fill-current" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!canSend}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-text transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Send"
                >
                  <ArrowUp size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
