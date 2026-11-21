import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, ExternalLink, FileText, Images, Loader2, MapPin, Feather, Plus, Trash2, LayoutTemplate } from 'lucide-react';
import type { Entry, Page, PageTemplate } from '../lib/types';
import { cx, fmtDate, readingTime, slugify, today, uid } from '../lib/utils';
import { store } from '../lib/store';
import { useContent } from '../lib/content';
import { TEMPLATES } from '../site/templates';
import { useAdmin, useCollection } from './state';
import { PanelHeader } from './panels';
import { Area, Card, ImageInput, MarkdownField, MediaList, Tags, Text, Toggle } from './fields';

const RESERVED = ['admin', 'projects', 'experience', 'assets', 'api'];
const TEMPLATE_ICON: Record<PageTemplate, typeof FileText> = { blog: FileText, gallery: Images, stories: MapPin, poetry: Feather, custom: LayoutTemplate };

export default function PagesPanel() {
  const { items, setItems, update } = useCollection('pages');
  const { dirty, save } = useAdmin();
  const [open, setOpen] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const page = items.find((p) => p.id === open);

  if (page) return <PageEditor page={page} update={(patch) => update(page.id, patch)} onBack={() => setOpen(null)} onDelete={() => { setItems(items.filter((p) => p.id !== page.id)); setOpen(null); }} />;

  return (
    <>
      <PanelHeader title="Pages & content" description="Your blog and any other pages — photography, travel stories, poetry or free-form pages. Each page uses a template.">
        <button className="btn-primary" onClick={() => setCreating(true)}><Plus className="h-4 w-4" /> New page</button>
      </PanelHeader>
      {creating && (
        <NewPage
          onCancel={() => setCreating(false)}
          onCreate={async (p) => {
            setItems([...items, p]);
            setCreating(false);
            setOpen(p.id);
          }}
          taken={items.map((p) => p.slug)}
        />
      )}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {items.map((p) => {
          const Icon = TEMPLATE_ICON[p.template];
          return (
            <button key={p.id} onClick={() => setOpen(p.id)} className="group rounded-2xl border border-white/[0.07] bg-ink-900/60 p-5 text-left transition hover:border-accent/40">
              <div className="flex items-start justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/10 text-accent"><Icon className="h-5 w-5" /></span>
                <span className={cx('chip', p.visible ? 'border-emerald-500/30 text-emerald-300' : '')}>{p.visible ? 'Live' : 'Hidden'}</span>
              </div>
              <p className="mt-4 font-medium text-zinc-100">{p.title}</p>
              <p className="mt-0.5 text-xs text-zinc-500">/{p.slug} · {TEMPLATES[p.template].label}</p>
              {p.description && <p className="mt-2 line-clamp-2 text-sm text-zinc-400">{p.description}</p>}
            </button>
          );
        })}
      </div>
      {dirty && (
        <p className="mt-6 text-sm text-amber-300/80">
          You have unsaved page changes. <button className="underline" onClick={save}>Save now</button>
        </p>
      )}
    </>
  );
}

function NewPage({ onCreate, onCancel, taken }: { onCreate: (p: Page) => void; onCancel: () => void; taken: string[] }) {
  const [template, setTemplate] = useState<PageTemplate>('blog');
  const [title, setTitle] = useState('');
  const slug = slugify(title);
  const invalid = !title.trim() || RESERVED.includes(slug) || taken.includes(slug);
  return (
    <Card title="Create a page" description="Pick a template — you can change it later.">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {(Object.keys(TEMPLATES) as PageTemplate[]).map((t) => {
          const Icon = TEMPLATE_ICON[t];
          return (
            <button key={t} onClick={() => setTemplate(t)} className={cx('rounded-xl border p-4 text-left transition', template === t ? 'border-accent/60 bg-accent/[0.08]' : 'border-white/10 hover:border-white/20')}>
              <Icon className="h-5 w-5 text-accent" />
              <p className="mt-3 text-sm font-medium text-zinc-100">{TEMPLATES[t].label}</p>
              <p className="mt-1 text-xs text-zinc-500">{TEMPLATES[t].description}</p>
            </button>
          );
        })}
      </div>
      <Text label="Page title" value={title} onChange={setTitle} placeholder="e.g. Travel Stories" hint={title ? (invalid ? `“/${slug}” is taken or reserved` : `URL: /${slug}`) : undefined} />
      <div className="flex gap-2">
        <button
          className="btn-primary"
          disabled={invalid}
          onClick={() => onCreate({ id: uid(), slug, title: title.trim(), description: '', template, cover: '', body: '', showInNav: true, visible: true })}
        >
          Create page
        </button>
        <button className="btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </Card>
  );
}

