import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  aggregateErrorHotspots,
  calculateDayStreak,
  groupSessionsByDay,
  suggestLessons,
} from '@coderkeys/engine';
import type { LessonProgress, SessionRecord } from '@/db/database';
import {
  getAllLessonProgress,
  getAllSessions,
} from '@/db/repositories/progress.repo';
import {
  getLessonCandidates,
  getManifest,
  getTrackMeta,
} from '@/features/catalog/lesson-loader';
import { useSettingsStore } from '@/shared/stores/settings.store';
import { Card, Button } from '@/shared/components/ui';

type ChartRange = 7 | 30;

function getSuggestionLabel(
  reason: string,
  t: (key: string, opts?: Record<string, string>) => string,
): string {
  if (reason.startsWith('weakKeys:')) {
    return t('suggestWeakKeys', { keys: reason.replace('weakKeys:', '') });
  }
  if (reason === 'skillMatch') return t('suggest_skillMatch');
  if (reason === 'practice') return t('suggest_practice');
  return t('suggest_recommended');
}

export function DashboardPage() {
  const { t } = useTranslation('dashboard');
  const contentLocale = useSettingsStore((s) => s.contentLocale);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [chartRange, setChartRange] = useState<ChartRange>(7);
  const [trackFilter, setTrackFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [skillFilter, setSkillFilter] = useState('all');

  useEffect(() => {
    void Promise.all([getAllSessions(), getAllLessonProgress()]).then(([s, p]) => {
      setSessions(s);
      setProgress(p);
    });
  }, []);

  const manifest = getManifest();

  const filteredProgress = useMemo(() => {
    return progress.filter((p) => {
      if (trackFilter !== 'all' && p.track !== trackFilter) return false;
      if (moduleFilter !== 'all' && p.module !== moduleFilter) return false;
      if (skillFilter !== 'all') {
        const lesson = getLessonCandidates(contentLocale).find((l) => l.lessonId === p.lessonId);
        if (!lesson?.skills.includes(skillFilter)) return false;
      }
      return true;
    });
  }, [progress, trackFilter, moduleFilter, skillFilter, contentLocale]);

  const filteredSessions = useMemo(() => {
    const lessonIds = new Set(filteredProgress.map((p) => p.lessonId));
    return sessions.filter((s) => lessonIds.has(s.lessonId));
  }, [sessions, filteredProgress]);

  const avgWpm =
    filteredSessions.length > 0
      ? Math.round(filteredSessions.reduce((sum, s) => sum + s.wpm, 0) / filteredSessions.length)
      : 0;

  const avgAccuracy =
    filteredSessions.length > 0
      ? Math.round(
          filteredSessions.reduce((sum, s) => sum + s.accuracy, 0) / filteredSessions.length,
        )
      : 0;

  const streak = calculateDayStreak(sessions.map((s) => s.completedAt));
  const chartData = groupSessionsByDay(filteredSessions, chartRange).map((p) => ({
    ...p,
    label: format(parseISO(p.date), 'MMM d'),
  }));

  const hotspots = aggregateErrorHotspots(filteredSessions);
  const maxHotspotCount = hotspots[0]?.count ?? 1;

  const completedIds = new Set(progress.filter((p) => p.completed).map((p) => p.lessonId));
  const suggestions = suggestLessons(
    hotspots,
    getLessonCandidates(contentLocale),
    completedIds,
    5,
  );

  const allSkills = [
    ...new Set(getLessonCandidates(contentLocale).flatMap((l) => l.skills)),
  ].sort();

  const modules =
    trackFilter === 'all'
      ? manifest.tracks.flatMap((tr) => tr.modules.map((m) => m.id))
      : (manifest.tracks.find((tr) => tr.id === trackFilter)?.modules.map((m) => m.id) ?? []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="mt-2 text-muted">{t('subtitle')}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard label={t('avgWpm')} value={String(avgWpm)} />
        <SummaryCard label={t('avgAccuracy')} value={`${avgAccuracy}%`} />
        <SummaryCard label={t('streak')} value={t('streakDays', { count: streak })} />
      </div>

      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">{t('wpmChart')}</h2>
          <div className="flex gap-2">
            <Button
              variant={chartRange === 7 ? 'primary' : 'secondary'}
              onClick={() => setChartRange(7)}
            >
              {t('days7')}
            </Button>
            <Button
              variant={chartRange === 30 ? 'primary' : 'secondary'}
              onClick={() => setChartRange(30)}
            >
              {t('days30')}
            </Button>
          </div>
        </div>

        <div className="h-64">
          {chartData.some((d) => d.sessions > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="label" tick={{ fill: 'var(--color-muted)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'var(--color-muted)', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-surface-elevated)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 8,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="avgWpm"
                  stroke="var(--color-accent)"
                  strokeWidth={2}
                  dot={{ fill: 'var(--color-accent)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="flex h-full items-center justify-center text-muted">{t('noData')}</p>
          )}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4">
          <h2 className="text-lg font-semibold">{t('errorHeatmap')}</h2>
          {hotspots.length === 0 ? (
            <p className="text-sm text-muted">{t('noErrors')}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {hotspots.map((h) => (
                <div
                  key={h.char}
                  className="flex min-w-[3rem] flex-col items-center rounded-lg border border-border px-3 py-2 font-mono"
                  style={{
                    background: `color-mix(in srgb, var(--color-error) ${Math.round((h.count / maxHotspotCount) * 40)}%, transparent)`,
                  }}
                  title={`${h.count} errors`}
                >
                  <span className="text-lg">{h.label}</span>
                  <span className="text-xs text-muted">{h.count}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="space-y-4">
          <h2 className="text-lg font-semibold">{t('suggestions')}</h2>
          <ul className="space-y-2">
            {suggestions.map((s) => (
              <li key={s.lessonId}>
                <Link
                  to={`/lessons/${encodeURIComponent(s.lessonId)}`}
                  className="block rounded-lg border border-border px-4 py-3 transition hover:border-accent/50"
                >
                  <p className="font-medium">{s.title}</p>
                  <p className="text-xs text-muted">{getSuggestionLabel(s.reason, t)}</p>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="space-y-4">
        <h2 className="text-lg font-semibold">{t('lessonProgress')}</h2>

        <div className="flex flex-wrap gap-3">
          <FilterSelect
            label={t('filterTrack')}
            value={trackFilter}
            onChange={(v) => {
              setTrackFilter(v);
              setModuleFilter('all');
            }}
            options={[
              { value: 'all', label: t('all') },
              ...manifest.tracks.map((tr) => ({
                value: tr.id,
                label: getTrackMeta(tr.id)?.name[contentLocale] ?? tr.id,
              })),
            ]}
          />
          <FilterSelect
            label={t('filterModule')}
            value={moduleFilter}
            onChange={setModuleFilter}
            options={[
              { value: 'all', label: t('all') },
              ...modules.map((m) => ({ value: m, label: m.replace(/-/g, ' ') })),
            ]}
          />
          <FilterSelect
            label={t('filterSkill')}
            value={skillFilter}
            onChange={setSkillFilter}
            options={[
              { value: 'all', label: t('all') },
              ...allSkills.map((s) => ({ value: s, label: s })),
            ]}
          />
        </div>

        <div className="divide-y divide-border">
          {filteredProgress.length === 0 ? (
            <p className="py-4 text-sm text-muted">{t('noProgress')}</p>
          ) : (
            filteredProgress.map((p) => (
              <Link
                key={p.lessonId}
                to={`/lessons/${encodeURIComponent(p.lessonId)}`}
                className="flex items-center justify-between py-3 transition hover:text-accent"
              >
                <div>
                  <p className="font-medium">{p.lessonId.split('/').pop()?.replace(/^\d{3}-/, '')}</p>
                  <p className="text-xs text-muted">
                    {p.completed ? t('statusCompleted') : t('statusInProgress')} ·{' '}
                    {t('attempts', { count: p.attempts })}
                  </p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-bold text-accent">{p.bestWpm} WPM</p>
                  <p className="text-muted">{p.bestAccuracy}%</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="text-center">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </Card>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="text-sm">
      <span className="mr-2 text-muted">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-foreground"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
