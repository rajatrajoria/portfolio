import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Copy, Check, Github, MapPin, Sparkles, Mail } from 'lucide-react';
import { useContent } from '../lib/content';
import type { Entry, HomeSection, Page, Project, SiteData } from '../lib/types';
import { cx, experienceRange, fmtDate, fmtYears, sortByStartDesc, totalExperienceYears } from '../lib/utils';
import { CoverFallback, Logo, Markdown, Reveal, SectionHeader, SocialIcon, StatusBadge, TechLabel, sectionAnchor } from '../components/ui';

type Props = { s: HomeSection; site: SiteData };

const workAnchor = (site: SiteData) => {
  const sec =
    site.sections.find((x) => x.visible && x.type === 'experience') ??
    site.sections.find((x) => x.visible && x.type === 'projects');
  return sec ? sectionAnchor(sec) : '';
};

export function Hero({ site }: Props) {
  const { profile } = site;
  const roles = profile.roles.filter(Boolean);
  const [i, setI] = useState(0);
  useEffect(() => {
    if (roles.length < 2) return;
    const t = setInterval(() => setI((x) => (x + 1) % roles.length), 2600);
    return () => clearInterval(t);
  }, [roles.length]);
  const current = sortByStartDesc(site.experiences.filter((e) => !e.hidden)).find((e) => !e.end);

  return (
    <section className="relative isolate pt-28 sm:pt-36 lg:pt-40">
      <div className="bg-grid absolute inset-0 -z-10" />
      <div className="absolute left-1/2 top-0 -z-10 h-[520px] w-[900px] max-w-[140vw] -translate-x-1/2 rounded-full bg-accent/[0.13] blur-[120px]" />
      <div className="container-x grid items-center gap-12 pb-16 lg:grid-cols-[1.25fr_1fr] lg:gap-16 lg:pb-24">
        <div className="animate-rise">
          {profile.badges.some((b) => !b.hidden && b.label) && (
            <div className="mb-7 flex flex-wrap gap-2">
              {profile.badges
                .filter((b) => !b.hidden && b.label)
                .map((b) => (
                  <StatusBadge key={b.id} label={b.label} color={b.color} pulse={b.pulse} />
                ))}
            </div>
          )}
          <h1 className="text-[2.6rem] font-semibold leading-[1.05] sm:text-6xl lg:text-7xl 3xl:text-8xl">
            Hi, I’m {profile.shortName}.
            <br />
            <span className="relative inline-block h-[1.15em] overflow-hidden align-bottom font-display font-normal italic text-gradient">
              <span key={i} className="block animate-rise">{roles[i] ?? profile.headline}</span>
            </span>
          </h1>
          <Markdown className="mt-7 max-w-xl text-base sm:text-lg [&_p]:text-zinc-400 [&_strong]:text-zinc-100">{profile.intro}</Markdown>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link to={`/#${workAnchor(site)}`} className="btn-primary">
              View my work <ArrowRight className="h-4 w-4" />
            </Link>
            {profile.email && (
              <a href={`mailto:${profile.email}`} className="btn-ghost">
                <Mail className="h-4 w-4" /> Get in touch
              </a>
            )}
          </div>
          <div className="mt-8 flex items-center gap-1.5">
            {profile.socials.map((s) => (
              <a key={s.id} href={s.url} target="_blank" rel="noreferrer" aria-label={s.label} className="grid h-10 w-10 place-items-center rounded-full text-zinc-400 transition hover:bg-white/[0.06] hover:text-zinc-100">
                <SocialIcon name={s.icon} className="h-[18px] w-[18px]" />
              </a>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-sm animate-rise [animation-delay:150ms] lg:max-w-none">
          <div className="absolute -inset-px rounded-[2rem] bg-gradient-to-b from-accent/40 via-white/5 to-transparent" />
          <div className="relative overflow-hidden rounded-[2rem] bg-ink-900 p-2">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.6rem]">
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.name} className="h-full w-full object-cover" />
              ) : (
                <CoverFallback title={profile.name} className="h-full w-full" />
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-5 pt-24">
                <p className="text-lg font-medium text-white">{profile.name}</p>
                <p className="mt-0.5 text-sm text-zinc-300">
                  {current ? `${current.role} · ${current.company}` : profile.headline}
                </p>
                {profile.location && (
                  <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs text-zinc-200 backdrop-blur">
                    <MapPin className="h-3 w-3" /> {profile.location}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Stats({ site }: Props) {
  const { entries } = useContent();
  const visibleXp = site.experiences.filter((e) => !e.hidden);
  const years = totalExperienceYears(visibleXp);
  const current = sortByStartDesc(visibleXp).find((e) => !e.end);
  const items = [
    { k: fmtYears(years), v: site.settings.experienceLabel || 'Years of experience' },
    { k: String(site.projects.filter((p) => !p.hidden).length), v: 'Projects shipped' },
    site.publications.filter((p) => !p.hidden).length
      ? { k: String(site.publications.filter((p) => !p.hidden).length), v: 'Research publications' }
      : { k: String(entries.length), v: 'Posts written' },
    { k: current?.company ?? '—', v: 'Currently at', small: true },
  ];
  return (
    <section className="container-x pb-8">
      <Reveal className="grid grid-cols-2 overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.07] lg:grid-cols-4 [&>*]:bg-ink-900" >
        {items.map((it, idx) => (
          <div key={idx} className={cx('p-5 sm:p-7', 'border-white/[0.07]', idx % 2 === 0 && 'border-r', idx < 2 && 'border-b lg:border-b-0', idx === 1 && 'lg:border-r', idx === 2 && 'lg:border-r')}>
            <p className={cx('font-semibold text-zinc-50', it.small ? 'truncate text-xl sm:text-2xl lg:text-3xl' : 'text-3xl sm:text-4xl lg:text-5xl')}>{it.k}</p>
            <p className="mt-2 text-xs text-zinc-500 sm:text-sm">{it.v}</p>
          </div>
        ))}
      </Reveal>
    </section>
  );
}

export function About({ s, site }: Props) {
  const { profile } = site;
  const edu = site.education.filter((e) => !e.hidden)[0];
  const current = sortByStartDesc(site.experiences.filter((e) => !e.hidden)).find((e) => !e.end);
  const facts = [
    current && { k: 'Role', v: `${current.role}, ${current.company}` },
    profile.location && { k: 'Based in', v: profile.location },
    edu && { k: 'Studied', v: `${edu.degree}, ${edu.school}` },
    profile.email && { k: 'Email', v: profile.email, href: `mailto:${profile.email}` },
  ].filter(Boolean) as { k: string; v: string; href?: string }[];
  return (
    <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
      <Reveal>
        <SectionHeader eyebrow={s.eyebrow} title={s.title} subtitle={s.subtitle} />
        <Markdown className="text-base sm:text-lg [&_p]:leading-relaxed">{profile.about}</Markdown>
      </Reveal>
      <Reveal delay={100} className="lg:pt-24">
        <dl className="card divide-y divide-white/[0.06]">
          {facts.map((f) => (
            <div key={f.k} className="flex flex-col gap-1 p-5">
              <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">{f.k}</dt>
              <dd className="text-zinc-200">{f.href ? <a className="link-accent break-all" href={f.href}>{f.v}</a> : f.v}</dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </div>
  );
}

export function ExperienceList({ s, site }: Props) {
  const list = sortByStartDesc(site.experiences.filter((e) => !e.hidden));
  return (
    <>
      <SectionHeader eyebrow={s.eyebrow} title={s.title} subtitle={s.subtitle} />
      <ol className="relative space-y-4">
        {list.map((e, idx) => {
          const r = experienceRange(e);
          return (
            <Reveal key={e.id} delay={idx * 60}>
              <Link
                to={`/experience/${e.slug}`}
                className="card card-hover group relative flex flex-col gap-5 overflow-hidden p-5 sm:flex-row sm:items-start sm:gap-6 sm:p-7"
              >
                {e.cover && (
                  <img
                    src={e.cover}
                    alt=""
                    loading="lazy"
                    className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-1/2 object-cover opacity-[0.14] transition duration-700 [mask-image:linear-gradient(to_left,#000_20%,transparent)] group-hover:scale-105 group-hover:opacity-25 md:block"
                  />
                )}
                <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100 glow" />
                <Logo src={e.logo} name={e.company} className="h-12 w-12 sm:h-14 sm:w-14" />
                <div className="relative min-w-0 flex-1">
                  <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between md:gap-6">
                    <div>
                      <h3 className="text-lg font-semibold sm:text-xl">{e.role}</h3>
                      <p className="mt-0.5 text-zinc-300">
                        {e.company}
                        <span className="text-zinc-600"> · </span>
                        <span className="text-zinc-500">{e.type}</span>
                      </p>
                    </div>
                    <div className="shrink-0 md:text-right">
                      <p className="font-mono text-xs text-zinc-400">{r.label}</p>
                      <p className="mt-1 text-xs text-zinc-600">
                        {r.duration}
                        {e.location && ` · ${e.location}`}
                      </p>
                    </div>
                  </div>
                  {e.summary && <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-zinc-400">{e.summary}</p>}
                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    {r.current && <span className="chip border-emerald-500/30 bg-emerald-500/10 text-emerald-300">Current</span>}
                    {e.skills.slice(0, 6).map((k) => (
                      <span key={k} className="chip">{k}</span>
                    ))}
                    <span className="ml-auto inline-flex items-center gap-1 text-sm text-zinc-500 transition group-hover:text-accent">
                      Details <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </ol>
    </>
  );
}

export function ProjectCard({ p, idx = 0 }: { p: Project; idx?: number }) {
  return (
    <Reveal delay={(idx % 3) * 70} className="h-full">
      <Link to={`/projects/${p.slug}`} className="card card-hover group flex h-full flex-col overflow-hidden">
        <div className="relative aspect-[16/9] overflow-hidden border-b border-white/[0.06]">
          {p.cover ? (
            <img src={p.cover} alt={p.title} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
          ) : (
            <CoverFallback title={p.title} className="h-full w-full transition duration-700 group-hover:scale-105" />
          )}
        </div>
        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-semibold">{p.title}</h3>
            <ArrowUpRight className="h-5 w-5 shrink-0 text-zinc-600 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
          </div>
          <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-zinc-400">{p.summary}</p>
          <div className="mt-5 flex flex-wrap gap-1.5">
            {p.tags.slice(0, 4).map((t) => (
              <span key={t} className="chip">{t}</span>
            ))}
          </div>
        </div>
      </Link>
    </Reveal>
  );
}

export function Projects({ s, site }: Props) {
  const visible = site.projects.filter((p) => !p.hidden);
  const featured = visible.filter((p) => p.featured);
  const list = (featured.length ? featured : visible).slice(0, s.limit || 6);
  return (
    <>
      <SectionHeader
        eyebrow={s.eyebrow}
        title={s.title}
        subtitle={s.subtitle}
        action={
          visible.length > list.length && (
            <Link to="/projects" className="btn-ghost self-start md:self-auto">
              All {visible.length} projects <ArrowRight className="h-4 w-4" />
            </Link>
          )
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p, i) => (
          <ProjectCard key={p.id} p={p} idx={i} />
        ))}
      </div>
    </>
  );
}

export function Skills({ s, site }: Props) {
  return (
    <>
      <SectionHeader eyebrow={s.eyebrow} title={s.title} subtitle={s.subtitle} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {site.skills.map((g, i) => (
          <Reveal key={g.id} delay={i * 60} className="card p-6">
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">{g.name}</p>
            <div className="flex flex-wrap gap-2">
              {g.items.map((it) => (
                <TechLabel key={it} name={it} icons={site.settings.showSkillIcons} className="rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 text-sm text-zinc-200 transition hover:border-accent/30 hover:text-white" />
              ))}
            </div>
          </Reveal>
        ))}
      </div>
    </>
  );
}

const STATUS_STYLE: Record<string, string> = {
  Published: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  Accepted: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
  'Under review': 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  Preprint: 'border-zinc-500/30 bg-zinc-500/10 text-zinc-300',
};

export function Publications({ s, site }: Props) {
  const list = site.publications.filter((p) => !p.hidden);
  return (
    <>
      <SectionHeader eyebrow={s.eyebrow} title={s.title} subtitle={s.subtitle} />
      <div className="space-y-4">
        {list.map((p, i) => {
          const Inner = (
            <>
              {p.cover && (
                <div className="aspect-[16/10] w-full shrink-0 overflow-hidden rounded-xl bg-white sm:aspect-square sm:w-28">
                  <img src={p.cover} alt="" loading="lazy" className="h-full w-full object-cover object-top" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className={cx('chip', STATUS_STYLE[p.status])}>{p.status}</span>
                  <span className="font-mono text-xs text-zinc-500">{p.year}</span>
                </div>
                <h3 className="text-base font-semibold leading-snug sm:text-lg">{p.title}</h3>
                <p className="mt-1 text-sm italic text-zinc-500">{p.venue}</p>
                {p.summary && <p className="mt-3 text-sm leading-relaxed text-zinc-400">{p.summary}</p>}
              </div>
              {p.url && <ArrowUpRight className="hidden h-5 w-5 shrink-0 text-zinc-600 transition group-hover:text-accent sm:block" />}
            </>
          );
          const cls = 'card group flex flex-col gap-5 p-5 sm:flex-row sm:items-start sm:p-6';
          return (
            <Reveal key={p.id} delay={i * 60}>
              {p.url ? (
                <a href={p.url} target="_blank" rel="noreferrer" className={cx(cls, 'card-hover')}>{Inner}</a>
              ) : (
                <div className={cls}>{Inner}</div>
              )}
            </Reveal>
          );
        })}
      </div>
    </>
  );
}

export function EducationList({ s, site }: Props) {
  const list = site.education.filter((e) => !e.hidden);
  return (
    <>
      <SectionHeader eyebrow={s.eyebrow} title={s.title} subtitle={s.subtitle} />
      <div className="grid gap-4 md:grid-cols-3">
        {list.map((e, i) => (
          <Reveal key={e.id} delay={i * 70} className="card flex flex-col p-6">
            <div className="flex items-center justify-between">
              <Logo src={e.logo} name={e.school} className="h-10 w-10 text-base" />
              <span className="font-mono text-xs text-zinc-500">
                {e.start}
                {e.start && ' — '}
                {e.end || 'Present'}
              </span>
            </div>
            <h3 className="mt-5 text-lg font-semibold">{e.school}</h3>
            <p className="mt-1 text-sm text-zinc-400">{e.degree}</p>
            {e.description && <p className="mt-3 text-sm text-zinc-500">{e.description}</p>}
            {e.grade && <p className="mt-auto pt-5 text-sm font-medium text-accent">{e.grade}</p>}
          </Reveal>
        ))}
      </div>
    </>
  );
}

export function EntryCard({ e, page, idx = 0 }: { e: Entry; page: Page; idx?: number }) {
  return (
    <Reveal delay={(idx % 3) * 70} className="h-full">
      <Link to={`/${page.slug}/${e.slug}`} className="card card-hover group flex h-full flex-col overflow-hidden">
        {(e.cover || page.template !== 'blog') && (
          <div className="aspect-[16/10] overflow-hidden border-b border-white/[0.06]">
            {e.cover ? (
              <img src={e.cover} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
            ) : (
              <CoverFallback title={e.title} className="h-full w-full" />
            )}
          </div>
        )}
        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <p className="font-mono text-xs text-zinc-500">
            {fmtDate(e.date)}
            {e.extra?.location && ` · ${e.extra.location}`}
          </p>
          <h3 className="mt-2 text-lg font-semibold leading-snug transition group-hover:text-accent">{e.title}</h3>
          {e.excerpt && <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-zinc-400">{e.excerpt}</p>}
        </div>
      </Link>
    </Reveal>
  );
}

export function Feed({ s, site }: Props) {
  const { entries } = useContent();
  const page = site.pages.find((p) => p.id === s.pageId);
  const list = useMemo(() => entries.filter((e) => e.page_id === s.pageId).slice(0, s.limit || 3), [entries, s.pageId, s.limit]);
  if (!page || !page.visible || !list.length) return null;
  return (
    <>
      <SectionHeader
        eyebrow={s.eyebrow}
        title={s.title || page.title}
        subtitle={s.subtitle}
        action={
          <Link to={`/${page.slug}`} className="btn-ghost self-start md:self-auto">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((e, i) => (
          <EntryCard key={e.id} e={e} page={page} idx={i} />
        ))}
      </div>
    </>
  );
}

export function Cards({ s }: Props) {
  const cards = s.cards ?? [];
  return (
    <>
      <SectionHeader eyebrow={s.eyebrow} title={s.title} subtitle={s.subtitle} />
      <div className={cx('grid gap-4 sm:grid-cols-2', cards.length % 3 === 0 || cards.length > 4 ? 'lg:grid-cols-3' : '')}>
        {cards.map((c, i) => {
          const body = (
            <>
              {c.image && (
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={c.image} alt="" loading="lazy" className="h-full w-full object-cover opacity-80 transition duration-700 group-hover:scale-105 group-hover:opacity-100" />
                </div>
              )}
              <div className="p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  {c.logo ? (
                    <img src={c.logo} alt="" className="h-10 w-10 shrink-0 rounded-lg bg-white object-contain p-1.5" loading="lazy" />
                  ) : (
                    !c.image && (
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-white/10 bg-accent/10">
                        <Sparkles className="h-4 w-4 text-accent" />
                      </span>
                    )
                  )}
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold leading-snug">{c.title}</h3>
                    {c.meta && <p className="mt-0.5 font-mono text-xs text-zinc-500">{c.meta}</p>}
                  </div>
                </div>
                <Markdown className="mt-2 text-sm [&_p]:text-zinc-400">{c.body}</Markdown>
              </div>
            </>
          );
          return (
            <Reveal key={c.id} delay={i * 70} className="h-full">
              {c.url ? (
                <a href={c.url} className="card card-hover group block h-full overflow-hidden">{body}</a>
              ) : (
                <div className="card group h-full overflow-hidden">{body}</div>
              )}
            </Reveal>
          );
        })}
      </div>
    </>
  );
}

export function MarkdownSection({ s }: Props) {
  return (
    <>
      <SectionHeader eyebrow={s.eyebrow} title={s.title} subtitle={s.subtitle} />
      <Reveal>
        <Markdown className="max-w-3xl text-base sm:text-lg">{s.body}</Markdown>
      </Reveal>
    </>
  );
}

export function Contact({ s, site }: Props) {
  const { profile } = site;
  const [copied, setCopied] = useState(false);
  const github = profile.socials.find((x) => x.icon === 'github');
  return (
    <Reveal className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-ink-900 px-6 py-14 text-center sm:px-12 sm:py-20">
      <div className="absolute inset-0 -z-0 bg-[radial-gradient(70%_80%_at_50%_0%,rgb(var(--accent)/0.18),transparent_70%)]" />
      <div className="bg-grid absolute inset-0 opacity-70" />
      <div className="relative mx-auto max-w-2xl">
        {s.eyebrow && <p className="eyebrow mb-4">{s.eyebrow}</p>}
        <h2 className="text-3xl font-semibold sm:text-5xl">{s.title}</h2>
        {s.subtitle && <p className="mt-5 text-zinc-400 sm:text-lg">{s.subtitle}</p>}
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {profile.email && (
            <a href={`mailto:${profile.email}`} className="btn-primary w-full sm:w-auto">
              <Mail className="h-4 w-4" /> {profile.email}
            </a>
          )}
          {profile.email && (
            <button
              className="btn-ghost w-full sm:w-auto"
              onClick={() => {
                navigator.clipboard?.writeText(profile.email);
                setCopied(true);
                setTimeout(() => setCopied(false), 1600);
              }}
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied' : 'Copy email'}
            </button>
          )}
          {github && (
            <a href={github.url} target="_blank" rel="noreferrer" className="btn-ghost w-full sm:w-auto">
              <Github className="h-4 w-4" /> GitHub
            </a>
          )}
        </div>
      </div>
    </Reveal>
  );
}

export const SECTION_COMPONENTS: Record<HomeSection['type'], (p: Props) => JSX.Element | null> = {
  hero: Hero,
  stats: Stats,
  about: About,
  experience: ExperienceList,
  projects: Projects,
  skills: Skills,
  publications: Publications,
  education: EducationList,
  feed: Feed,
  cards: Cards,
  markdown: MarkdownSection,
  contact: Contact,
};