function PageEditor({ page, update, onBack, onDelete }: { page: Page; update: (p: Partial<Page>) => void; onBack: () => void; onDelete: () => void }) {
  const { items } = useCollection('pages');
  const T = TEMPLATES[page.template];
  const slugTaken = RESERVED.includes(page.slug) || items.some((p) => p.id !== page.id && p.slug === page.slug);
  return (
    <>
      <button onClick={onBack} className="mb-4 flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-100"><ArrowLeft className="h-4 w-4" /> All pages</button>
      <PanelHeader title={page.title || 'Untitled page'} description={`${T.label} · /${page.slug}`}>
        <div className="flex gap-2">
          {page.visible && <a className="btn-ghost" href={`/${page.slug}`} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /> View</a>}
          <button className="btn-ghost hover:!border-red-500/50 hover:!text-red-300" onClick={() => confirm(`Delete the page “${page.title}”? Its entries stay in the database but won’t be shown.`) && onDelete()}><Trash2 className="h-4 w-4" /></button>
        </div>
      </PanelHeader>
      <div className="space-y-5">
        <Card title="Page settings" description="Saved with the main Save button.">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Text label="Title" value={page.title} onChange={(v) => update({ title: v })} />
            <Text label="URL slug" value={page.slug} onChange={(v) => update({ slug: slugify(v) })} hint={slugTaken ? '⚠ This URL is taken or reserved' : `/${page.slug}`} />
            <label className="block">
              <span className="label">Template</span>
              <select className="input" value={page.template} onChange={(e) => update({ template: e.target.value as PageTemplate })}>
                {(Object.keys(TEMPLATES) as PageTemplate[]).map((t) => <option key={t} value={t}>{TEMPLATES[t].label}</option>)}
              </select>
            </label>
            <Text label="Description" value={page.description} onChange={(v) => update({ description: v })} />
          </div>
          <div className="flex flex-wrap gap-6">
            <Toggle label="Published (visible)" checked={page.visible} onChange={(v) => update({ visible: v })} />
            <Toggle label="Show in top navigation" checked={page.showInNav} onChange={(v) => update({ showInNav: v })} />
          </div>
          {page.template === 'custom' ? (
            <>
              <ImageInput label="Banner image (optional)" value={page.cover} onChange={(v) => update({ cover: v })} folder="pages" aspect="aspect-[3/1]" />
              <MarkdownField label="Page content" rows={18} value={page.body} onChange={(v) => update({ body: v })} folder="pages" />
            </>
          ) : (
            <MarkdownField label="Intro text (optional, shown above the list)" rows={3} value={page.body} onChange={(v) => update({ body: v })} />
          )}
        </Card>
        {T.hasEntries && <EntriesManager page={page} />}
      </div>
    </>
  );
}

// ================= Entries (posts / albums / poems / stories) =================
const NOUN: Record<PageTemplate, string> = { blog: 'post', gallery: 'album', stories: 'story', poetry: 'poem', custom: 'entry' };

