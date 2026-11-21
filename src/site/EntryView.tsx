import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useContent, useTitle } from '../lib/content';
import { store } from '../lib/store';
import type { Entry } from '../lib/types';
import { Spinner } from '../components/ui';
import { TEMPLATES } from './templates';
import NotFound from './NotFound';

export default function EntryView() {
  const { pageSlug = '', entrySlug = '' } = useParams();
  const { site, entries, loading } = useContent();
  const page = site.pages.find((p) => p.slug === pageSlug && p.visible);
  const [entry, setEntry] = useState<Entry | null | undefined>(undefined);
  useTitle(entry?.title);

  useEffect(() => {
    if (!page) return;
    setEntry(undefined);
    store.getEntry(page.id, entrySlug, false).then(setEntry).catch(() => setEntry(null));
  }, [page?.id, entrySlug]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading || (page && entry === undefined))
    return (
      <div className="grid min-h-screen place-items-center">
        <Spinner />
      </div>
    );
  if (!page || !entry) return <NotFound />;
  const T = TEMPLATES[page.template] ?? TEMPLATES.blog;
  const siblings = entries.filter((e) => e.page_id === page.id);
  const i = siblings.findIndex((e) => e.id === entry.id);
  const newer = siblings[i - 1];
  const older = siblings[i + 1];
  return (
    <>
      <T.Entry page={page} entry={entry} />
      {(newer || older) && (
        <nav className="container-x grid max-w-4xl gap-4 border-t border-white/[0.06] py-10 sm:grid-cols-2 2xl:max-w-4xl">
          {newer ? (
            <Link to={`/${page.slug}/${newer.slug}`} className="card card-hover group p-5">
              <span className="flex items-center gap-1 text-xs text-zinc-500"><ArrowLeft className="h-3.5 w-3.5" /> Newer</span>
              <span className="mt-1 block font-medium text-zinc-100 group-hover:text-accent">{newer.title}</span>
            </Link>
          ) : <span />}
          {older && (
            <Link to={`/${page.slug}/${older.slug}`} className="card card-hover group p-5 text-right">
              <span className="flex items-center justify-end gap-1 text-xs text-zinc-500">Older <ArrowRight className="h-3.5 w-3.5" /></span>
              <span className="mt-1 block font-medium text-zinc-100 group-hover:text-accent">{older.title}</span>
            </Link>
          )}
        </nav>
      )}
    </>
  );
}
