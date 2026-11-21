import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ArrowLeft, ChevronLeft, ChevronRight, Github, Globe, Instagram, Linkedin, Mail, Twitter, X, Youtube, BookOpen, Link2,
} from 'lucide-react';
import { cx, initials, slugify } from '../lib/utils';
import type { HomeSection, MediaItem } from '../lib/types';

export function Markdown({ children, className }: { children?: string; className?: string }) {
  if (!children) return null;
  return (
    <div className={cx('prose-dark', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children, node: _n, ...p }) => {
            const ext = href && /^https?:/.test(href);
            return (
              <a href={href} {...p} {...(ext ? { target: '_blank', rel: 'noreferrer' } : {})}>
                {children}
              </a>
            );
          },
          img: ({ src, alt }) => <img src={src} alt={alt ?? ''} loading="lazy" />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

const ICONS: Record<string, typeof Github> = {
  github: Github, linkedin: Linkedin, twitter: Twitter, x: Twitter, instagram: Instagram, mail: Mail, email: Mail,
  globe: Globe, website: Globe, youtube: Youtube, medium: BookOpen, link: Link2,
};
export const SOCIAL_ICON_OPTIONS = ['github', 'linkedin', 'twitter', 'instagram', 'youtube', 'medium', 'mail', 'globe', 'link'];
export function SocialIcon({ name, className = 'h-4 w-4' }: { name: string; className?: string }) {
  const I = ICONS[name?.toLowerCase()] ?? Link2;
  return <I className={className} strokeWidth={1.75} />;
}

/** Fades children in when scrolled into view. */
export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) return setInView(true);
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.01 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={cx('reveal', inView && 'in', className)} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </div>
  );
}

export const sectionAnchor = (s: HomeSection) => slugify(s.eyebrow || s.title || s.type);

export function SectionHeader({ eyebrow, title, subtitle, action }: { eyebrow?: string; title?: string; subtitle?: string; action?: ReactNode }) {
  if (!eyebrow && !title && !subtitle) return null;
  return (
    <Reveal className="mb-10 flex flex-col gap-4 sm:mb-14 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        {title && <h2 className="text-3xl font-semibold sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">{title}</h2>}
        {subtitle && <p className="mt-4 text-base text-zinc-400 sm:text-lg">{subtitle}</p>}
      </div>
      {action}
    </Reveal>
  );
}

export function Logo({ src, name, className = 'h-12 w-12' }: { src?: string; name: string; className?: string }) {
  return src ? (
    <img src={src} alt={name} className={cx(className, 'shrink-0 rounded-xl bg-white object-contain p-1.5')} loading="lazy" />
  ) : (
    <div className={cx(className, 'grid shrink-0 place-items-center rounded-xl border border-white/10 bg-gradient-to-br from-accent/25 to-accent/5 font-display text-xl italic text-zinc-50')}>
      {initials(name)}
    </div>
  );
}

export function BackLink({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} className="group mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-zinc-100">
      <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-0.5" /> {label}
    </Link>
  );
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="card grid place-items-center px-6 py-20 text-center">
      <p className="font-display text-3xl italic text-zinc-200">{title}</p>
      {children && <div className="mt-3 max-w-md text-sm text-zinc-500">{children}</div>}
    </div>
  );
}

/** Full-screen image viewer with keyboard + swipe support. */
export function Lightbox({ items, index, onClose, onIndex }: { items: MediaItem[]; index: number | null; onClose: () => void; onIndex: (i: number) => void }) {
  const touch = useRef<number | null>(null);
  const open = index !== null;
  const go = (d: number) => index !== null && onIndex((index + d + items.length) % items.length);
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', k);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', k);
      document.body.style.overflow = '';
    };
  });
  if (index === null || !items[index]) return null;
  const item = items[index];
  return (
    <div
      className="fixed inset-0 z-[100] flex animate-rise flex-col bg-black/95 backdrop-blur-md"
      onClick={onClose}
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touch.current === null) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        touch.current = null;
      }}
    >
      <div className="flex items-center justify-between p-4 text-sm text-zinc-400">
        <span className="font-mono">
          {index + 1} / {items.length}
        </span>
        <button aria-label="Close" className="rounded-full p-2 hover:bg-white/10" onClick={onClose}>
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-16">
        <img src={item.url} alt={item.caption ?? ''} className="max-h-full max-w-full rounded-lg object-contain" onClick={(e) => e.stopPropagation()} />
        {items.length > 1 && (
          <>
            <button aria-label="Previous" onClick={(e) => { e.stopPropagation(); go(-1); }} className="absolute left-2 hidden rounded-full bg-white/10 p-3 hover:bg-white/20 sm:block">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button aria-label="Next" onClick={(e) => { e.stopPropagation(); go(1); }} className="absolute right-2 hidden rounded-full bg-white/10 p-3 hover:bg-white/20 sm:block">
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
      <p className="min-h-[3.5rem] px-6 py-4 text-center text-sm text-zinc-300">{item.caption}</p>
    </div>
  );
}

