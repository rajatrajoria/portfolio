import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Entry, Page, SiteData } from './types';
import { normalizeSite, store } from './store';
import { hexToRgbVar } from './utils';

interface ContentState {
  site: SiteData;
  entries: Entry[]; // published entries (metadata only)
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  pageBySlug: (slug: string) => Page | undefined;
}

const Ctx = createContext<ContentState | null>(null);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [site, setSite] = useState<SiteData>(() => normalizeSite(null));
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [s, e] = await Promise.all([store.loadSite(), store.listEntries(false)]);
      setSite(normalizeSite(s));
      setEntries(e);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', hexToRgbVar(site.settings.accent));
  }, [site.settings.accent]);

  const value = useMemo<ContentState>(
    () => ({
      site,
      entries,
      loading,
      error,
      refresh,
      pageBySlug: (slug) => site.pages.find((p) => p.slug === slug),
    }),
    [site, entries, loading, error, refresh],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useContent() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useContent outside provider');
  return v;
}

export function useTitle(title?: string) {
  const { site } = useContent();
  useEffect(() => {
    document.title = title ? `${title} · ${site.profile.name}` : site.settings.siteTitle;
  }, [title, site.profile.name, site.settings.siteTitle]);
}
