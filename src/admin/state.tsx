import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { SiteData } from '../lib/types';
import { normalizeSite, store } from '../lib/store';
import { useContent } from '../lib/content';
import { SITE_VERSION } from '../lib/seed';

interface Toast { id: number; kind: 'ok' | 'err'; text: string }

interface AdminState {
  draft: SiteData;
  setDraft: (fn: (d: SiteData) => SiteData) => void;
  dirty: boolean;
  saving: boolean;
  save: () => Promise<boolean>;
  discard: () => void;
  upload: (f: File, folder: string) => Promise<string>;
  toast: (text: string, kind?: Toast['kind']) => void;
  hasRemoteSite: boolean;
}

const Ctx = createContext<AdminState | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const { refresh } = useContent();
  const [base, setBase] = useState<SiteData | null>(null);
  const [draft, setDraftState] = useState<SiteData | null>(null);
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [hasRemoteSite, setHasRemote] = useState(true);
  const tid = useRef(0);

  const toast = useCallback((text: string, kind: Toast['kind'] = 'ok') => {
    const id = ++tid.current;
    setToasts((t) => [...t, { id, kind, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === 'err' ? 7000 : 3000);
  }, []);

  useEffect(() => {
    store
      .loadSite()
      .then((s) => {
        setHasRemote(!!s);
        const n = normalizeSite(s);
        setBase(n);
        setDraftState(structuredClone(n));
      })
      .catch((e) => toast(`Could not load content: ${e.message}`, 'err'));
  }, [toast]);

  const dirty = useMemo(() => !!draft && !!base && JSON.stringify(draft) !== JSON.stringify(base), [draft, base]);

  // warn before leaving with unsaved changes
  useEffect(() => {
    const f = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', f);
    return () => window.removeEventListener('beforeunload', f);
  }, [dirty]);

  const save = useCallback(async () => {
    if (!draft) return false;
    setSaving(true);
    try {
      const next = { ...draft, version: SITE_VERSION };
      await store.saveSite(next);
      setBase(structuredClone(next));
      setHasRemote(true);
      await refresh();
      toast('Saved — your site is updated.');
      return true;
    } catch (e) {
      toast(`Save failed: ${e instanceof Error ? e.message : e}`, 'err');
      return false;
    } finally {
      setSaving(false);
    }
  }, [draft, refresh, toast]);

  // Ctrl/Cmd + S
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (dirty && !saving) save();
      }
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [dirty, saving, save]);

  const upload = useCallback(
    async (f: File, folder: string) => {
      try {
        return await store.upload(f, folder);
      } catch (e) {
        toast(`Upload failed: ${e instanceof Error ? e.message : e}`, 'err');
        throw e;
      }
    },
    [toast],
  );

  if (!draft || !base)
    return <div className="grid min-h-screen place-items-center text-sm text-zinc-500">Loading content…</div>;

  const value: AdminState = {
    draft,
    setDraft: (fn) => setDraftState((d) => (d ? fn(d) : d)),
    dirty,
    saving,
    save,
    discard: () => setDraftState(structuredClone(base)),
    upload,
    toast,
    hasRemoteSite,
  };

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[200] flex w-[min(92vw,380px)] flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto animate-rise rounded-xl border px-4 py-3 text-sm shadow-2xl backdrop-blur ${
              t.kind === 'ok' ? 'border-emerald-500/30 bg-emerald-950/80 text-emerald-200' : 'border-red-500/30 bg-red-950/80 text-red-200'
            }`}
          >
            {t.text}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useAdmin() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAdmin outside provider');
  return v;
}

/** Helper to update one array item in the draft by id. */
export function useCollection<K extends 'experiences' | 'education' | 'projects' | 'publications' | 'skills' | 'pages' | 'sections'>(key: K) {
  const { draft, setDraft } = useAdmin();
  type Item = SiteData[K][number];
  const items = draft[key] as Item[];
  return {
    items,
    setItems: (next: Item[]) => setDraft((d) => ({ ...d, [key]: next })),
    update: (id: string, patch: Partial<Item>) =>
      setDraft((d) => ({ ...d, [key]: (d[key] as Item[]).map((x) => ((x as { id: string }).id === id ? { ...x, ...patch } : x)) })),
  };
}
