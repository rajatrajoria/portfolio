import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { ContentProvider } from './lib/content';
import SiteLayout from './components/SiteLayout';
import Home from './site/Home';
import ExperienceDetail from './site/ExperienceDetail';
import ProjectDetail from './site/ProjectDetail';
import ProjectsIndex from './site/ProjectsIndex';
import PageView from './site/PageView';
import EntryView from './site/EntryView';
import NotFound from './site/NotFound';

const AdminApp = lazy(() => import('./admin/AdminApp'));

function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      // content may still be loading on first visit — retry for a couple of seconds
      let tries = 0;
      const t = setInterval(() => {
        const el = document.getElementById(hash.slice(1));
        if (el || ++tries > 40) {
          clearInterval(t);
          el?.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
      return () => clearInterval(t);
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <ContentProvider>
      <ScrollManager />
      <Routes>
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<div className="grid min-h-screen place-items-center text-zinc-500">Loading admin…</div>}>
              <AdminApp />
            </Suspense>
          }
        />
        <Route element={<SiteLayout />}>
          <Route index element={<Home />} />
          <Route path="experience/:slug" element={<ExperienceDetail />} />
          <Route path="projects" element={<ProjectsIndex />} />
          <Route path="projects/:slug" element={<ProjectDetail />} />
          <Route path=":pageSlug" element={<PageView />} />
          <Route path=":pageSlug/:entrySlug" element={<EntryView />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </ContentProvider>
  );
}
