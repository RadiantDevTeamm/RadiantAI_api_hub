import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { ProviderId } from '@/types/models';

const STORAGE_KEY = 'radiant.apikeys';

export type ApiKeyMap = Partial<Record<ProviderId, string>>;

function read(): ApiKeyMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ApiKeyMap) : {};
  } catch {
    return {};
  }
}

function write(map: ApiKeyMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

interface ApiKeysContextValue {
  keys: ApiKeyMap;
  setKey: (provider: ProviderId, value: string) => void;
  clearKey: (provider: ProviderId) => void;
  hasKey: (provider: ProviderId) => boolean;
}

const ApiKeysContext = createContext<ApiKeysContextValue | null>(null);

export function ApiKeysProvider({ children }: { children: ReactNode }) {
  const [keys, setKeys] = useState<ApiKeyMap>(() => (typeof window === 'undefined' ? {} : read()));

  const setKey = useCallback((provider: ProviderId, value: string) => {
    setKeys((prev) => {
      const next = { ...prev, [provider]: value.trim() || undefined };
      if (!value.trim()) delete next[provider];
      write(next);
      return next;
    });
  }, []);

  const clearKey = useCallback((provider: ProviderId) => {
    setKeys((prev) => {
      const next = { ...prev };
      delete next[provider];
      write(next);
      return next;
    });
  }, []);

  const hasKey = useCallback((provider: ProviderId) => Boolean(keys[provider]), [keys]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setKeys(read());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <ApiKeysContext.Provider value={{ keys, setKey, clearKey, hasKey }}>{children}</ApiKeysContext.Provider>
  );
}

export function useApiKeys() {
  const ctx = useContext(ApiKeysContext);
  if (!ctx) throw new Error('useApiKeys must be used within ApiKeysProvider');
  return ctx;
}

export function maskKey(key: string): string {
  if (key.length <= 10) return key ? '••••••••' : '';
  return `${key.slice(0, 5)}${'•'.repeat(18)}${key.slice(-4)}`;
}