function EntriesManager({ page }: { page: Page }) {
  const [list, setList] = useState<Entry[] | null>(null);
  const [editing, setEditing] = useState<Entry | null>(null);
  const { toast } = useAdmin();

  const load = useCallback(() => {
    store
      .listEntries(true)
      .then((all) => setList(all.filter((e) => e.page_id === page.id)))
      .catch((e) => toast(e.message, 'err'));
  }, [page.id, toast]);
  useEffect(load, [load]);

  const openEntry = async (e: Entry) => {
    const full = await store.getEntry(e.page_id, e.slug, true);
    setEditing(full ?? e);
  };

  if (editing)
    return (
      <EntryEditor
        page={page}
        initial={editing}
        onClose={() => {
          setEditing(null);
          load();
        }}
      />
    );

  const noun = NOUN[page.template];
  return (
    <Card
      title={`${noun[0].toUpperCase()}${noun.slice(1)}s`}
      description="Each one has its own Save button."
      actions={
        <button
          className="btn-primary !px-3 !py-1.5 text-xs"
          onClick={() => setEditing({ id: store.mode === 'supabase' ? crypto.randomUUID() : uid(), page_id: page.id, slug: '', title: '', excerpt: '', cover: '', date: today(), tags: [], published: false, body: '', extra: {} })}
        >
          <Plus className="h-3.5 w-3.5" /> New {noun}
        </button>
      }
    >
      {list === null ? (
        <div className="grid h-24 place-items-center"><Loader2 className="h-5 w-5 animate-spin text-zinc-500" /></div>
      ) : list.length === 0 ? (
        <p className="py-6 text-center text-sm text-zinc-600">No {noun}s yet — create your first one.</p>
      ) : (
        <ul className="divide-y divide-white/[0.06]">
          {list.map((e) => (
            <li key={e.id}>
              <button onClick={() => openEntry(e)} className="flex w-full items-center gap-3 py-3 text-left hover:bg-white/[0.02]">
                {e.cover ? <img src={e.cover} alt="" className="h-10 w-14 rounded-md object-cover" /> : <div className="h-10 w-14 rounded-md bg-ink-700" />}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-100">{e.title || 'Untitled'}</p>
                  <p className="text-xs text-zinc-500">{fmtDate(e.date)}{e.tags.length ? ` · ${e.tags.join(', ')}` : ''}</p>
                </div>
                <span className={cx('chip', e.published ? 'border-emerald-500/30 text-emerald-300' : 'border-amber-500/30 text-amber-300')}>{e.published ? 'Published' : 'Draft'}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function EntryEditor({ page, initial, onClose }: { page: Page; initial: Entry; onClose: () => void }) {
  const [e, setE] = useState<Entry>(initial);
  const [saving, setSaving] = useState(false);
  const [savedSnap, setSavedSnap] = useState(JSON.stringify(initial));
  const { toast } = useAdmin();
  const { refresh } = useContent();
  const set = (patch: Partial<Entry>) => setE((x) => ({ ...x, ...patch }));
  const setExtra = (patch: Partial<Entry['extra']>) => setE((x) => ({ ...x, extra: { ...x.extra, ...patch } }));
  const dirty = JSON.stringify(e) !== savedSnap;
  const noun = NOUN[page.template];
  const t = page.template;

  const save = async (publish?: boolean) => {
    if (!e.title.trim()) return toast('Give it a title first.', 'err');
    setSaving(true);
    try {
      const next = {
        ...e,
        slug: e.slug || slugify(e.title),
        published: publish ?? e.published,
        extra: { ...e.extra, minutes: readingTime(e.body) },
      };
      const saved = await store.saveEntry(next);
      setE(saved);
      setSavedSnap(JSON.stringify(saved));
      refresh();
      toast(saved.published ? 'Saved & live.' : 'Draft saved.');
    } catch (err) {
      toast(`Save failed: ${err instanceof Error ? err.message : err}`, 'err');
    } finally {
      setSaving(false);
    }
  };

  // Ctrl/Cmd+S saves the entry while the editor is open
  useEffect(() => {
    const k = (ev: KeyboardEvent) => {
      if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 's') {
        ev.preventDefault();
        ev.stopImmediatePropagation();
        if (!saving) save();
      }
    };
    window.addEventListener('keydown', k, true);
    return () => window.removeEventListener('keydown', k, true);
  });

  const remove = async () => {
    if (!confirm(`Delete this ${noun} permanently? This cannot be undone.`)) return;
    try {
      await store.deleteEntry(e.id);
      refresh();
      toast(`${noun} deleted.`);
      onClose();
    } catch (err) {
      toast(`Delete failed: ${err instanceof Error ? err.message : err}`, 'err');
    }
  };

  return (
    <div className="space-y-5">
      <div className="sticky top-14 z-20 -mx-1 flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-ink-900/95 p-2 backdrop-blur lg:top-2">
        <button className="btn-ghost !px-3 !py-1.5 text-xs" onClick={() => (!dirty || confirm('Discard unsaved changes?')) && onClose()}><ArrowLeft className="h-3.5 w-3.5" /> Back</button>
        <span className={cx('chip', e.published ? 'border-emerald-500/30 text-emerald-300' : 'border-amber-500/30 text-amber-300')}>{e.published ? 'Published' : 'Draft'}</span>
        {dirty && <span className="text-xs text-amber-300/80">Unsaved</span>}
        <div className="ml-auto flex flex-wrap gap-2">
          {e.published && e.slug && <a className="btn-ghost !px-3 !py-1.5 text-xs" href={`/${page.slug}/${e.slug}`} target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5" /> View</a>}
          <button className="btn-ghost !px-3 !py-1.5 text-xs hover:!text-red-300" onClick={remove}><Trash2 className="h-3.5 w-3.5" /></button>
          {e.published ? (
            <button className="btn-ghost !px-3 !py-1.5 text-xs" disabled={saving} onClick={() => save(false)}>Unpublish</button>
          ) : (
            <button className="btn-ghost !px-3 !py-1.5 text-xs" disabled={saving} onClick={() => save(false)}>Save draft</button>
          )}
          <button className="btn-primary !px-4 !py-1.5 text-xs" disabled={saving} onClick={() => save(true)}>
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />} {e.published ? 'Save' : 'Publish'}
          </button>
        </div>
      </div>

      <Card title={`${noun[0].toUpperCase()}${noun.slice(1)}`}>
        <input className="w-full bg-transparent text-2xl font-semibold text-zinc-50 outline-none placeholder:text-zinc-700 sm:text-3xl" placeholder={`${noun[0].toUpperCase()}${noun.slice(1)} title`} value={e.title} onChange={(ev) => set({ title: ev.target.value, slug: initial.slug ? e.slug : slugify(ev.target.value) })} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Text label="URL slug" value={e.slug} onChange={(v) => set({ slug: slugify(v) })} hint={`/${page.slug}/${e.slug || '…'}`} />
          <Text label="Date" type="date" value={e.date} onChange={(v) => set({ date: v })} className="[&_input]:[color-scheme:dark]" />
          {(t === 'stories' || t === 'gallery') && <Text label="Location" value={e.extra.location ?? ''} onChange={(v) => setExtra({ location: v })} placeholder="e.g. Sikkim, India" />}
        </div>
        <Area label={t === 'poetry' ? 'Teaser (first lines shown on the list)' : 'Excerpt / summary'} rows={2} value={e.excerpt} onChange={(v) => set({ excerpt: v })} />
        {t !== 'poetry' && <Tags label="Tags" value={e.tags} onChange={(v) => set({ tags: v })} />}
      </Card>

      {t === 'gallery' ? (
        <Card title="Photos" description="The first image is used as the album cover unless you set one.">
          <MediaList value={e.extra.images ?? []} onChange={(v) => setE((x) => ({ ...x, extra: { ...x.extra, images: v }, cover: x.cover || v[0]?.url || '' }))} folder={`pages/${page.slug}`} />
          <div className="max-w-sm"><ImageInput label="Album cover" value={e.cover} onChange={(v) => set({ cover: v })} folder={`pages/${page.slug}`} aspect="aspect-[4/5]" /></div>
          <MarkdownField label="Notes (optional)" rows={5} value={e.body ?? ''} onChange={(v) => set({ body: v })} />
        </Card>
      ) : (
        <Card title="Content">
          <ImageInput label="Cover image" value={e.cover} onChange={(v) => set({ cover: v })} folder={`pages/${page.slug}`} aspect={t === 'stories' ? 'aspect-[21/9]' : 'aspect-video'} />
          <MarkdownField label={t === 'poetry' ? 'Poem' : 'Body'} rows={t === 'poetry' ? 16 : 22} value={e.body ?? ''} onChange={(v) => set({ body: v })} verse={t === 'poetry'} folder={`pages/${page.slug}`} />
          {(t === 'stories' || t === 'blog') && <MediaList label="Photo gallery (optional)" value={e.extra.images ?? []} onChange={(v) => setExtra({ images: v })} folder={`pages/${page.slug}`} />}
        </Card>
      )}
    </div>
  );
}
