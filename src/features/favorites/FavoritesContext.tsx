import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

const STORAGE_KEY = 'velora:favorites';

interface FavoritesValue {
  ids: number[];
  has: (id: number) => boolean;
  toggle: (id: number) => boolean;
  clear: () => void;
}

const FavoritesContext = createContext<FavoritesValue | null>(null);

function readStored(): number[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v): v is number => Number.isInteger(v) && v > 0).slice(0, 60) : [];
  } catch {
    return [];
  }
}

/** Saved homes live in this browser only (no account needed); they sync across tabs. */
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<number[]>(readStored);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      /* storage unavailable (private mode): favourites still work for this session */
    }
  }, [ids]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setIds(readStored());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const has = useCallback((id: number) => ids.includes(id), [ids]);
  const toggle = useCallback(
    (id: number) => {
      const willSave = !ids.includes(id);
      setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev].slice(0, 60)));
      return willSave;
    },
    [ids],
  );
  const clear = useCallback(() => setIds([]), []);

  const value = useMemo(() => ({ ids, has, toggle, clear }), [ids, has, toggle, clear]);
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used inside FavoritesProvider');
  return ctx;
}
