import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Clock, MapPin, Images } from 'lucide-react';
import type { Entry, Page, PageTemplate } from '../lib/types';
import { cx, fmtDate, readingTime } from '../lib/utils';
import { CoverFallback, Empty, Gallery, Markdown, Reveal } from '../components/ui';

type IndexProps = { page: Page; entries: Entry[] };
type EntryProps = { page: Page; entry: Entry };

const minutes = (e: Entry) => (typeof e.extra?.minutes === 'number' ? (e.extra.minutes as number) : e.body ? readingTime(e.body) : null);

function PageHeader({ page, center }: { page: Page; center?: boolean }) {
  return (
    <header className={cx('animate-rise', center && 'text-center')}>
      <h1 className={cx('text-4xl font-semibold sm:text-6xl', page.template === 'poetry' && 'font-display font-normal italic sm:text-7xl')}>{page.title}</h1>
      {page.description && <p className={cx('mt-4 max-w-2xl text-lg text-zinc-400', center && 'mx-auto')}>{page.description}</p>}
      {page.body && page.template !== 'custom' && <Markdown className={cx('mt-6 max-w-2xl', center && 'mx-auto')}>{page.body}</Markdown>}
    </header>
  );
}

const nothing = <Empty title="Nothing here yet">New pieces will appear here soon.</Empty>;

