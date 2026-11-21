import { useMemo, useState } from 'react';
import { useContent, useTitle } from '../lib/content';
import { cx } from '../lib/utils';
import { ProjectCard } from './sections';

export default function ProjectsIndex() {
  const { site } = useContent();
  useTitle('Projects');
  const list = useMemo(
    () => site.projects.filter((p) => !p.hidden).sort((a, b) => (b.date || '').localeCompare(a.date || '')),
    [site.projects],
  );
  const tags = useMemo(() => {
    const count = new Map<string, number>();
    list.forEach((p) => p.tags.forEach((t) => count.set(t, (count.get(t) ?? 0) + 1)));
    return [...count.entries()].sort((a, b) => b[1] - a[1]).slice(0, 14).map(([t]) => t);
  }, [list]);
  const [tag, setTag] = useState<string | null>(null);
  const shown = tag ? list.filter((p) => p.tags.includes(tag)) : list;

  return (
    <div className="container-x pb-24 pt-28 sm:pt-36">
      <p className="eyebrow mb-3">Projects</p>
      <h1 className="text-4xl font-semibold sm:text-6xl">Everything I’ve built</h1>
      <p className="mt-4 max-w-2xl text-lg text-zinc-400">Products, experiments and learning projects — newest first.</p>
      <div className="mt-10 flex flex-wrap gap-2">
        {[null, ...tags].map((t) => (
          <button
            key={t ?? 'all'}
            onClick={() => setTag(t)}
            className={cx('rounded-full border px-3.5 py-1.5 text-sm transition', tag === t ? 'border-accent/50 bg-accent/15 text-zinc-50' : 'border-white/10 text-zinc-400 hover:text-zinc-100')}
          >
            {t ?? 'All'}
          </button>
        ))}
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((p, i) => (
          <ProjectCard key={p.id} p={p} idx={i} />
        ))}
      </div>
    </div>
  );
}
