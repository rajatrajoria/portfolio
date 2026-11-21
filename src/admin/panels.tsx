import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Download, Plus, Trash2, Upload, Database, Sparkles } from 'lucide-react';
import type { Badge, BadgeColor, Card as CardT, Education, Experience, HomeSection, Project, Publication, SectionType, SkillGroup, SiteData } from '../lib/types';
import { experienceRange, fmtYears, slugify, totalExperienceYears, uid } from '../lib/utils';
import { BADGE_COLORS, Logo, SOCIAL_ICON_OPTIONS, SocialIcon, StatusBadge, badgeDot } from '../components/ui';
import { store } from '../lib/store';
import { seedEntries, seedSite } from '../lib/seed';
import { useAdmin, useCollection } from './state';
import ListDetail from './ListDetail';
import { Area, Attachments, Card, ImageInput, MarkdownField, MediaList, Month, Select, Tags, Text, Toggle, IconBtn } from './fields';

export function PanelHeader({ title, description, children }: { title: string; description?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-zinc-500">{description}</p>}
      </div>
      {children}
    </div>
  );
}

const Grid = ({ children, cols = 2 }: { children: React.ReactNode; cols?: 2 | 3 }) => (
  <div className={cols === 3 ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3' : 'grid grid-cols-1 gap-4 sm:grid-cols-2'}>{children}</div>
);

// ===================== Dashboard =====================
export function Dashboard() {
  const { draft, hasRemoteSite } = useAdmin();
  const years = totalExperienceYears(draft.experiences);
  const tiles = [
    { k: fmtYears(years), v: 'Years of experience (auto)', to: 'experience' },
    { k: draft.experiences.length, v: 'Experiences', to: 'experience' },
    { k: draft.projects.length, v: 'Projects', to: 'projects' },
    { k: draft.pages.length, v: 'Pages', to: 'pages' },
  ];
  return (
    <>
      <PanelHeader title={`Welcome back, ${draft.profile.shortName || 'there'}`} description="Edit anything from the sidebar. Changes go live the moment you hit Save (or press Ctrl/⌘ + S)." />
      {!hasRemoteSite && <StarterBanner />}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((t) => (
          <Link key={t.v} to={t.to} className="rounded-2xl border border-white/[0.07] bg-ink-900/60 p-5 transition hover:border-white/15">
            <p className="text-3xl font-semibold text-zinc-50">{t.k}</p>
            <p className="mt-1 text-xs text-zinc-500">{t.v}</p>
          </Link>
        ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card title="Quick actions">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {[
              ['Edit profile & photo', 'profile'],
              ['Rearrange home page', 'home'],
              ['Add an experience', 'experience'],
              ['Write a blog post', 'pages'],
              ['Create a new page', 'pages'],
              ['Theme & backup', 'settings'],
            ].map(([l, to]) => (
              <Link key={l} to={to} className="flex items-center justify-between rounded-lg border border-white/[0.06] px-3 py-2.5 text-sm text-zinc-300 hover:border-accent/40 hover:text-zinc-50">
                {l} <ArrowUpRight className="h-4 w-4 text-zinc-600" />
              </Link>
            ))}
          </div>
        </Card>
        <Card title="How it works">
          <ul className="space-y-2.5 text-sm text-zinc-400">
            <li><b className="text-zinc-200">Profile, home layout, experience, projects…</b> are edited as a draft. Hit <b className="text-zinc-200">Save</b> to publish all of it at once.</li>
            <li><b className="text-zinc-200">Blog posts & other page entries</b> have their own Save / Publish buttons.</li>
            <li><b className="text-zinc-200">Years of experience</b> and role durations are calculated from your dates against today — nothing to update by hand.</li>
            <li>Every save keeps the previous version in the database, and you can download a full backup from <Link className="link-accent" to="settings">Settings</Link>.</li>
          </ul>
        </Card>
      </div>
    </>
  );
}

function StarterBanner() {
  const { save, toast } = useAdmin();
  const [busy, setBusy] = useState(false);
  return (
    <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-accent/30 bg-accent/[0.07] p-5 sm:flex-row sm:items-center">
      <Database className="h-6 w-6 shrink-0 text-accent" />
      <div className="flex-1 text-sm">
        <p className="font-medium text-zinc-100">Your site is showing starter content.</p>
        <p className="text-zinc-400">Publish it to the {store.mode === 'supabase' ? 'database' : 'browser store'} to start editing for real (includes the sample blog post).</p>
      </div>
      <button
        className="btn-primary"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            for (const e of seedEntries) {
              const exists = await store.getEntry(e.page_id, e.slug, true);
              if (!exists) await store.saveEntry(store.mode === 'supabase' ? { ...e, id: crypto.randomUUID() } : e);
            }
            await save();
          } catch (err) {
            toast(`Failed: ${err instanceof Error ? err.message : err}`, 'err');
          } finally {
            setBusy(false);
          }
        }}
      >
        <Sparkles className="h-4 w-4" /> Publish starter content
      </button>
    </div>
  );
}