// ---------------- Blog ----------------
function BlogIndex({ page, entries }: IndexProps) {
  const tags = useMemo(() => [...new Set(entries.flatMap((e) => e.tags))].slice(0, 16), [entries]);
  const [tag, setTag] = useState<string | null>(null);
  const shown = tag ? entries.filter((e) => e.tags.includes(tag)) : entries;
  return (
    <div className="container-x max-w-4xl pb-24 pt-28 sm:pt-36 2xl:max-w-4xl">
      <PageHeader page={page} />
      {tags.length > 1 && (
        <div className="mt-10 flex flex-wrap gap-2">
          {[null, ...tags].map((t) => (
            <button
              key={t ?? 'all'}
              onClick={() => setTag(t)}
              className={cx('rounded-full border px-3 py-1 text-sm transition', tag === t ? 'border-accent/50 bg-accent/15 text-zinc-50' : 'border-white/10 text-zinc-400 hover:text-zinc-100')}
            >
              {t ? `#${t}` : 'All'}
            </button>
          ))}
        </div>
      )}
      <div className="mt-10">
        {shown.length === 0 && nothing}
        <ul className="divide-y divide-white/[0.06] border-y border-white/[0.06]">
          {shown.map((e, i) => (
            <Reveal key={e.id} delay={Math.min(i, 6) * 40}>
              <Link to={`/${page.slug}/${e.slug}`} className="group grid gap-4 py-8 sm:grid-cols-[150px_1fr] sm:gap-8">
                <div className="font-mono text-xs text-zinc-500 sm:pt-1.5">
                  {fmtDate(e.date)}
                  {minutes(e) && <span className="mt-1 block text-zinc-600">{minutes(e)} min read</span>}
                </div>
                <div className="flex gap-5">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-semibold leading-snug transition group-hover:text-accent sm:text-2xl">{e.title}</h2>
                    {e.excerpt && <p className="mt-2 line-clamp-2 text-zinc-400">{e.excerpt}</p>}
                    {e.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {e.tags.map((t) => (
                          <span key={t} className="text-xs text-zinc-500">#{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  {e.cover && <img src={e.cover} alt="" loading="lazy" className="hidden h-24 w-32 shrink-0 rounded-lg object-cover sm:block" />}
                </div>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </div>
  );
}

function BlogEntry({ page, entry }: EntryProps) {
  return (
    <article className="pb-24 pt-28 sm:pt-36">
      <div className="container-x max-w-3xl 2xl:max-w-3xl">
        <Link to={`/${page.slug}`} className="eyebrow hover:underline">{page.title}</Link>
        <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">{entry.title}</h1>
        {entry.excerpt && <p className="mt-5 text-xl leading-relaxed text-zinc-400">{entry.excerpt}</p>}
        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs text-zinc-500">
          <span>{fmtDate(entry.date)}</span>
          <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {readingTime(entry.body)} min read</span>
          {entry.tags.map((t) => <span key={t}>#{t}</span>)}
        </div>
      </div>
      {entry.cover && (
        <div className="container-x mt-10 max-w-5xl 2xl:max-w-5xl">
          <img src={entry.cover} alt="" className="w-full rounded-2xl border border-white/[0.07]" />
        </div>
      )}
      <div className="container-x mt-12 max-w-3xl 2xl:max-w-3xl">
        <Markdown className="text-[17px] sm:text-lg [&_p]:leading-[1.8]">{entry.body}</Markdown>
        {entry.extra?.images && entry.extra.images.length > 0 && <Gallery items={entry.extra.images} className="mt-12 lg:columns-2" />}
      </div>
    </article>
  );
}

// ---------------- Gallery (photography) ----------------
function GalleryIndex({ page, entries }: IndexProps) {
  return (
    <div className="container-x pb-24 pt-28 sm:pt-36">
      <PageHeader page={page} />
      <div className="mt-12">
        {entries.length === 0 && nothing}
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
          {entries.map((e, i) => (
            <Reveal key={e.id} delay={(i % 3) * 60}>
              <Link to={`/${page.slug}/${e.slug}`} className="group relative block overflow-hidden rounded-2xl border border-white/[0.06] bg-ink-900">
                {e.cover ? (
                  <img src={e.cover} alt={e.title} loading="lazy" className="w-full transition duration-700 group-hover:scale-105" />
                ) : (
                  <CoverFallback title="" className="aspect-[4/5] w-full" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent opacity-90 transition group-hover:opacity-100" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="text-lg font-medium text-white">{e.title}</p>
                  <p className="mt-1 flex items-center gap-3 text-xs text-zinc-300">
                    {fmtDate(e.date)}
                    {e.extra?.images?.length ? (
                      <span className="inline-flex items-center gap-1"><Images className="h-3.5 w-3.5" /> {e.extra.images.length}</span>
                    ) : null}
                    {e.extra?.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {e.extra.location}</span>}
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}

function GalleryEntry({ page, entry }: EntryProps) {
  const images = entry.extra?.images?.length ? entry.extra.images : entry.cover ? [{ url: entry.cover, caption: entry.title }] : [];
  return (
    <article className="container-x pb-24 pt-28 sm:pt-36">
      <Link to={`/${page.slug}`} className="eyebrow hover:underline">{page.title}</Link>
      <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <h1 className="text-4xl font-semibold sm:text-5xl">{entry.title}</h1>
        <p className="flex items-center gap-3 font-mono text-xs text-zinc-500">
          {fmtDate(entry.date)}
          {entry.extra?.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {entry.extra.location}</span>}
        </p>
      </div>
      {entry.excerpt && <p className="mt-4 max-w-2xl text-lg text-zinc-400">{entry.excerpt}</p>}
      {entry.body && <Markdown className="mt-6 max-w-3xl">{entry.body}</Markdown>}
      <Gallery items={images} className="mt-10" />
    </article>
  );
}

// ---------------- Poetry ----------------
function PoetryIndex({ page, entries }: IndexProps) {
  return (
    <div className="container-x max-w-3xl pb-24 pt-28 sm:pt-36 2xl:max-w-3xl">
      <PageHeader page={page} center />
      <div className="mt-16">
        {entries.length === 0 && nothing}
        <ul className="space-y-2">
          {entries.map((e, i) => (
            <Reveal key={e.id} delay={Math.min(i, 6) * 50}>
              <Link to={`/${page.slug}/${e.slug}`} className="group block rounded-2xl px-4 py-7 text-center transition hover:bg-white/[0.02] sm:px-8">
                <h2 className="font-verse text-3xl font-medium text-zinc-100 transition group-hover:text-accent sm:text-4xl">{e.title}</h2>
                {e.excerpt && <p className="mx-auto mt-3 max-w-md whitespace-pre-line font-verse text-lg italic leading-relaxed text-zinc-500">{e.excerpt}</p>}
                <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-600">{fmtDate(e.date)}</p>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </div>
  );
}

function PoetryEntry({ page, entry }: EntryProps) {
  return (
    <article className="container-x max-w-2xl pb-28 pt-28 text-center sm:pt-40 2xl:max-w-2xl">
      <Link to={`/${page.slug}`} className="eyebrow hover:underline">{page.title}</Link>
      <h1 className="mt-6 font-verse text-5xl font-medium sm:text-6xl">{entry.title}</h1>
      <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-600">{fmtDate(entry.date)}</p>
      <div className="mx-auto my-10 h-px w-16 bg-accent/50" />
      {entry.cover && <img src={entry.cover} alt="" className="mb-12 w-full rounded-2xl opacity-90" />}
      <div className="whitespace-pre-line font-verse text-xl leading-[1.9] text-zinc-200 sm:text-2xl">{entry.body}</div>
      <div className="mx-auto mt-12 font-display text-2xl italic text-zinc-600">~</div>
    </article>
  );
}

// ---------------- Stories (travel) ----------------
function StoriesIndex({ page, entries }: IndexProps) {
  return (
    <div className="container-x pb-24 pt-28 sm:pt-36">
      <PageHeader page={page} />
      <div className="mt-12 space-y-6">
        {entries.length === 0 && nothing}
        {entries.map((e, i) => (
          <Reveal key={e.id}>
            <Link to={`/${page.slug}/${e.slug}`} className={cx('card card-hover group grid overflow-hidden md:grid-cols-2', i % 2 === 1 && 'md:[&>*:first-child]:order-2')}>
              <div className="aspect-[16/10] overflow-hidden md:aspect-auto md:min-h-[320px]">
                {e.cover ? (
                  <img src={e.cover} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                ) : (
                  <CoverFallback title={e.extra?.location || e.title} className="h-full min-h-[220px] w-full" />
                )}
              </div>
              <div className="flex flex-col justify-center p-6 sm:p-10">
                {e.extra?.location && (
                  <p className="eyebrow inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {e.extra.location}</p>
                )}
                <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">{e.title}</h2>
                {e.excerpt && <p className="mt-3 line-clamp-4 text-zinc-400">{e.excerpt}</p>}
                <p className="mt-6 flex items-center gap-2 text-sm text-zinc-500">
                  {fmtDate(e.date)}
                  <ArrowUpRight className="ml-auto h-5 w-5 text-zinc-600 transition group-hover:text-accent" />
                </p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

function StoriesEntry({ page, entry }: EntryProps) {
  return (
    <article className="pb-24">
      <header className="relative isolate flex min-h-[70vh] items-end overflow-hidden pt-24">
        {entry.cover ? (
          <img src={entry.cover} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover" />
        ) : (
          <CoverFallback title="" className="absolute inset-0 -z-20" />
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink-950 via-ink-950/50 to-ink-950/10" />
        <div className="container-x pb-12">
          <Link to={`/${page.slug}`} className="eyebrow hover:underline">{page.title}</Link>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold text-white sm:text-6xl">{entry.title}</h1>
          <p className="mt-5 flex flex-wrap items-center gap-4 text-sm text-zinc-300">
            {entry.extra?.location && <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {entry.extra.location}</span>}
            <span>{fmtDate(entry.date)}</span>
            <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" /> {readingTime(entry.body)} min read</span>
          </p>
        </div>
      </header>
      <div className="container-x mt-12 max-w-3xl 2xl:max-w-3xl">
        {entry.excerpt && <p className="mb-8 text-xl leading-relaxed text-zinc-300">{entry.excerpt}</p>}
        <Markdown className="text-[17px] sm:text-lg [&_p]:leading-[1.8]">{entry.body}</Markdown>
      </div>
      {entry.extra?.images && entry.extra.images.length > 0 && (
        <div className="container-x mt-14">
          <Gallery items={entry.extra.images} />
        </div>
      )}
    </article>
  );
}

// ---------------- Custom ----------------
function CustomIndex({ page }: IndexProps) {
  return (
    <div className="pb-24">
      {page.cover && (
        <div className="relative h-[40vh] min-h-[260px] overflow-hidden">
          <img src={page.cover} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 to-transparent" />
        </div>
      )}
      <div className={cx('container-x max-w-3xl 2xl:max-w-3xl', page.cover ? '-mt-16 relative' : 'pt-28 sm:pt-36')}>
        <PageHeader page={page} />
        <Markdown className="mt-10 text-[17px] sm:text-lg">{page.body}</Markdown>
      </div>
    </div>
  );
}

export const TEMPLATES: Record<PageTemplate, { label: string; description: string; hasEntries: boolean; Index: (p: IndexProps) => JSX.Element; Entry: (p: EntryProps) => JSX.Element }> = {
  blog: { label: 'Blog / Articles', description: 'Long-form writing with tags, reading time and a clean reading layout.', hasEntries: true, Index: BlogIndex, Entry: BlogEntry },
  gallery: { label: 'Photography / Gallery', description: 'Masonry grid of albums; each album opens a full-screen lightbox.', hasEntries: true, Index: GalleryIndex, Entry: GalleryEntry },
  stories: { label: 'Stories / Travel', description: 'Big cover images, locations and photo galleries — great for travel logs.', hasEntries: true, Index: StoriesIndex, Entry: StoriesEntry },
  poetry: { label: 'Poetry', description: 'Centred serif verse with preserved line breaks and lots of whitespace.', hasEntries: true, Index: PoetryIndex, Entry: PoetryEntry },
  custom: { label: 'Single page', description: 'One free-form markdown page — about, uses, now, résumé, anything.', hasEntries: false, Index: CustomIndex, Entry: () => <></> },
};
