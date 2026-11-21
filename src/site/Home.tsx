import { useContent, useTitle } from '../lib/content';
import { sectionAnchor } from '../components/ui';
import { SECTION_COMPONENTS } from './sections';
import { cx } from '../lib/utils';

export default function Home() {
  const { site, loading } = useContent();
  useTitle();
  if (loading) return <div className="min-h-screen" />;
  return (
    <>
      {site.sections
        .filter((s) => s.visible)
        .map((s, i) => {
          const C = SECTION_COMPONENTS[s.type];
          if (!C) return null;
          if (s.type === 'hero' || s.type === 'stats') return <C key={s.id} s={s} site={site} />;
          return (
            <section key={s.id} id={sectionAnchor(s)} className={cx('container-x scroll-mt-20 py-16 sm:py-24', i === 0 && 'pt-28 sm:pt-36')}>
              <C s={s} site={site} />
            </section>
          );
        })}
    </>
  );
}
