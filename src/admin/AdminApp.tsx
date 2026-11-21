import { useEffect, useState, type FormEvent } from 'react';
import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import {
  Briefcase, ExternalLink, FileStack, FolderGit2, GraduationCap, Home, LayoutDashboard, Loader2, LogOut, Menu, Save, Settings, ScrollText, User, Wrench, X, Undo2, AlertTriangle,
} from 'lucide-react';
import { store, supabase } from '../lib/store';
import { cx } from '../lib/utils';
import { AdminProvider, useAdmin } from './state';
import { Dashboard, EducationPanel, ExperiencePanel, HomePanel, ProfilePanel, ProjectsPanel, PublicationsPanel, SettingsPanel, SkillsPanel } from './panels';
import PagesPanel from './PagesPanel';

type AuthState = 'loading' | 'out' | 'forbidden' | 'in';

export default function AdminApp() {
  const [auth, setAuth] = useState<AuthState>('loading');
  const [email, setEmail] = useState('');

  const check = async () => {
    const u = await store.getUser();
    if (!u) return setAuth('out');
    setEmail(u.email);
    setAuth((await store.isAdmin()) ? 'in' : 'forbidden');
  };

  useEffect(() => {
    document.title = 'Admin · Portfolio';
    check();
    const sub = supabase?.auth.onAuthStateChange(() => check());
    return () => sub?.data.subscription.unsubscribe();
  }, []);

  if (auth === 'loading') return <div className="grid min-h-screen place-items-center"><Loader2 className="h-5 w-5 animate-spin text-zinc-500" /></div>;
  if (auth === 'out') return <Login onDone={check} />;
  if (auth === 'forbidden')
    return (
      <Centered>
        <AlertTriangle className="mx-auto h-8 w-8 text-amber-400" />
        <h1 className="mt-4 text-xl font-semibold">Signed in, but not an admin</h1>
        <p className="mt-2 text-sm text-zinc-400">
          <b>{email}</b> isn’t listed in the <code className="text-accent">admins</code> table. Add your user id there (see README, step 4).
        </p>
        <button className="btn-ghost mt-6" onClick={() => store.signOut().then(check)}>Sign out</button>
      </Centered>
    );

  return (
    <AdminProvider>
      <Shell email={email} onSignOut={() => store.signOut().then(check)} />
    </AdminProvider>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative grid min-h-screen place-items-center px-4">
      <div className="bg-grid absolute inset-0" />
      <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-ink-900/80 p-8 text-center backdrop-blur">{children}</div>
    </div>
  );
}

function Login({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      await store.signIn(email, password);
      onDone();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Centered>
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl border border-white/10 bg-ink-850 font-display text-2xl italic text-accent">r</span>
      <h1 className="mt-5 text-xl font-semibold">Portfolio admin</h1>
      <p className="mt-1 text-sm text-zinc-500">Sign in to edit your site.</p>
      <form onSubmit={submit} className="mt-6 space-y-3 text-left">
        <input className="input" type="email" placeholder="Email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="input" type="password" placeholder="Password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {err && <p className="text-sm text-red-400">{err}</p>}
        <button className="btn-primary w-full" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />} Sign in</button>
      </form>
    </Centered>
  );
}

const NAV = [
  { to: '', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: 'profile', label: 'Profile', icon: User },
  { to: 'home', label: 'Home layout', icon: Home },
  { to: 'experience', label: 'Experience', icon: Briefcase },
  { to: 'projects', label: 'Projects', icon: FolderGit2 },
  { to: 'education', label: 'Education', icon: GraduationCap },
  { to: 'publications', label: 'Publications', icon: ScrollText },
  { to: 'skills', label: 'Skills', icon: Wrench },
  { to: 'pages', label: 'Pages & blog', icon: FileStack },
  { to: 'settings', label: 'Settings', icon: Settings },
];

function Shell({ email, onSignOut }: { email: string; onSignOut: () => void }) {
  const { dirty, saving, save, discard } = useAdmin();
  const [open, setOpen] = useState(false);

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <span className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-ink-850 font-display text-lg italic text-accent">r</span>
        <div>
          <p className="text-sm font-medium text-zinc-100">Portfolio CMS</p>
          <p className="text-[11px] text-zinc-500">{store.mode === 'supabase' ? 'Live database' : 'Local preview mode'}</p>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            onClick={() => setOpen(false)}
            className={({ isActive }) => cx('flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition', isActive ? 'bg-white/[0.07] text-zinc-50' : 'text-zinc-400 hover:bg-white/[0.03] hover:text-zinc-100')}
          >
            <n.icon className="h-4 w-4" strokeWidth={1.75} /> {n.label}
          </NavLink>
        ))}
      </nav>
      <div className="space-y-1 border-t border-white/[0.06] p-3">
        <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:text-zinc-100">
          <ExternalLink className="h-4 w-4" /> View site
        </a>
        {store.mode === 'supabase' && (
          <button onClick={onSignOut} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-zinc-400 hover:text-zinc-100">
            <LogOut className="h-4 w-4" /> <span className="truncate">Sign out · {email}</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-ink-950 lg:pl-60">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 border-r border-white/[0.06] bg-ink-900/60 lg:block">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <aside className="absolute inset-y-0 left-0 w-64 animate-rise border-r border-white/10 bg-ink-900" onClick={(e) => e.stopPropagation()}>{sidebar}</aside>
        </div>
      )}

      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-white/[0.06] bg-ink-950/85 px-4 backdrop-blur lg:px-8">
        <button className="rounded-lg p-1.5 text-zinc-300 hover:bg-white/5 lg:hidden" onClick={() => setOpen(true)} aria-label="Menu">{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
        {store.mode === 'local' && <span className="hidden rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs text-amber-300 sm:inline">Local mode — saved in this browser only</span>}
        <div className="ml-auto flex items-center gap-2">
          {dirty && <span className="hidden text-xs text-amber-300/90 sm:inline">Unsaved changes</span>}
          {dirty && (
            <button className="btn-ghost !px-3 !py-1.5 text-xs" onClick={() => confirm('Discard all unsaved changes?') && discard()} disabled={saving}>
              <Undo2 className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Discard</span>
            </button>
          )}
          <button className={cx('btn !px-4 !py-1.5 text-xs', dirty ? 'bg-accent text-ink-950 hover:brightness-110' : 'border border-white/10 text-zinc-500')} disabled={!dirty || saving} onClick={save}>
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} {saving ? 'Saving…' : dirty ? 'Save' : 'Saved'}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 lg:px-8 2xl:max-w-7xl">
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<ProfilePanel />} />
          <Route path="home" element={<HomePanel />} />
          <Route path="experience" element={<ExperiencePanel />} />
          <Route path="projects" element={<ProjectsPanel />} />
          <Route path="education" element={<EducationPanel />} />
          <Route path="publications" element={<PublicationsPanel />} />
          <Route path="skills" element={<SkillsPanel />} />
          <Route path="pages" element={<PagesPanel />} />
          <Route path="settings" element={<SettingsPanel />} />
          <Route path="*" element={<Navigate to="" replace />} />
        </Routes>
      </main>
    </div>
  );
}
