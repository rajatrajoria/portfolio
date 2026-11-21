import { useParams } from 'react-router-dom';
import { useContent, useTitle } from '../lib/content';
import { TEMPLATES } from './templates';
import NotFound from './NotFound';

export default function PageView() {
  const { pageSlug = '' } = useParams();
  const { site, entries, loading } = useContent();
  const page = site.pages.find((p) => p.slug === pageSlug && p.visible);
  useTitle(page?.title);
  if (loading) return <div className="min-h-screen" />;
  if (!page) return <NotFound />;
  const T = TEMPLATES[page.template] ?? TEMPLATES.custom;
  return <T.Index page={page} entries={entries.filter((e) => e.page_id === page.id)} />;
}
