import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Entry, SiteData } from './types';
import { seedEntries, seedSite } from './seed';
import { blobToDataUrl, compressImage } from './image';
import { slugify, uid } from './utils';

/**
 * Storage backend. Two implementations:
 *  - Supabase (production): Postgres + Auth + Storage. Used when VITE_SUPABASE_* env vars exist.
 *  - Local (preview): browser localStorage. Lets you try the CMS before setting anything up.
 */
export interface Store {
  mode: 'supabase' | 'local';
  loadSite(): Promise<SiteData | null>;
  saveSite(site: SiteData): Promise<void>;
  listEntries(includeDrafts: boolean): Promise<Entry[]>; // without body
  getEntry(pageId: string, slug: string, includeDrafts: boolean): Promise<Entry | null>;
  saveEntry(e: Entry): Promise<Entry>;
  deleteEntry(id: string): Promise<void>;
  upload(file: File, folder: string): Promise<string>;
  getUser(): Promise<{ email: string } | null>;
  isAdmin(): Promise<boolean>;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
}

const META_COLS = 'id,page_id,slug,title,excerpt,cover,date,tags,published,extra,updated_at';

class SupabaseStore implements Store {
  mode = 'supabase' as const;
  constructor(private sb: SupabaseClient) {}

  async loadSite() {
    const { data, error } = await this.sb.from('site').select('data').eq('id', 1).maybeSingle();
    if (error) throw error;
    return (data?.data as SiteData) ?? null;
  }
  async saveSite(site: SiteData) {
    const { error } = await this.sb.from('site').upsert({ id: 1, data: site, updated_at: new Date().toISOString() });
    if (error) throw error;
  }
  async listEntries(includeDrafts: boolean) {
    let q = this.sb.from('entries').select(META_COLS).order('date', { ascending: false });
    if (!includeDrafts) q = q.eq('published', true);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []) as Entry[];
  }
  async getEntry(pageId: string, slug: string, includeDrafts: boolean) {
    let q = this.sb.from('entries').select('*').eq('page_id', pageId).eq('slug', slug);
    if (!includeDrafts) q = q.eq('published', true);
    const { data, error } = await q.maybeSingle();
    if (error) throw error;
    return (data as Entry) ?? null;
  }
  async saveEntry(e: Entry) {
    const row = { ...e, slug: e.slug || slugify(e.title), updated_at: new Date().toISOString() };
    const { data, error } = await this.sb.from('entries').upsert(row).select('*').single();
    if (error) throw error;
    return data as Entry;
  }
  async deleteEntry(id: string) {
    const { error } = await this.sb.from('entries').delete().eq('id', id);
    if (error) throw error;
  }
  async upload(file: File, folder: string) {
    const blob = await compressImage(file);
    const ext = blob.type === 'image/webp' ? 'webp' : (file.name.split('.').pop() || 'bin').toLowerCase();
    const base = slugify(file.name.replace(/\.[^.]+$/, '')).slice(0, 40);
    const path = `${folder}/${Date.now().toString(36)}-${base}.${ext}`;
    const { error } = await this.sb.storage.from('media').upload(path, blob, {
      contentType: blob.type || file.type,
      cacheControl: '31536000',
    });
    if (error) throw error;
    return this.sb.storage.from('media').getPublicUrl(path).data.publicUrl;
  }
  async getUser() {
    const { data } = await this.sb.auth.getSession();
    const u = data.session?.user;
    return u ? { email: u.email ?? '' } : null;
  }
  async isAdmin() {
    const { data, error } = await this.sb.rpc('is_admin');
    return !error && data === true;
  }
  async signIn(email: string, password: string) {
    const { error } = await this.sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }
  async signOut() {
    await this.sb.auth.signOut();
  }
}

const LS_SITE = 'portfolio.site';
const LS_ENTRIES = 'portfolio.entries';

class LocalStore implements Store {
  mode = 'local' as const;
  private read<T>(k: string, fallback: T): T {
    try {
      const v = localStorage.getItem(k);
      return v ? (JSON.parse(v) as T) : fallback;
    } catch {
      return fallback;
    }
  }
  private write(k: string, v: unknown) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch (e) {
      throw new Error('Browser storage is full. Use smaller images, or connect Supabase for real storage.');
    }
  }
  private all(): Entry[] {
    return this.read<Entry[]>(LS_ENTRIES, seedEntries);
  }
  async loadSite() {
    return this.read<SiteData | null>(LS_SITE, null);
  }
  async saveSite(site: SiteData) {
    this.write(LS_SITE, site);
  }
  async listEntries(includeDrafts: boolean) {
    return this.all()
      .filter((e) => includeDrafts || e.published)
      .map(({ body: _b, ...rest }) => rest as Entry)
      .sort((a, b) => b.date.localeCompare(a.date));
  }
  async getEntry(pageId: string, slug: string, includeDrafts: boolean) {
    return this.all().find((e) => e.page_id === pageId && e.slug === slug && (includeDrafts || e.published)) ?? null;
  }
  async saveEntry(e: Entry) {
    const list = this.all();
    const row = { ...e, id: e.id || uid(), slug: e.slug || slugify(e.title), updated_at: new Date().toISOString() };
    const clash = list.find((x) => x.page_id === row.page_id && x.slug === row.slug && x.id !== row.id);
    if (clash) throw new Error(`Another entry on this page already uses the slug "${row.slug}".`);
    const i = list.findIndex((x) => x.id === row.id);
    if (i >= 0) list[i] = row;
    else list.push(row);
    this.write(LS_ENTRIES, list);
    return row;
  }
  async deleteEntry(id: string) {
    this.write(LS_ENTRIES, this.all().filter((e) => e.id !== id));
  }
  async upload(file: File) {
    // keep local-mode images small so localStorage doesn't overflow
    return blobToDataUrl(await compressImage(file, 1200, 0.75));
  }
  async getUser() {
    return { email: 'local-preview' };
  }
  async isAdmin() {
    return true;
  }
  async signIn() {}
  async signOut() {}
}

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase = url && key ? createClient(url, key) : null;
export const store: Store = supabase ? new SupabaseStore(supabase) : new LocalStore();

/** Fill any fields missing from older saved documents with defaults from the seed. */
export function normalizeSite(s: SiteData | null): SiteData {
  if (!s) return structuredClone(seedSite);
  const profile = { ...seedSite.profile, ...s.profile };
  if (!s.profile?.badges) {
    // migrate the old single "availability" string into a badge list
    profile.badges = s.profile?.availability
      ? [{ id: 'b-legacy', label: s.profile.availability, color: 'emerald', pulse: true }]
      : [];
  }
  return {
    ...seedSite,
    ...s,
    profile,
    settings: { ...seedSite.settings, ...s.settings },
    sections: s.sections ?? seedSite.sections,
    experiences: s.experiences ?? [],
    education: s.education ?? [],
    projects: s.projects ?? [],
    publications: s.publications ?? [],
    skills: s.skills ?? [],
    pages: s.pages ?? [],
  };
}
