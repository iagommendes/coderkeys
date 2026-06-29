import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom';
import { Layout } from '@/shared/components/Layout';
import { CatalogPage, TrackPage } from '@/features/catalog/pages/CatalogPage';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { LessonPage } from '@/features/lesson/pages/LessonPage';
import { SettingsPage } from '@/features/settings/pages/SettingsPage';

function TrackRoute() {
  const { trackId } = useParams<{ trackId: string }>();
  if (!trackId) return <Navigate to="/" replace />;
  return <TrackPage trackId={trackId} />;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/tracks/:trackId" element={<TrackRoute />} />
          <Route path="/lessons/:lessonId" element={<LessonPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
