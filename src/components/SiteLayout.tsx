import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { useContent } from '../lib/content';
import { cx } from '../lib/utils';
import { sectionAnchor, SocialIcon } from './ui';

export default function SiteLayout() {
  const { site } = useContent();
  const { profile, settings } = site;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const loc = useLocation();

  useEffect(() => setOpen(false), [loc.pathname, loc.hash]);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 12);
    f();
    window.addEventListener('scroll', f, { passive: true });
    return () => window.removeEventListener('scroll', f);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  }, [open]);

  const sectionLinks = site.sections
    .filter((s) => s.visible && s.showInNav)
    .map((s) => ({ to: `/#${sectionAnchor(s)}`, label: s.eyebrow || s.title, page: false }));
  const pageLinks = site.pages
    .filter((p) => p.visible && p.showInNav)
    .map((p) => ({ to: `/${p.slug}`, label: p.title, page: true }));
  const links = [...sectionLinks, ...pageLinks];

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip">
      <header
        className={cx(
          'fixed inset-x-0 top-0 z-50 transition-all duration-300',
          scrolled || open ? 'border-b border-white/[0.06] bg-ink-950/75 backdrop-blur-xl' : 'border-b border-transparent',
        )}
      >
        <nav className="container-x flex h-16 items-center justify-between gap-6">
          <Link to="/" className="group flex items-center gap-2.5" aria-label="Home">
            <span className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-ink-850 font-display text-lg italic text-accent transition group-hover:border-accent/40">
              {profile.shortName?.[0]?.toLowerCase() ?? 'r'}
            </span>
            <span className="text-[15px] font-medium text-zinc-100">{profile.name}</span>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {links.map((l) =>
              l.page ? (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className={({ isActive }) =>
                    cx('rounded-full px-3 py-1.5 text-sm transition', isActive ? 'bg-white/[0.06] text-zinc-50' : 'text-zinc-400 hover:text-zinc-100')
                  }
                >
                  {l.label}
                </NavLink>
              ) : (
                <Link key={l.to} to={l.to} className="rounded-full px-3 py-1.5 text-sm text-zinc-400 transition hover:text-zinc-100">
                  {l.label}
                </Link>
              ),
            )}
            {profile.resumeUrl && (
              <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className="btn-ghost ml-3 !px-4 !py-1.5">
                Résumé <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            )}
          </div>

          <button className="rounded-lg p-2 text-zinc-300 hover:bg-white/5 lg:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menu" aria-expanded={open}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        {/* Mobile drawer */}
        <div className={cx('lg:hidden', open ? 'block' : 'hidden')}>
          <div className="container-x flex h-[calc(100dvh-4rem)] flex-col justify-between pb-10 pt-4">
            <div className="flex flex-col">
              {links.map((l, i) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="animate-rise border-b border-white/[0.06] py-4 text-2xl font-medium text-zinc-100"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  {l.label}
                </Link>
              ))}
              {profile.resumeUrl && (
                <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 py-4 text-2xl font-medium text-accent">
                  Résumé <ArrowUpRight className="h-5 w-5" />
                </a>
              )}
            </div>
            <div className="flex gap-3">
              {profile.socials.map((s) => (
                <a key={s.id} href={s.url} target="_blank" rel="noreferrer" aria-label={s.label} className="grid h-11 w-11 place-items-center rounded-full border border-white/10 text-zinc-300">
                  <SocialIcon name={s.icon} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-white/[0.06]">
        <div className="container-x flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-zinc-300">{profile.name}</p>
            <p className="mt-1 text-xs text-zinc-500">
              © {new Date().getFullYear()} · {settings.footerNote}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.socials.map((s) => (
              <a
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                aria-label={s.label}
                className="grid h-9 w-9 place-items-center rounded-full border border-white/[0.08] text-zinc-400 transition hover:border-accent/40 hover:text-zinc-100"
              >
                <SocialIcon name={s.icon} />
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
