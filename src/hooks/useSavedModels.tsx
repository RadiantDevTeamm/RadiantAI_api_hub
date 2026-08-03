import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { ProviderId, SavedModel } from '@/types/models';

const STORAGE_KEY = 'radiant.saved-models';
const ACTIVE_KEY = 'radiant.active-model';

function read(): SavedModel[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedModel[]) : [];
  } catch {
    return [];
  }
}

function write(models: SavedModel[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(models));
  } catch {
    /* ignore */
  }
}

interface SavedModelsContextValue {
  models: SavedModel[];
  activeModelId: string | null;
  activeModel: SavedModel | null;
  addModel: (model: Omit<SavedModel, 'id' | 'createdAt'>) => string;
  removeModel: (id: string) => void;
  setActiveModelId: (id: string | null) => void;
}

const SavedModelsContext = createContext<SavedModelsContextValue | null>(null);

function uid() {
  return `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function SavedModelsProvider({ children }: { children: ReactNode }) {
  const [models, setModels] = useState<SavedModel[]>(() => (typeof window === 'undefined' ? [] : read()));
  const [activeModelId, setActiveId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACTIVE_KEY) || read()[0]?.id || null;
  });

  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_KEY, activeModelId || '');
    } catch {
      /* ignore */
    }
  }, [activeModelId]);

  const addModel = useCallback((model: Omit<SavedModel, 'id' | 'createdAt'>): string => {
    const id = uid();
    const saved: SavedModel = { ...model, id, createdAt: Date.now() };
    setModels((prev) => {
      const next = [...prev, saved];
      write(next);
      return next;
    });
    setActiveId(id);
    return id;
  }, []);

  const removeModel = useCallback((id: string) => {
    setModels((prev) => {
      const next = prev.filter((m) => m.id !== id);
      write(next);
      return next;
    });
    setActiveId((curr) => (curr === id ? null : curr));
  }, []);

  const setActiveModelId = useCallback((id: string | null) => setActiveId(id), []);

  const activeModel = models.find((m) => m.id === activeModelId) || null;

  // If no active model but models exist, auto-select first
  useEffect(() => {
    if (!activeModelId && models.length > 0) {
      setActiveId(models[0].id);
    }
  }, [activeModelId, models]);

  return (
    <SavedModelsContext.Provider
      value={{ models, activeModelId, activeModel, addModel, removeModel, setActiveModelId }}
    >
      {children}
    </SavedModelsContext.Provider>
  );
}

export function useSavedModels() {
  const ctx = useContext(SavedModelsContext);
  if (!ctx) throw new Error('useSavedModels must be used within SavedModelsProvider');
  return ctx;
}

export function maskKey(key: string): string {
  if (key.length <= 10) return key ? '••••••••' : '';
  return `${key.slice(0, 5)}${'•'.repeat(14)}${key.slice(-4)}`;
}

export type { ProviderId };