/** Responsive masonry gallery that opens a lightbox. */
export function Gallery({ items, className }: { items: MediaItem[]; className?: string }) {
  const [i, setI] = useState<number | null>(null);
  if (!items?.length) return null;
  return (
    <>
      <div className={cx('columns-1 gap-3 sm:columns-2 lg:columns-3 [&>*]:mb-3', className)}>
        {items.map((m, idx) => (
          <button key={m.url + idx} onClick={() => setI(idx)} className="group relative block w-full overflow-hidden rounded-xl border border-white/[0.06] bg-ink-900">
            <img src={m.url} alt={m.caption ?? ''} loading="lazy" className="w-full transition duration-500 group-hover:scale-[1.03]" />
            {m.caption && (
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-10 text-left text-xs text-zinc-200 opacity-0 transition group-hover:opacity-100">
                {m.caption}
              </span>
            )}
          </button>
        ))}
      </div>
      <Lightbox items={items} index={i} onClose={() => setI(null)} onIndex={setI} />
    </>
  );
}

export function Spinner() {
  return <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-accent" />;
}

/** Placeholder art for items without a cover image — deterministic from the title. */
export function CoverFallback({ title, className }: { title: string; className?: string }) {
  let h = 0;
  for (const c of title) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const a = h % 360;
  return (
    <div
      className={cx('relative overflow-hidden', className)}
      style={{
        background: `radial-gradient(120% 90% at ${20 + (h % 60)}% 0%, rgb(var(--accent) / .35), transparent 60%), radial-gradient(80% 80% at 100% 100%, hsl(${a} 60% 35% / .35), transparent 60%), #101115`,
      }}
    >
      <div className="bg-grid absolute inset-0 opacity-60" />
      <span className="absolute bottom-3 left-4 right-4 truncate font-display text-2xl italic text-white/80">{title}</span>
    </div>
  );
}

// ---------------- Status badges ----------------
const BADGE_STYLES: Record<string, { pill: string; dot: string }> = {
  emerald: { pill: 'border-emerald-500/25 bg-emerald-500/[0.07] text-emerald-200', dot: 'bg-emerald-400' },
  sky: { pill: 'border-sky-500/25 bg-sky-500/[0.07] text-sky-200', dot: 'bg-sky-400' },
  violet: { pill: 'border-violet-500/25 bg-violet-500/[0.07] text-violet-200', dot: 'bg-violet-400' },
  amber: { pill: 'border-amber-500/25 bg-amber-500/[0.07] text-amber-200', dot: 'bg-amber-400' },
  rose: { pill: 'border-rose-500/25 bg-rose-500/[0.07] text-rose-200', dot: 'bg-rose-400' },
  zinc: { pill: 'border-white/10 bg-white/[0.03] text-zinc-300', dot: 'bg-zinc-400' },
};
export const BADGE_COLORS = Object.keys(BADGE_STYLES) as (keyof typeof BADGE_STYLES)[];
export const badgeDot = (c: string) => (BADGE_STYLES[c] ?? BADGE_STYLES.zinc).dot;

export function StatusBadge({ label, color, pulse }: { label: string; color: string; pulse: boolean }) {
  const s = BADGE_STYLES[color] ?? BADGE_STYLES.zinc;
  return (
    <span className={cx('inline-flex items-center gap-2 rounded-full border py-1 pl-2.5 pr-3 text-xs', s.pill)}>
      <span className="relative flex h-2 w-2">
        {pulse && <span className={cx('absolute inline-flex h-full w-full animate-ping rounded-full opacity-60', s.dot)} />}
        <span className={cx('relative inline-flex h-2 w-2 rounded-full', s.dot)} />
      </span>
      {label}
    </span>
  );
}

// ---------------- Technology icons (Simple Icons CDN, CC0) ----------------
const TECH_ICON: Record<string, string> = {
  java: 'openjdk', python: 'python', typescript: 'typescript', javascript: 'javascript', 'c++': 'cplusplus', cpp: 'cplusplus',
  'spring boot': 'springboot', 'spring security': 'springsecurity', kafka: 'apachekafka', 'apache kafka': 'apachekafka',
  mongodb: 'mongodb', postgresql: 'postgresql', postgres: 'postgresql', flyway: 'flyway', docker: 'docker', grafana: 'grafana',
  'cloudflare tunnel': 'cloudflare', cloudflare: 'cloudflare', react: 'react', 'react.js': 'react', tailwind: 'tailwindcss',
  tailwindcss: 'tailwindcss', 'html & css': 'html5', html: 'html5', fastapi: 'fastapi', tensorflow: 'tensorflow', pytorch: 'pytorch',
  ollama: 'ollama', git: 'git', linux: 'linux', 'node.js': 'nodedotjs', nodejs: 'nodedotjs', langchain: 'langchain',
  claude: 'claude', anthropic: 'anthropic', redis: 'redis', mysql: 'mysql', kubernetes: 'kubernetes', aws: 'amazonwebservices',
  firebase: 'firebase', 'next.js': 'nextdotjs', supabase: 'supabase', github: 'github', figma: 'figma', jenkins: 'jenkins',
};
export const techIcon = (name: string) => {
  const slug = TECH_ICON[name.trim().toLowerCase()];
  return slug ? `https://cdn.simpleicons.org/${slug}/d4d4d8` : null;
};

export function TechLabel({ name, icons, className }: { name: string; icons: boolean; className?: string }) {
  const src = icons ? techIcon(name) : null;
  return (
    <span className={cx('inline-flex items-center gap-1.5', className)}>
      {src && <img src={src} alt="" className="h-3.5 w-3.5 opacity-90" loading="lazy" />}
      {name}
    </span>
  );
}
