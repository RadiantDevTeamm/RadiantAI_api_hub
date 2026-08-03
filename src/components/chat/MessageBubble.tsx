import { memo, useState } from 'react';
import { AlertTriangle, Check, Copy, FileText, FileCode2, Braces, File, Music, Video, Paperclip, User, X } from 'lucide-react';
import { Markdown } from './Markdown';
import { useSavedModels } from '@/hooks/useSavedModels';
import { getProvider } from '@/types/models';
import { ProviderIcon } from '@/components/ProviderIcon';
import { formatFileSize, formatDuration, getFileIconName, type FileKind } from '@/lib/fileParser';

export interface MessageAttachment {
  name: string;
  size: number;
  ext: string;
  kind: FileKind;
  dataUrl?: string;
  duration?: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  modelId?: string;
  error?: boolean;
  streaming?: boolean;
  attachments?: MessageAttachment[];
}

function DocChip({ name, size, ext }: MessageAttachment) {
  const iconName = getFileIconName(ext);
  const Icon = iconName === 'FileText' ? FileText : iconName === 'FileCode2' ? FileCode2 : iconName === 'Braces' ? Braces : File;
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-bg/40 px-2.5 py-1.5">
      <Icon size={14} className="shrink-0 text-muted" />
      <span className="max-w-[120px] truncate text-xs font-medium">{name}</span>
      <span className="text-[10px] text-muted/70">{formatFileSize(size)}</span>
    </div>
  );
}

function AudioCard({ name, size, duration }: MessageAttachment) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-bg/40 px-3 py-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/15">
        <Music size={15} className="text-accent" />
      </div>
      <div className="min-w-0">
        <div className="max-w-[140px] truncate text-xs font-medium">{name}</div>
        <div className="text-[10px] text-muted/70">
          {formatDuration(duration) || '—'} · {formatFileSize(size)}
        </div>
      </div>
      {/* Mini waveform bars */}
      <div className="flex items-center gap-0.5">
        {[6, 10, 14, 8, 12, 6, 10, 14, 8, 12, 6, 10].map((h, i) => (
          <div
            key={i}
            className="w-0.5 rounded-full bg-accent/40"
            style={{ height: h }}
          />
        ))}
      </div>
    </div>
  );
}

function VideoCard({ name, size, duration, dataUrl }: MessageAttachment) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-bg/40">
      <div className="relative flex h-20 w-full items-center justify-center bg-surface-2">
        {dataUrl ? (
          <video src={dataUrl} className="h-full w-full object-cover" muted />
        ) : (
          <Video size={24} className="text-muted" />
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90">
            <div className="ml-0.5 h-0 w-0 border-y-[6px] border-l-[10px] border-y-transparent border-l-black" />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between px-2.5 py-1.5">
        <span className="max-w-[120px] truncate text-xs font-medium">{name}</span>
        <span className="text-[10px] text-muted/70">
          {formatDuration(duration) || '—'} · {formatFileSize(size)}
        </span>
      </div>
    </div>
  );
}

function ImageLightbox({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80" onClick={onClose}>
      <button className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur">
        <X size={20} />
      </button>
      <img src={src} className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain" alt="" />
    </div>
  );
}

function AttachmentPreview({ att }: { att: MessageAttachment }) {
  const [lightbox, setLightbox] = useState(false);

  if (att.kind === 'image' && att.dataUrl) {
    return (
      <>
        <button onClick={() => setLightbox(true)} className="overflow-hidden rounded-xl">
          <img
            src={att.dataUrl}
            alt={att.name}
            className="h-20 w-20 shrink-0 rounded-xl border border-border/60 object-cover transition-transform hover:scale-105"
          />
        </button>
        {lightbox && <ImageLightbox src={att.dataUrl} onClose={() => setLightbox(false)} />}
      </>
    );
  }
  if (att.kind === 'audio') return <AudioCard name={att.name} size={att.size} ext={att.ext} kind={att.kind} duration={att.duration} />;
  if (att.kind === 'video') return <VideoCard name={att.name} size={att.size} ext={att.ext} kind={att.kind} duration={att.duration} dataUrl={att.dataUrl} />;
  return <DocChip name={att.name} size={att.size} ext={att.ext} kind={att.kind} />;
}

function MessageBubbleInner({ message }: { message: Message }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';
  const { models } = useSavedModels();
  const savedModel = message.modelId ? models.find((m) => m.id === message.modelId) : null;

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (isUser) {
    const images = message.attachments?.filter((a) => a.kind === 'image' && a.dataUrl) || [];
    const media = message.attachments?.filter((a) => a.kind === 'audio' || a.kind === 'video') || [];
    const docs = message.attachments?.filter((a) => a.kind === 'document') || [];

    return (
      <div className="animate-fade-in-up flex justify-end gap-2.5">
        <div className="max-w-[85%]">
          {/* Inline images */}
          {images.length > 0 && (
            <div className="mb-1.5 flex flex-wrap justify-end gap-1.5">
              {images.map((att, i) => (
                <AttachmentPreview key={i} att={att} />
              ))}
            </div>
          )}
          {/* Audio/video cards */}
          {media.length > 0 && (
            <div className="mb-1.5 flex flex-col items-end gap-1.5">
              {media.map((att, i) => (
                <AttachmentPreview key={i} att={att} />
              ))}
            </div>
          )}
          {/* Document chips */}
          {docs.length > 0 && (
            <div className="mb-1.5 flex flex-wrap justify-end gap-1.5">
              {docs.map((att, i) => (
                <AttachmentPreview key={i} att={att} />
              ))}
            </div>
          )}
          <div className="rounded-2xl rounded-br-md bg-accent px-3.5 py-2.5 text-sm leading-relaxed text-accent-text">
            {message.attachments && message.attachments.length > 0 && (
              <div className="mb-1.5 flex items-center gap-1 text-[11px] font-medium text-accent-text/70">
                <Paperclip size={11} />
                {message.attachments.length} {message.attachments.length === 1 ? 'файл' : 'файла'}
              </div>
            )}
            {message.content && <p className="whitespace-pre-wrap break-words">{message.content}</p>}
          </div>
        </div>
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-2 text-muted">
          <User size={13} />
        </div>
      </div>
    );
  }

  const provider = savedModel ? getProvider(savedModel.provider) : null;

  return (
    <div className="animate-fade-in-up flex gap-2.5">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-2">
        {savedModel && provider ? (
          <ProviderIcon provider={savedModel.provider} size={13} style={{ color: provider.color }} />
        ) : (
          <span className="font-display text-[11px] font-bold">R</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-xs font-semibold">{savedModel ? savedModel.nickname : 'Radiant'}</span>
          {message.streaming && (
            <span className="flex gap-0.5">
              <span className="typing-dot h-1 w-1 rounded-full bg-muted" />
              <span className="typing-dot h-1 w-1 rounded-full bg-muted" />
              <span className="typing-dot h-1 w-1 rounded-full bg-muted" />
            </span>
          )}
        </div>
        {message.error ? (
          <div className="flex items-start gap-2 rounded-2xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            <span className="break-words">{message.content}</span>
          </div>
        ) : (
          <Markdown content={message.content || ''} />
        )}
        {!message.streaming && !message.error && message.content && (
          <button
            onClick={handleCopy}
            className="mt-1.5 flex items-center gap-1 text-[11px] text-muted transition-colors hover:text-text"
          >
            {copied ? <Check size={11} /> : <Copy size={11} />}
            {copied ? 'Скопировано' : 'Копировать'}
          </button>
        )}
      </div>
    </div>
  );
}

export const MessageBubble = memo(MessageBubbleInner);