// ===================== Profile =====================
export function ProfilePanel() {
  const { draft, setDraft } = useAdmin();
  const p = draft.profile;
  const set = (patch: Partial<typeof p>) => setDraft((d) => ({ ...d, profile: { ...d.profile, ...patch } }));
  return (
    <>
      <PanelHeader title="Profile" description="Your name, photo, intro and links — used across the whole site." />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <Card title="Identity">
            <Grid>
              <Text label="Full name" value={p.name} onChange={(v) => set({ name: v })} />
              <Text label="Short name" hint="Used in “Hi, I’m …”" value={p.shortName} onChange={(v) => set({ shortName: v })} />
              <Text label="Headline" value={p.headline} onChange={(v) => set({ headline: v })} placeholder="Software Engineer" />
              <Text label="Location" value={p.location} onChange={(v) => set({ location: v })} />
              <Text label="Email" type="email" value={p.email} onChange={(v) => set({ email: v })} />
            </Grid>
            <Tags label="Rotating roles in the hero" value={p.roles} onChange={(v) => set({ roles: v })} hint="These cycle under your name. Press Enter after each." />
          </Card>
          <BadgesEditor badges={p.badges} onChange={(badges) => set({ badges })} />
          <Card title="Intro & about">
            <MarkdownField label="Hero intro (short)" rows={4} value={p.intro} onChange={(v) => set({ intro: v })} />
            <MarkdownField label="About section (long)" rows={10} value={p.about} onChange={(v) => set({ about: v })} />
          </Card>
          <Card title="Social links" actions={<button className="btn-ghost !px-3 !py-1 text-xs" onClick={() => set({ socials: [...p.socials, { id: uid(), label: 'Website', url: '', icon: 'globe' }] })}><Plus className="h-3.5 w-3.5" /> Add</button>}>
            {p.socials.map((s, i) => (
              <div key={s.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-2 sm:grid-cols-[auto_8rem_7rem_1fr_auto]">
                <span className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-zinc-300"><SocialIcon name={s.icon} /></span>
                <input className="input" value={s.label} placeholder="Label" onChange={(e) => set({ socials: p.socials.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })} />
                <select className="input order-last col-span-2 sm:order-none sm:col-span-1" value={s.icon} onChange={(e) => set({ socials: p.socials.map((x, j) => (j === i ? { ...x, icon: e.target.value } : x)) })}>
                  {SOCIAL_ICON_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                </select>
                <input className="input col-span-3 sm:col-span-1" value={s.url} placeholder="https://" onChange={(e) => set({ socials: p.socials.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)) })} />
                <IconBtn label="Remove" onClick={() => set({ socials: p.socials.filter((_, j) => j !== i) })} className="h-9 w-9 border border-white/10"><Trash2 className="h-3.5 w-3.5" /></IconBtn>
              </div>
            ))}
          </Card>
        </div>
        <div className="space-y-5">
          <Card title="Photo">
            <ImageInput value={p.avatar} onChange={(v) => set({ avatar: v })} folder="profile" aspect="aspect-[4/5]" />
          </Card>
          <Card title="Résumé" description="Upload a PDF or paste a link. Shows a Résumé button in the nav.">
            <ResumeInput value={p.resumeUrl} onChange={(v) => set({ resumeUrl: v })} />
          </Card>
        </div>
      </div>
    </>
  );
}

