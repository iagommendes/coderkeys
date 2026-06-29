import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import type { LessonProgress } from '@/db/database';
import { getAllLessonProgress } from '@/db/repositories/progress.repo';
import { getManifest, getTrackMeta } from '@/features/catalog/lesson-loader';
import { useSettingsStore } from '@/shared/stores/settings.store';
import { Card } from '@/shared/components/ui';

export function CatalogPage() {
  const { t } = useTranslation('catalog');
  const { t: tc } = useTranslation('common');
  const contentLocale = useSettingsStore((s) => s.contentLocale);
  const manifest = getManifest();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="mt-2 text-muted">{t('subtitle')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {manifest.tracks.map((track) => {
          const meta = getTrackMeta(track.id);
          if (!meta) return null;

          return (
            <Link key={track.id} to={`/tracks/${track.id}`}>
              <Card className="h-full transition hover:border-accent/50 hover:shadow-md">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{track.icon === 'code' ? '💻' : '📝'}</span>
                  <div>
                    <h2 className="text-lg font-semibold">{meta.name[contentLocale]}</h2>
                    <p className="mt-1 text-sm text-muted">{meta.description[contentLocale]}</p>
                    <p className="mt-3 text-xs text-muted">
                      {track.modules.length} {t('modules').toLowerCase()}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      <p className="text-sm text-muted">
        {tc('tagline')}
      </p>
    </div>
  );
}

export function TrackPage({ trackId }: { trackId: string }) {
  const { t } = useTranslation('catalog');
  const contentLocale = useSettingsStore((s) => s.contentLocale);
  const manifest = getManifest();
  const meta = getTrackMeta(trackId);
  const track = manifest.tracks.find((tr) => tr.id === trackId);
  const [progress, setProgress] = useState<LessonProgress[]>([]);

  useEffect(() => {
    void getAllLessonProgress().then(setProgress);
  }, []);

  if (!track || !meta) {
    return <p className="text-muted">Track not found.</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{meta.name[contentLocale]}</h1>
        <p className="mt-2 text-muted">{meta.description[contentLocale]}</p>
      </div>

      {track.modules.map((mod) => {
        const lessonSlugs = mod.lessons[contentLocale] ?? [];

        return (
          <section key={mod.id} className="space-y-4">
            <h2 className="text-xl font-semibold capitalize">{mod.id.replace(/-/g, ' ')}</h2>

            {lessonSlugs.length === 0 ? (
              <p className="text-muted">{t('noLessons')}</p>
            ) : (
              <div className="grid gap-3">
                {lessonSlugs.map((slug) => {
                  const lessonId = `${trackId}/${mod.id}/${contentLocale}/${slug}`;
                  const lp = progress.find((p) => p.lessonId === lessonId);

                  return (
                    <Link key={slug} to={`/lessons/${encodeURIComponent(lessonId)}`}>
                      <Card className="flex items-center justify-between transition hover:border-accent/50">
                        <div>
                          <p className="font-medium">{slug.replace(/^\d{3}-/, '').replace(/-/g, ' ')}</p>
                          <p className="text-sm text-muted">
                            {lp?.completed ? t('completed') : lp ? `${t('attempts')}: ${lp.attempts}` : t('notStarted')}
                          </p>
                        </div>
                        {lp && (
                          <div className="text-right text-sm">
                            <p className="text-muted">{t('bestWpm')}</p>
                            <p className="font-bold text-accent">{lp.bestWpm}</p>
                          </div>
                        )}
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
