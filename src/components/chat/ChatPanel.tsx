import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowDown, Sparkles } from 'lucide-react';
import { ChatInput } from './ChatInput';
import { MessageBubble, type Message, type MessageAttachment } from './MessageBubble';
import { ModelSheet } from './ModelSheet';
import { AddKeyModal } from './AddKeyModal';
import { useSavedModels } from '@/hooks/useSavedModels';
import { useConversations, uid } from '@/hooks/useConversations';
import { streamChat, type ChatMessage, type ContentPart } from '@/lib/streamChat';
import { parseFile, formatPromptWithFiles, type PendingFile, type ParsedFile } from '@/lib/fileParser';

function buildMultimodalContent(text: string, files: ParsedFile[]): string | ContentPart[] {
  const images = files.filter((f) => f.kind === 'image' && f.dataUrl);
  const nonImages = files.filter((f) => f.kind !== 'image');

  // If no images, just use text format
  if (images.length === 0) {
    return formatPromptWithFiles(text, files);
  }

  // Build content parts: text first (with non-image file context), then images
  const parts: ContentPart[] = [];
  const textContext = formatPromptWithFiles(text, nonImages);
  parts.push({ type: 'text', text: textContext });
  for (const img of images) {
    if (img.dataUrl) {
      parts.push({ type: 'image_url', image_url: { url: img.dataUrl } });
    }
  }
  return parts;
}

export function ChatPanel() {
  const { activeModel } = useSavedModels();
  const {
    conversations,
    activeId,
    activeConversation,
    setActiveId,
    createConversation,
    appendMessages,
    updateMessage,
  } = useConversations();
  const [isStreaming, setIsStreaming] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [modelSheetOpen, setModelSheetOpen] = useState(false);
  const [addKeyOpen, setAddKeyOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const messages = activeConversation?.messages || [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, messages[messages.length - 1]?.content]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollDown(dist > 120);
  };

  const scrollToBottom = () => bottomRef.current?.scrollIntoView({ behavior: 'smooth' });

  const handleSend = useCallback(
    async (text: string, files: PendingFile[]) => {
      if (isStreaming) return;
      if (!activeModel) {
        setAddKeyOpen(true);
        return;
      }

      // Parse attached files
      let attachments: MessageAttachment[] = [];
      let chatContent: string | ContentPart[] = text;
      if (files.length > 0) {
        const parsed = await Promise.all(files.map((f) => parseFile(f.file)));
        attachments = parsed.map((p) => ({
          name: p.name, size: p.size, ext: p.ext, kind: p.kind,
          dataUrl: p.dataUrl, duration: p.duration,
        }));
        chatContent = buildMultimodalContent(text, parsed);
      }

      const userMsg: Message = {
        id: uid(),
        role: 'user',
        content: text,
        attachments: attachments.length > 0 ? attachments : undefined,
      };
      const assistantId = uid();
      const assistantMsg: Message = {
        id: assistantId,
        role: 'assistant',
        content: '',
        modelId: activeModel.id,
        streaming: true,
      };

      let convId = activeId;
      const existingMessages = activeConversation?.messages || [];

      if (!convId || !conversations.find((c) => c.id === convId)) {
        convId = createConversation(text || files[0]?.name || 'Новый чат', [userMsg, assistantMsg], activeModel.id);
      } else {
        appendMessages(convId, [userMsg, assistantMsg]);
      }

      const convMessages: ChatMessage[] = existingMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      convMessages.push({ role: 'user', content: chatContent });

      const controller = new AbortController();
      abortRef.current = controller;
      setIsStreaming(true);

      streamChat({
        model: activeModel,
        messages: convMessages,
        signal: controller.signal,
        callbacks: {
          onDelta: (chunk) => {
            updateMessage(convId!, assistantId, {
              content: (existingMessages.find((m) => m.id === assistantId)?.content || '') + chunk,
            });
            // Append chunk to current content via a functional approach
            setConversationsUpdate(convId!, assistantId, chunk);
          },
          onDone: () => {
            setIsStreaming(false);
            abortRef.current = null;
            updateMessage(convId!, assistantId, { streaming: false });
          },
          onError: (err) => {
            setIsStreaming(false);
            abortRef.current = null;
            updateMessage(convId!, assistantId, { streaming: false, error: true, content: err });
          },
        },
      });
    },
    [isStreaming, activeId, activeConversation, conversations, activeModel, createConversation, appendMessages, updateMessage],
  );

  // We need a way to append chunks incrementally. Since updateMessage replaces,
  // we use a local ref to track accumulated content per message.
  const contentRef = useRef<Map<string, string>>(new Map());

  const setConversationsUpdate = (convId: string, msgId: string, chunk: string) => {
    const key = `${convId}:${msgId}`;
    const current = contentRef.current.get(key) || '';
    const next = current + chunk;
    contentRef.current.set(key, next);
    updateMessage(convId, msgId, { content: next });
  };

  const handleStop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
  }, []);

  const handleNewChat = () => setActiveId(null);

  // Clear content ref when starting a new message
  useEffect(() => {
    if (!isStreaming) {
      contentRef.current.clear();
    }
  }, [isStreaming]);

  return (
    <div className="relative flex h-full flex-col">
      {/* Messages area */}
      <div ref={scrollRef} onScroll={onScroll} className="scroll-thin relative flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex min-h-full flex-col items-center justify-center px-4">
            <div className="mb-6 flex flex-col items-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center">
                <svg viewBox="0 0 32 32" className="h-16 w-16" fill="none">
                  <defs>
                    <linearGradient id="logo-grad-main" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--c-accent)" />
                      <stop offset="100%" stopColor="var(--c-text)" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M16 2 L29 28 H3 Z"
                    fill="url(#logo-grad-main)"
                    stroke="var(--c-border)"
                    strokeWidth="0.5"
                  />
                  <circle cx="16" cy="20" r="4" fill="var(--c-bg)" />
                </svg>
              </div>
              <h1 className="font-display text-2xl font-semibold tracking-tight">Radiant</h1>
              <p className="mt-0.5 text-xs text-muted">by Aetheris AI</p>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-4 px-4 py-4">
            {/* New chat button when messages exist */}
            <div className="flex justify-center pb-2">
              <button
                onClick={handleNewChat}
                className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-surface-2 hover:text-text"
              >
                <Sparkles size={13} />
                Новый чат
              </button>
            </div>
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Scroll to bottom */}
      {showScrollDown && messages.length > 0 && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-32 left-1/2 z-10 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border border-border bg-surface text-muted shadow-theme transition-colors hover:text-text"
          aria-label="Scroll to bottom"
        >
          <ArrowDown size={15} />
        </button>
      )}

      {/* Floating dock input */}
      <ChatInput
        onSend={handleSend}
        onStop={handleStop}
        onOpenModelSheet={() => setModelSheetOpen(true)}
        isStreaming={isStreaming}
        showSuggestions={messages.length === 0}
        placeholder={activeModel ? 'Задайте любой вопрос...' : 'Добавьте API ключ, чтобы начать...'}
      />

      {/* Bottom sheets */}
      <ModelSheet
        open={modelSheetOpen}
        onClose={() => setModelSheetOpen(false)}
        onAddKey={() => setAddKeyOpen(true)}
      />
      <AddKeyModal open={addKeyOpen} onClose={() => setAddKeyOpen(false)} />
    </div>
  );
}