function BadgesEditor({ badges, onChange }: { badges: Badge[]; onChange: (b: Badge[]) => void }) {
  const set = (i: number, patch: Partial<Badge>) => onChange(badges.map((b, j) => (j === i ? { ...b, ...patch } : b)));
  const presets = ['Open to interesting problems', 'Open to new roles', 'Available for freelance', 'Building something new', 'Open to mentoring'];
  return (
    <Card
      title="Status badges"
      description="Small pills above your name. Add as many as you like; hide any without deleting it."
      actions={<button className="btn-ghost !px-3 !py-1 text-xs" onClick={() => onChange([...badges, { id: uid(), label: 'New badge', color: 'sky', pulse: false }])}><Plus className="h-3.5 w-3.5" /> Add</button>}
    >
      {badges.length > 0 && (
        <div className="flex flex-wrap gap-2 rounded-xl border border-white/[0.06] bg-ink-950 p-3">
          {badges.filter((b) => !b.hidden && b.label).map((b) => <StatusBadge key={b.id} label={b.label} color={b.color} pulse={b.pulse} />)}
          {!badges.some((b) => !b.hidden && b.label) && <span className="text-xs text-zinc-600">All badges hidden</span>}
        </div>
      )}
      {badges.map((b, i) => (
        <div key={b.id} className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
          <input className="input flex-1 basis-full sm:basis-auto" value={b.label} onChange={(e) => set(i, { label: e.target.value })} />
          <div className="flex items-center gap-1">
            {BADGE_COLORS.map((c) => (
              <button key={c} aria-label={c} title={c} onClick={() => set(i, { color: c as BadgeColor })} className={`h-5 w-5 rounded-full ${badgeDot(c)} ${b.color === c ? 'ring-2 ring-white/70 ring-offset-2 ring-offset-ink-900' : 'opacity-50 hover:opacity-100'}`} />
            ))}
          </div>
          <label className="flex items-center gap-1.5 text-xs text-zinc-400"><input type="checkbox" checked={b.pulse} onChange={(e) => set(i, { pulse: e.target.checked })} className="accent-[rgb(var(--accent))]" /> Pulse</label>
          <label className="flex items-center gap-1.5 text-xs text-zinc-400"><input type="checkbox" checked={!!b.hidden} onChange={(e) => set(i, { hidden: e.target.checked })} className="accent-[rgb(var(--accent))]" /> Hide</label>
          <IconBtn label="Remove" onClick={() => onChange(badges.filter((_, j) => j !== i))} className="h-9 w-9 shrink-0 border border-white/10"><Trash2 className="h-3.5 w-3.5" /></IconBtn>
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-zinc-600">Quick add:</span>
        {presets.filter((p) => !badges.some((b) => b.label === p)).map((p) => (
          <button key={p} className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-zinc-400 hover:border-accent/40 hover:text-zinc-100" onClick={() => onChange([...badges, { id: uid(), label: p, color: 'sky', pulse: false }])}>+ {p}</button>
        ))}
      </div>
    </Card>
  );
}

function ResumeInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { upload } = useAdmin();
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  return (
    <div className="space-y-2">
      <input className="input" placeholder="https://…/resume.pdf" value={value.startsWith('data:') ? '(uploaded file)' : value} onChange={(e) => onChange(e.target.value)} />
      <div className="flex gap-2">
        <button className="btn-ghost !px-3 !py-1.5 text-xs" disabled={busy} onClick={() => ref.current?.click()}>
          <Upload className="h-3.5 w-3.5" /> {busy ? 'Uploading…' : 'Upload PDF'}
        </button>
        {value && <a href={value} target="_blank" rel="noreferrer" className="btn-ghost !px-3 !py-1.5 text-xs">Open</a>}
      </div>
      <input ref={ref} type="file" accept="application/pdf" hidden onChange={async (e) => { const f = e.target.files?.[0]; e.target.value = ''; if (!f) return; setBusy(true); try { onChange(await upload(f, 'resume')); } finally { setBusy(false); } }} />
    </div>
  );
}

// ===================== Home layout =====================
export const SECTION_TYPES: Record<SectionType, { label: string; description: string }> = {
  hero: { label: 'Hero', description: 'Your name, rotating roles, intro, photo and links.' },
  stats: { label: 'Stats strip', description: 'Auto-calculated years of experience, project count, current company.' },
  about: { label: 'About', description: 'The long “About” text from your profile with quick facts.' },
  experience: { label: 'Experience', description: 'Timeline of roles, each linking to its detail page.' },
  projects: { label: 'Projects', description: 'Grid of featured projects.' },
  skills: { label: 'Skills', description: 'Skill groups as chips.' },
  publications: { label: 'Publications', description: 'Research papers with status badges.' },
  education: { label: 'Education', description: 'Schools and degrees.' },
  feed: { label: 'Latest from a page', description: 'Newest entries from any page — blog, photos, travel…' },
  cards: { label: 'Cards', description: 'Free-form cards with image, title and text (hobbies, values, services…).' },
  markdown: { label: 'Text block', description: 'Any markdown content: a quote, an announcement, a “now” section.' },
  contact: { label: 'Contact', description: 'Call-to-action with email and links.' },
};

export function HomePanel() {
  const { items, setItems } = useCollection('sections');
  const { draft } = useAdmin();
  const [sel, setSel] = useState<string | null>(items[0]?.id ?? null);
  const [adding, setAdding] = useState(false);

  const addSection = (type: SectionType) => {
    const s: HomeSection = { id: uid(), type, visible: true, eyebrow: SECTION_TYPES[type].label, title: SECTION_TYPES[type].label, subtitle: '', showInNav: false };
    if (type === 'feed') { s.pageId = draft.pages[0]?.id; s.limit = 3; }
    if (type === 'cards') s.cards = [];
    if (type === 'markdown') s.body = '';
    setItems([...items.slice(0, -1), s, ...items.slice(-1)]); // before the last (usually contact)
    setSel(s.id);
    setAdding(false);
  };

  return (
    <>
      <PanelHeader title="Home page" description="Reorder, hide, rename or add sections. Sections marked “In nav” appear in the top navigation." />
      <ListDetail<HomeSection>
        items={items}
        onChange={setItems}
        selectedId={sel}
        onSelect={setSel}
        title={(s) => s.title || SECTION_TYPES[s.type].label}
        subtitle={(s) => `${SECTION_TYPES[s.type].label}${s.showInNav ? ' · In nav' : ''}`}
        muted={(s) => !s.visible}
        addLabel="Add section"
        create={() => ({ id: uid(), type: 'markdown', visible: true, eyebrow: '', title: 'New section', subtitle: '', showInNav: false, body: '' })}
        duplicate={(s) => ({ ...structuredClone(s), id: uid(), title: `${s.title} (copy)` })}
        addMenu={
          <div>
            <button onClick={() => setAdding((a) => !a)} className="btn w-full justify-center rounded-xl border border-dashed border-white/15 py-3 text-zinc-300 hover:border-accent/50 hover:text-zinc-50">
              <Plus className="h-4 w-4" /> Add section
            </button>
            {adding && (
              <div className="mt-2 grid gap-1.5 rounded-xl border border-white/10 bg-ink-900 p-2">
                {(Object.keys(SECTION_TYPES) as SectionType[]).map((t) => (
                  <button key={t} onClick={() => addSection(t)} className="rounded-lg px-3 py-2 text-left hover:bg-white/[0.05]">
                    <span className="block text-sm text-zinc-100">{SECTION_TYPES[t].label}</span>
                    <span className="block text-xs text-zinc-500">{SECTION_TYPES[t].description}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        }
      >
        {(s, update) => <SectionEditor s={s} update={update} site={draft} />}
      </ListDetail>
    </>
  );
}

function SectionEditor({ s, update, site }: { s: HomeSection; update: (p: Partial<HomeSection>) => void; site: SiteData }) {
  const noHeader = s.type === 'hero' || s.type === 'stats';
  return (
    <>
      <Card title={SECTION_TYPES[s.type].label} description={SECTION_TYPES[s.type].description}>
        <div className="flex flex-wrap gap-6">
          <Toggle label="Visible" checked={s.visible} onChange={(v) => update({ visible: v })} />
          {!noHeader && <Toggle label="Show in top navigation" checked={s.showInNav} onChange={(v) => update({ showInNav: v })} />}
        </div>
        {noHeader ? (
          <p className="text-sm text-zinc-500">
            This section pulls its content from your <Link className="link-accent" to="../profile">Profile</Link>
            {s.type === 'stats' && <> and <Link className="link-accent" to="../experience">Experience</Link> dates</>}.
          </p>
        ) : (
          <>
            <Grid>
              <Text label="Eyebrow (small label)" value={s.eyebrow} onChange={(v) => update({ eyebrow: v })} hint="Also used as the nav label & #anchor" />
              <Text label="Title" value={s.title} onChange={(v) => update({ title: v })} />
            </Grid>
            <Area label="Subtitle" rows={2} value={s.subtitle} onChange={(v) => update({ subtitle: v })} />
          </>
        )}
        {(s.type === 'feed' || s.type === 'projects') && (
          <Grid>
            {s.type === 'feed' && (
              <Select label="Show entries from page" value={s.pageId ?? ''} options={site.pages.filter((p) => p.template !== 'custom').map((p) => ({ value: p.id, label: p.title }))} onChange={(v) => update({ pageId: v })} />
            )}
            <Text label="How many to show" type="number" value={String(s.limit ?? 3)} onChange={(v) => update({ limit: Math.max(1, Number(v) || 1) })} />
          </Grid>
        )}
        {s.type === 'markdown' && <MarkdownField label="Content" value={s.body ?? ''} onChange={(v) => update({ body: v })} />}
      </Card>
      {s.type === 'cards' && <CardsEditor cards={s.cards ?? []} onChange={(cards) => update({ cards })} />}
      {['experience', 'projects', 'skills', 'publications', 'education'].includes(s.type) && (
        <p className="text-sm text-zinc-500">
          Items for this section are managed under <Link className="link-accent" to={`../${s.type === 'experience' ? 'experience' : s.type}`}>{SECTION_TYPES[s.type].label}</Link> in the sidebar.
        </p>
      )}
    </>
  );
}

function CardsEditor({ cards, onChange }: { cards: CardT[]; onChange: (c: CardT[]) => void }) {
  const set = (i: number, patch: Partial<CardT>) => onChange(cards.map((c, j) => (j === i ? { ...c, ...patch } : c)));
  return (
    <Card title="Cards" actions={<button className="btn-ghost !px-3 !py-1 text-xs" onClick={() => onChange([...cards, { id: uid(), title: 'New card', body: '', image: '', url: '' }])}><Plus className="h-3.5 w-3.5" /> Add card</button>}>
      {cards.length === 0 && <p className="text-sm text-zinc-600">No cards yet.</p>}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {cards.map((c, i) => (
          <div key={c.id} className="space-y-3 rounded-xl border border-white/10 p-4">
            <div className="flex items-center gap-2">
              <input className="input font-medium" value={c.title} onChange={(e) => set(i, { title: e.target.value })} />
              <IconBtn label="Up" onClick={() => { if (i) { const n = [...cards]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; onChange(n); } }} className="h-9 w-9 shrink-0 border border-white/10">↑</IconBtn>
              <IconBtn label="Delete" onClick={() => onChange(cards.filter((_, j) => j !== i))} className="h-9 w-9 shrink-0 border border-white/10"><Trash2 className="h-3.5 w-3.5" /></IconBtn>
            </div>
            <input className="input text-xs" placeholder="Small subtitle (e.g. Coursera · Apr 2023)" value={c.meta ?? ''} onChange={(e) => set(i, { meta: e.target.value })} />
            <div className="grid grid-cols-[96px_1fr] gap-3">
              <ImageInput label="Logo" value={c.logo ?? ''} onChange={(v) => set(i, { logo: v })} folder="logos" aspect="aspect-square" />
              <ImageInput label="Cover image" value={c.image} onChange={(v) => set(i, { image: v })} folder="cards" aspect="aspect-[16/9]" />
            </div>
            <Area rows={3} placeholder="Text (markdown)" value={c.body} onChange={(v) => set(i, { body: v })} />
            <input className="input text-xs" placeholder="Optional link URL" value={c.url} onChange={(e) => set(i, { url: e.target.value })} />
          </div>
        ))}
      </div>
    </Card>
  );
}

// ===================== Experience =====================
const XP_TYPES = ['Full-time', 'Internship', 'Research', 'Part-time', 'Freelance', 'Contract', 'Volunteer'] as const;

export function ExperiencePanel() {
  const { items, setItems } = useCollection('experiences');
  const years = totalExperienceYears(items);
  return (
    <>
      <PanelHeader title="Experience" description={`Each role gets its own detail page with photos and certificates. Total counted experience right now: ${fmtYears(years)} years.`} />
      <ListDetail<Experience>
        items={items}
        onChange={setItems}
        title={(e) => e.role}
        subtitle={(e) => `${e.company} · ${experienceRange(e).label}`}
        thumb={(e) => <Logo src={e.logo} name={e.company || '?'} className="h-9 w-9 text-sm" />}
        muted={(e) => !!e.hidden}
        addLabel="Add experience"
        create={() => ({ id: uid(), slug: '', company: 'New company', role: 'Role', type: 'Full-time', location: '', start: new Date().toISOString().slice(0, 7), end: '', logo: '', cover: '', url: '', summary: '', body: '', highlights: [], skills: [], gallery: [], attachments: [], countsTowardTotal: true })}
        duplicate={(e) => ({ ...structuredClone(e), id: uid(), slug: `${e.slug}-copy` })}
      >
        {(e, update) => {
          const r = experienceRange(e);
          return (
            <>
              <Card title="Role">
                <Grid>
                  <Text label="Company" value={e.company} onChange={(v) => update({ company: v, slug: e.slug && e.slug !== slugify(e.company) ? e.slug : slugify(v) })} />
                  <Text label="Role / title" value={e.role} onChange={(v) => update({ role: v })} />
                  <Select label="Type" value={e.type} options={XP_TYPES} onChange={(v) => update({ type: v })} />
                  <Text label="Location" value={e.location} onChange={(v) => update({ location: v })} />
                  <Month label="Start" value={e.start} onChange={(v) => update({ start: v })} />
                  <Month label="End" value={e.end} onChange={(v) => update({ end: v })} hint="Leave empty if this is your current role" />
                  <Text label="Company website" value={e.url} onChange={(v) => update({ url: v })} />
                  <Text label="URL slug" value={e.slug} onChange={(v) => update({ slug: slugify(v) })} hint={`/experience/${e.slug || '…'}`} />
                </Grid>
                <p className="text-xs text-zinc-500">Duration (auto): <span className="text-zinc-300">{r.duration}</span>{r.current && ' — updates every month'}</p>
                <div className="flex flex-wrap gap-6">
                  <Toggle label="Count toward “years of experience”" checked={e.countsTowardTotal} onChange={(v) => update({ countsTowardTotal: v })} hint="Usually on for full-time roles, off for internships" />
                  <Toggle label="Hidden" checked={!!e.hidden} onChange={(v) => update({ hidden: v })} />
                </div>
              </Card>
              <Card title="Branding">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-[160px_1fr]">
                  <ImageInput label="Logo" value={e.logo} onChange={(v) => update({ logo: v })} folder="logos" aspect="aspect-square" />
                  <ImageInput label="Cover image (detail page banner)" value={e.cover} onChange={(v) => update({ cover: v })} folder="covers" />
                </div>
              </Card>
              <Card title="Story">
                <Area label="Summary (shown on the home page card)" rows={2} value={e.summary} onChange={(v) => update({ summary: v })} />
                <Tags label="Highlights" value={e.highlights} onChange={(v) => update({ highlights: v })} hint="Short bullet wins, shown as cards on the detail page" />
                <Tags label="Skills" value={e.skills} onChange={(v) => update({ skills: v })} />
                <MarkdownField label="Full description (detail page)" rows={14} value={e.body} onChange={(v) => update({ body: v })} folder="experience" />
              </Card>
              <Card title="Photos & certificates">
                <MediaList label="Gallery" value={e.gallery} onChange={(v) => update({ gallery: v })} folder="experience" hint="Team photos, events, awards — opens in a lightbox." />
                <Attachments value={e.attachments} onChange={(v) => update({ attachments: v })} />
              </Card>
            </>
          );
        }}
      </ListDetail>
    </>
  );
}

// ===================== Education =====================
export function EducationPanel() {
  const { items, setItems } = useCollection('education');
  return (
    <>
      <PanelHeader title="Education" />
      <ListDetail<Education>
        items={items}
        onChange={setItems}
        title={(e) => e.school}
        subtitle={(e) => `${e.degree} · ${e.start}–${e.end || 'Present'}`}
        thumb={(e) => <Logo src={e.logo} name={e.school || '?'} className="h-9 w-9 text-sm" />}
        muted={(e) => !!e.hidden}
        addLabel="Add education"
        create={() => ({ id: uid(), school: 'New school', degree: '', start: '', end: '', grade: '', description: '', logo: '' })}
      >
        {(e, update) => (
          <Card title="Details">
            <Grid>
              <Text label="School / university" value={e.school} onChange={(v) => update({ school: v })} />
              <Text label="Degree" value={e.degree} onChange={(v) => update({ degree: v })} />
              <Text label="Start year" value={e.start} onChange={(v) => update({ start: v })} />
              <Text label="End year" value={e.end} onChange={(v) => update({ end: v })} hint="Empty = Present" />
              <Text label="Grade" value={e.grade} onChange={(v) => update({ grade: v })} />
            </Grid>
            <Area label="Description" value={e.description} onChange={(v) => update({ description: v })} />
            <div className="max-w-[160px]"><ImageInput label="Logo" value={e.logo} onChange={(v) => update({ logo: v })} folder="logos" aspect="aspect-square" /></div>
            <Toggle label="Hidden" checked={!!e.hidden} onChange={(v) => update({ hidden: v })} />
          </Card>
        )}
      </ListDetail>
    </>
  );
}

// ===================== Projects =====================
export function ProjectsPanel() {
  const { items, setItems } = useCollection('projects');
  return (
    <>
      <PanelHeader title="Projects" description="Featured projects appear on the home page; all visible projects appear on /projects." />
      <ListDetail<Project>
        items={items}
        onChange={setItems}
        title={(p) => p.title}
        subtitle={(p) => `${p.featured ? '★ Featured · ' : ''}${p.tags.slice(0, 3).join(', ')}`}
        thumb={(p) => (p.cover ? <img src={p.cover} alt="" className="h-9 w-12 rounded-md object-cover" /> : <div className="h-9 w-12 rounded-md bg-gradient-to-br from-accent/30 to-ink-700" />)}
        muted={(p) => !!p.hidden}
        addLabel="Add project"
        create={() => ({ id: uid(), slug: '', title: 'New project', summary: '', body: '', cover: '', tags: [], github: '', live: '', date: new Date().toISOString().slice(0, 7), featured: false, gallery: [] })}
        duplicate={(p) => ({ ...structuredClone(p), id: uid(), slug: `${p.slug}-copy`, title: `${p.title} (copy)` })}
      >
        {(p, update) => (
          <>
            <Card title="Basics">
              <Grid>
                <Text label="Title" value={p.title} onChange={(v) => update({ title: v, slug: p.slug && p.slug !== slugify(p.title) ? p.slug : slugify(v) })} />
                <Text label="URL slug" value={p.slug} onChange={(v) => update({ slug: slugify(v) })} hint={`/projects/${p.slug || '…'}`} />
                <Text label="GitHub URL" value={p.github} onChange={(v) => update({ github: v })} />
                <Text label="Live URL" value={p.live} onChange={(v) => update({ live: v })} />
                <Month label="Date" value={p.date} onChange={(v) => update({ date: v })} />
              </Grid>
              <Tags label="Tags / tech" value={p.tags} onChange={(v) => update({ tags: v })} />
              <div className="flex flex-wrap gap-6">
                <Toggle label="Featured on home page" checked={p.featured} onChange={(v) => update({ featured: v })} />
                <Toggle label="Hidden" checked={!!p.hidden} onChange={(v) => update({ hidden: v })} />
              </div>
            </Card>
            <Card title="Content">
              <ImageInput label="Cover image" value={p.cover} onChange={(v) => update({ cover: v })} folder="projects" />
              <Area label="Summary" rows={2} value={p.summary} onChange={(v) => update({ summary: v })} />
              <MarkdownField label="Details" value={p.body} onChange={(v) => update({ body: v })} folder="projects" />
              <MediaList label="Screenshots" value={p.gallery} onChange={(v) => update({ gallery: v })} folder="projects" />
            </Card>
          </>
        )}
      </ListDetail>
    </>
  );
}

// ===================== Publications =====================
export function PublicationsPanel() {
  const { items, setItems } = useCollection('publications');
  return (
    <>
      <PanelHeader title="Publications" />
      <ListDetail<Publication>
        items={items}
        onChange={setItems}
        title={(p) => p.title}
        subtitle={(p) => `${p.status} · ${p.year}`}
        muted={(p) => !!p.hidden}
        addLabel="Add publication"
        create={() => ({ id: uid(), title: 'New publication', venue: '', year: String(new Date().getFullYear()), status: 'Under review', summary: '', url: '', cover: '' })}
      >
        {(p, update) => (
          <Card title="Details">
            <Area label="Title" rows={2} value={p.title} onChange={(v) => update({ title: v })} />
            <Grid>
              <Text label="Venue / journal" value={p.venue} onChange={(v) => update({ venue: v })} />
              <Text label="Year" value={p.year} onChange={(v) => update({ year: v })} />
              <Select label="Status" value={p.status} options={['Published', 'Accepted', 'Under review', 'Preprint'] as const} onChange={(v) => update({ status: v })} />
              <Text label="Link (DOI / PDF / repo)" value={p.url} onChange={(v) => update({ url: v })} />
            </Grid>
            <Area label="Summary" rows={3} value={p.summary} onChange={(v) => update({ summary: v })} />
            <div className="max-w-xs"><ImageInput label="Thumbnail" value={p.cover} onChange={(v) => update({ cover: v })} folder="publications" aspect="aspect-[4/3]" /></div>
            <Toggle label="Hidden" checked={!!p.hidden} onChange={(v) => update({ hidden: v })} />
          </Card>
        )}
      </ListDetail>
    </>
  );
}

// ===================== Skills =====================
export function SkillsPanel() {
  const { items, setItems } = useCollection('skills');
  const set = (i: number, patch: Partial<SkillGroup>) => setItems(items.map((g, j) => (j === i ? { ...g, ...patch } : g)));
  return (
    <>
      <PanelHeader title="Skills" description="Group your skills; each group renders as a card.">
        <button className="btn-ghost" onClick={() => setItems([...items, { id: uid(), name: 'New group', items: [] }])}><Plus className="h-4 w-4" /> Add group</button>
      </PanelHeader>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {items.map((g, i) => (
          <Card key={g.id} title={g.name || 'Untitled'} actions={
            <div className="flex gap-1">
              <IconBtn label="Move up" onClick={() => { if (i) { const n = [...items]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; setItems(n); } }} className="border border-white/10">↑</IconBtn>
              <IconBtn label="Delete" onClick={() => confirm(`Delete group “${g.name}”?`) && setItems(items.filter((_, j) => j !== i))} className="border border-white/10"><Trash2 className="h-3.5 w-3.5" /></IconBtn>
            </div>
          }>
            <Text label="Group name" value={g.name} onChange={(v) => set(i, { name: v })} />
            <Tags label="Skills" value={g.items} onChange={(v) => set(i, { items: v })} />
          </Card>
        ))}
      </div>
    </>
  );
}

// ===================== Settings =====================
const ACCENTS = ['#a78bfa', '#818cf8', '#60a5fa', '#22d3ee', '#34d399', '#a3e635', '#fbbf24', '#fb923c', '#f472b6', '#f87171'];

export function SettingsPanel() {
  const { draft, setDraft, toast } = useAdmin();
  const s = draft.settings;
  const set = (patch: Partial<typeof s>) => setDraft((d) => ({ ...d, settings: { ...d.settings, ...patch } }));
  const file = useRef<HTMLInputElement>(null);

  const exportAll = async () => {
    const entries = await store.listEntries(true);
    const full = await Promise.all(entries.map((e) => store.getEntry(e.page_id, e.slug, true)));
    const blob = new Blob([JSON.stringify({ site: draft, entries: full.filter(Boolean) }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importAll = async (f: File) => {
    try {
      const data = JSON.parse(await f.text());
      if (!data.site?.profile) throw new Error('Not a portfolio backup file');
      if (!confirm('Replace the current draft with this backup? Entries in the file will be added/updated. Nothing is published until you hit Save.')) return;
      setDraft(() => data.site);
      const isUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
      for (const e of data.entries ?? []) {
        const existing = await store.getEntry(e.page_id, e.slug, true);
        await store.saveEntry({ ...e, id: existing?.id ?? (isUuid(e.id) ? e.id : crypto.randomUUID()) });
      }
      toast('Backup loaded into the draft — review and hit Save to publish.');
    } catch (e) {
      toast(`Import failed: ${e instanceof Error ? e.message : e}`, 'err');
    }
  };

  return (
    <>
      <PanelHeader title="Settings" />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card title="Theme">
          <Field2 label="Accent colour">
            <div className="flex flex-wrap items-center gap-2">
              {ACCENTS.map((c) => (
                <button key={c} aria-label={c} onClick={() => set({ accent: c })} className="h-8 w-8 rounded-full ring-offset-2 ring-offset-ink-900 transition hover:scale-110" style={{ background: c, boxShadow: s.accent === c ? `0 0 0 2px #07080a, 0 0 0 4px ${c}` : undefined }} />
              ))}
              <input type="color" value={s.accent} onChange={(e) => set({ accent: e.target.value })} className="h-8 w-10 cursor-pointer rounded border border-white/10 bg-transparent" />
            </div>
          </Field2>
          <Toggle label="Show technology logos next to skills" hint="Java, Spring Boot, Kafka… get their icons automatically" checked={s.showSkillIcons} onChange={(v) => set({ showSkillIcons: v })} />
          <Text label="Label for the experience stat" value={s.experienceLabel} onChange={(v) => set({ experienceLabel: v })} />
          <Text label="Footer note" value={s.footerNote} onChange={(v) => set({ footerNote: v })} />
        </Card>
        <Card title="SEO">
          <Text label="Browser tab / search title" value={s.siteTitle} onChange={(v) => set({ siteTitle: v })} />
          <Area label="Description" value={s.description} onChange={(v) => set({ description: v })} />
        </Card>
        <Card title="Backup & restore" description="Download everything (site + all entries) as one JSON file, or restore from one.">
          <div className="flex flex-wrap gap-2">
            <button className="btn-ghost" onClick={exportAll}><Download className="h-4 w-4" /> Download backup</button>
            <button className="btn-ghost" onClick={() => file.current?.click()}><Upload className="h-4 w-4" /> Restore from file</button>
            <button className="btn-ghost" onClick={() => confirm('Reset the draft to the original starter content? (Not published until you Save.)') && setDraft(() => structuredClone(seedSite))}>Reset to starter</button>
          </div>
          <input ref={file} type="file" accept="application/json" hidden onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) importAll(f); }} />
        </Card>
        <Card title="Storage">
          <p className="text-sm text-zinc-400">
            Mode: <b className="text-zinc-100">{store.mode === 'supabase' ? 'Supabase (live database)' : 'Local preview (this browser only)'}</b>
          </p>
          {store.mode === 'local' && (
            <p className="text-sm text-zinc-500">Changes are saved only in this browser. Follow the README to connect Supabase (free) so edits go live for everyone and images are stored properly.</p>
          )}
        </Card>
      </div>
    </>
  );
}

function Field2({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="label">{label}</p>
      {children}
    </div>
  );
}
