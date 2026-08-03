import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Message, MessageAttachment } from '@/components/chat/MessageBubble';

const STORAGE_KEY = 'radiant.conversations';

export interface StoredConversation {
  id: string;
  title: string;
  messages: Message[];
  modelId: string;
  updatedAt: number;
}

function load(): StoredConversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredConversation[]) : [];
  } catch {
    return [];
  }
}

export function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

interface ConversationsContextValue {
  conversations: StoredConversation[];
  activeId: string | null;
  activeConversation: StoredConversation | null;
  setActiveId: (id: string | null) => void;
  createConversation: (title: string, messages: Message[], modelId: string) => string;
  appendMessages: (convId: string, messages: Message[]) => void;
  updateMessage: (convId: string, msgId: string, patch: Partial<Message>) => void;
  deleteConversation: (id: string) => void;
}

const ConversationsContext = createContext<ConversationsContextValue | null>(null);

export function ConversationsProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<StoredConversation[]>(() => load());
  const [activeId, setActiveId] = useState<string | null>(() => load()[0]?.id || null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch {
      /* ignore */
    }
  }, [conversations]);

  const setActive = useCallback((id: string | null) => setActiveId(id), []);

  const createConversation = useCallback(
    (title: string, msgs: Message[], modelId: string): string => {
      const id = uid();
      const conv: StoredConversation = {
        id,
        title: title.slice(0, 50),
        messages: msgs,
        modelId,
        updatedAt: Date.now(),
      };
      setConversations((prev) => [conv, ...prev]);
      setActiveId(id);
      return id;
    },
    [],
  );

  const appendMessages = useCallback((convId: string, msgs: Message[]) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId
          ? { ...c, messages: [...c.messages, ...msgs], updatedAt: Date.now() }
          : c,
      ),
    );
  }, []);

  const updateMessage = useCallback((convId: string, msgId: string, patch: Partial<Message>) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId
          ? { ...c, messages: c.messages.map((m) => (m.id === msgId ? { ...m, ...patch } : m)) }
          : c,
      ),
    );
  }, []);

  const deleteConversation = useCallback((id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    setActiveId((curr) => (curr === id ? null : curr));
  }, []);

  const activeConversation = conversations.find((c) => c.id === activeId) || null;

  return (
    <ConversationsContext.Provider
      value={{
        conversations,
        activeId,
        activeConversation,
        setActiveId: setActive,
        createConversation,
        appendMessages,
        updateMessage,
        deleteConversation,
      }}
    >
      {children}
    </ConversationsContext.Provider>
  );
}

export function useConversations() {
  const ctx = useContext(ConversationsContext);
  if (!ctx) throw new Error('useConversations must be used within ConversationsProvider');
  return ctx;
}
