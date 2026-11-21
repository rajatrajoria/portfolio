import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUpRight, Award, Briefcase, Calendar, Clock, FileText, Link2, MapPin } from 'lucide-react';
import { useContent, useTitle } from '../lib/content';
import type { Attachment } from '../lib/types';
import { experienceRange, sortByStartDesc } from '../lib/utils';
import { BackLink, Gallery, Lightbox, Logo, Markdown, Reveal, TechLabel, sectionAnchor } from '../components/ui';
import NotFound from './NotFound';

export const isImageUrl = (u: string) => /^data:image\//.test(u) || /\.(png|jpe?g|webp|gif|avif|svg)(\?|$)/i.test(u);

export function Attachments({ items }: { items: Attachment[] }) {
  const images = items.filter((a) => isImageUrl(a.url));
  const [i, setI] = useState<number | null>(null);
  if (!items.length) return null;
  return (
    <>
      <ul className="space-y-2">
        {items.map((a, idx) => {
          const Icon = a.kind === 'certificate' ? Award : a.kind === 'document' ? FileText : Link2;
          const img = isImageUrl(a.url);
          const content = (
            <>
              {img ? (
                <img src={a.url} alt="" className="h-11 w-14 shrink-0 rounded-md border border-white/10 object-cover" />
              ) : (
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md border border-white/10 bg-white/[0.03]">
                  <Icon className="h-4 w-4 text-accent" />
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm text-zinc-200">{a.label || 'Attachment'}</span>
                <span className="text-xs capitalize text-zinc-500">{a.kind}</span>
              </span>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-zinc-600 transition group-hover:text-accent" />
            </>
          );
          const cls = 'group flex w-full items-center gap-3 rounded-xl border border-white/[0.06] p-2 pr-3 text-left transition hover:border-white/15 hover:bg-white/[0.03]';
          return (
            <li key={idx}>
              {img ? (
                <button className={cls} onClick={() => setI(images.indexOf(a))}>{content}</button>
              ) : (
                <a className={cls} href={a.url} target="_blank" rel="noreferrer">{content}</a>
              )}
            </li>
          );
        })}
      </ul>
      <Lightbox items={images.map((a) => ({ url: a.url, caption: a.label }))} index={i} onClose={() => setI(null)} onIndex={setI} />
    </>
  );
}

export default function ExperienceDetail() {
  const { slug } = useParams();
  const { site, loading } = useContent();
  const list = sortByStartDesc(site.experiences.filter((e) => !e.hidden));
  const idx = list.findIndex((e) => e.slug === slug);
  const e = list[idx];
  useTitle(e ? `${e.role} at ${e.company}` : undefined);
  if (loading) return <div className="min-h-screen" />;
  if (!e) return <NotFound />;
  const r = experienceRange(e);
  const prev = list[idx - 1];
  const next = list[idx + 1];
  const xpSec = site.sections.find((s) => s.type === 'experience' && s.visible);

  const facts = [
    { icon: Calendar, label: r.label },
    { icon: Clock, label: r.duration },
    { icon: Briefcase, label: e.type },
    e.location && { icon: MapPin, label: e.location },
  ].filter(Boolean) as { icon: typeof Calendar; label: string }[];

  return (
    <article>
      <header className="relative isolate overflow-hidden pt-24 sm:pt-28">
        {e.cover ? (
          <>
            <img src={e.cover} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover opacity-30" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-ink-950/40 via-ink-950/80 to-ink-950" />
          </>
        ) : (
          <>
            <div className="bg-grid absolute inset-0 -z-10" />
            <div className="absolute left-1/3 top-0 -z-10 h-80 w-[700px] max-w-[120vw] rounded-full bg-accent/10 blur-[110px]" />
          </>
        )}
        <div className="container-x pb-12 sm:pb-16">
          <BackLink to={xpSec ? `/#${sectionAnchor(xpSec)}` : '/'} label="All experience" />
          <div className="flex animate-rise flex-col gap-6 sm:flex-row sm:items-center">
            <Logo src={e.logo} name={e.company} className="h-16 w-16 text-2xl sm:h-20 sm:w-20" />
            <div>
              <p className="eyebrow mb-2">{e.company}</p>
              <h1 className="text-3xl font-semibold sm:text-5xl">{e.role}</h1>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            {r.current && <span className="chip border-emerald-500/30 bg-emerald-500/10 text-emerald-300">Current role</span>}
            {facts.map((f) => (
              <span key={f.label} className="chip !px-3 !py-1">
                <f.icon className="h-3.5 w-3.5" /> {f.label}
              </span>
            ))}
            {e.url && (
              <a href={e.url} target="_blank" rel="noreferrer" className="chip !px-3 !py-1 hover:text-zinc-100">
                <Link2 className="h-3.5 w-3.5" /> Website
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="container-x grid gap-10 pb-20 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14">
        <div className="min-w-0">
          {e.summary && <p className="mb-8 text-lg leading-relaxed text-zinc-200 sm:text-xl">{e.summary}</p>}
          {e.highlights.length > 0 && (
            <Reveal className="mb-10 grid gap-3 sm:grid-cols-2">
              {e.highlights.map((h) => (
                <div key={h} className="card flex items-start gap-3 p-4">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span className="text-sm text-zinc-200">{h}</span>
                </div>
              ))}
            </Reveal>
          )}
          <Markdown className="text-[17px]">{e.body}</Markdown>
          {e.gallery.length > 0 && (
            <section className="mt-14">
              <h2 className="mb-5 text-xl font-semibold">Gallery</h2>
              <Gallery items={e.gallery} />
            </section>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          {e.skills.length > 0 && (
            <div className="card p-5">
              <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {e.skills.map((s) => (
                  <TechLabel key={s} name={s} icons={site.settings.showSkillIcons} className="chip text-zinc-300" />
                ))}
              </div>
            </div>
          )}
          {e.attachments.length > 0 && (
            <div className="card p-5">
              <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">Certificates & documents</p>
              <Attachments items={e.attachments} />
            </div>
          )}
        </aside>
      </div>

      {(prev || next) && (
        <nav className="container-x grid gap-4 border-t border-white/[0.06] py-10 sm:grid-cols-2">
          {prev ? (
            <Link to={`/experience/${prev.slug}`} className="card card-hover group p-5">
              <span className="flex items-center gap-1 text-xs text-zinc-500"><ArrowLeft className="h-3.5 w-3.5" /> Newer</span>
              <span className="mt-1 block font-medium text-zinc-100 group-hover:text-accent">{prev.role} · {prev.company}</span>
            </Link>
          ) : <span />}
          {next && (
            <Link to={`/experience/${next.slug}`} className="card card-hover group p-5 text-right">
              <span className="flex items-center justify-end gap-1 text-xs text-zinc-500">Earlier <ArrowRight className="h-3.5 w-3.5" /></span>
              <span className="mt-1 block font-medium text-zinc-100 group-hover:text-accent">{next.role} · {next.company}</span>
            </Link>
          )}
        </nav>
      )}
    </article>
  );
}
