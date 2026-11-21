import { useParams } from 'react-router-dom';
import { ArrowUpRight, Github } from 'lucide-react';
import { useContent, useTitle } from '../lib/content';
import { fmtMonth } from '../lib/utils';
import { BackLink, CoverFallback, Gallery, Markdown } from '../components/ui';
import NotFound from './NotFound';

export default function ProjectDetail() {
  const { slug } = useParams();
  const { site, loading } = useContent();
  const p = site.projects.find((x) => x.slug === slug && !x.hidden);
  useTitle(p?.title);
  if (loading) return <div className="min-h-screen" />;
  if (!p) return <NotFound />;
  return (
    <article className="pt-24 sm:pt-28">
      <div className="container-x max-w-4xl 2xl:max-w-4xl">
        <BackLink to="/projects" label="All projects" />
        <div className="animate-rise">
          <p className="font-mono text-xs text-zinc-500">{fmtMonth(p.date)}</p>
          <h1 className="mt-3 text-4xl font-semibold sm:text-5xl lg:text-6xl">{p.title}</h1>
          <p className="mt-5 text-lg leading-relaxed text-zinc-400 sm:text-xl">{p.summary}</p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            {p.live && (
              <a href={p.live} target="_blank" rel="noreferrer" className="btn-primary">
                Visit live <ArrowUpRight className="h-4 w-4" />
              </a>
            )}
            {p.github && (
              <a href={p.github} target="_blank" rel="noreferrer" className="btn-ghost">
                <Github className="h-4 w-4" /> Source code
              </a>
            )}
          </div>
          <div className="mt-6 flex flex-wrap gap-1.5">
            {p.tags.map((t) => (
              <span key={t} className="chip">{t}</span>
            ))}
          </div>
        </div>
        <div className="mt-12 overflow-hidden rounded-2xl border border-white/[0.07]">
          {p.cover ? <img src={p.cover} alt={p.title} className="w-full" /> : <CoverFallback title={p.title} className="aspect-[16/7] w-full" />}
        </div>
        <Markdown className="mt-12 text-[17px]">{p.body}</Markdown>
        {p.gallery.length > 0 && (
          <section className="mt-14">
            <h2 className="mb-5 text-xl font-semibold">Gallery</h2>
            <Gallery items={p.gallery} className="lg:columns-2" />
          </section>
        )}
        <div className="h-24" />
      </div>
    </article>
  );
}
