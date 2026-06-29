import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom';
import { Layout } from '@/shared/components/Layout';
import { PageLoader } from '@/shared/components/PageLoader';

const CatalogPage = lazy(() =>
  import('@/features/catalog/pages/CatalogPage').then((m) => ({ default: m.CatalogPage })),
);
const TrackPage = lazy(() =>
  import('@/features/catalog/pages/CatalogPage').then((m) => ({ default: m.TrackPage })),
);
const DashboardPage = lazy(() =>
  import('@/features/dashboard/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const LessonPage = lazy(() =>
  import('@/features/lesson/pages/LessonPage').then((m) => ({ default: m.LessonPage })),
);
const SettingsPage = lazy(() =>
  import('@/features/settings/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })),
);

function TrackRoute() {
  const { trackId } = useParams<{ trackId: string }>();
  if (!trackId) return <Navigate to="/" replace />;
  return <TrackPage trackId={trackId} />;
}

function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

export function AppRouter() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Layout>
        <Routes>
          <Route
            path="/"
            element={
              <LazyPage>
                <CatalogPage />
              </LazyPage>
            }
          />
          <Route
            path="/dashboard"
            element={
              <LazyPage>
                <DashboardPage />
              </LazyPage>
            }
          />
          <Route
            path="/tracks/:trackId"
            element={
              <LazyPage>
                <TrackRoute />
              </LazyPage>
            }
          />
          <Route
            path="/lessons/:lessonId"
            element={
              <LazyPage>
                <LessonPage />
              </LazyPage>
            }
          />
          <Route
            path="/settings"
            element={
              <LazyPage>
                <SettingsPage />
              </LazyPage>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
