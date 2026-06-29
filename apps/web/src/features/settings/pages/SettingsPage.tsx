import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { BuiltInThemeId, Locale } from '@coderkeys/schemas';
import { useSettingsStore } from '@/shared/stores/settings.store';
import {
  exportProgress,
  importProgress,
  resetProgress,
  type ProgressExport,
} from '@/db/repositories/progress.repo';
import { getManifest } from '@/features/catalog/lesson-loader';
import { getBuiltInThemes } from '@/shared/lib/themes';
import { Button, Card } from '@/shared/components/ui';

const UI_LOCALES: { locale: Locale; label: string }[] = [
  { locale: 'en-US', label: 'English' },
  { locale: 'pt-BR', label: 'Português (BR)' },
  { locale: 'es-ES', label: 'Español' },
];

export function SettingsPage() {
  const { t, i18n } = useTranslation('settings');
  const {
    uiLocale,
    contentLocale,
    theme,
    colorTheme,
    strictMode,
    soundEnabled,
    loaded,
    load,
    setUiLocale,
    setContentLocale,
    setTheme,
    setColorTheme,
    setStrictMode,
    setSoundEnabled,
  } = useSettingsStore();
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const manifest = getManifest();
  const builtInThemes = getBuiltInThemes();

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (loaded) {
      void i18n.changeLanguage(uiLocale);
    }
  }, [loaded, uiLocale, i18n]);

  const flash = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleUiLocale = async (locale: Locale) => {
    await setUiLocale(locale);
    await i18n.changeLanguage(locale);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = async () => {
    const data = await exportProgress();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `coderkeys-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    flash(t('exportSuccess'));
  };

  const handleImport = async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text) as ProgressExport;
      await importProgress(data);
      await load();
      flash(t('importSuccess'));
    } catch {
      flash(t('importError'));
    }
  };

  const handleReset = async (trackId?: string) => {
    const confirmed = window.confirm(trackId ? t('resetTrackConfirm') : t('resetAllConfirm'));
    if (!confirmed) return;
    await resetProgress(trackId);
    flash(t('resetSuccess'));
  };

  if (!loaded) return null;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-3xl font-bold">{t('title')}</h1>

      {message && <p className="text-sm text-success">{message}</p>}
      {saved && <p className="text-sm text-success">{t('saved')}</p>}

      <Card className="space-y-4">
        <div>
          <label className="text-sm font-medium">{t('uiLocale')}</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {UI_LOCALES.map(({ locale, label }) => (
              <LocaleButton
                key={locale}
                active={uiLocale === locale}
                onClick={() => handleUiLocale(locale)}
              >
                {label}
              </LocaleButton>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">{t('contentLocale')}</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {UI_LOCALES.map(({ locale, label }) => (
              <LocaleButton
                key={locale}
                active={contentLocale === locale}
                onClick={() => void setContentLocale(locale)}
              >
                {label}
              </LocaleButton>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">{t('appearance')}</label>
          <div className="mt-2 flex flex-wrap gap-2">
            <LocaleButton active={theme === 'light'} onClick={() => void setTheme('light')}>
              {t('themeLight')}
            </LocaleButton>
            <LocaleButton active={theme === 'dark'} onClick={() => void setTheme('dark')}>
              {t('themeDark')}
            </LocaleButton>
            <LocaleButton active={theme === 'system'} onClick={() => void setTheme('system')}>
              {t('themeSystem')}
            </LocaleButton>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">{t('colorTheme')}</label>
          <p className="text-xs text-muted">{t('colorThemeDesc')}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {builtInThemes.map((item) => (
              <LocaleButton
                key={item.id}
                active={colorTheme === item.id}
                onClick={() => void setColorTheme(item.id as BuiltInThemeId)}
              >
                {item.name}
              </LocaleButton>
            ))}
          </div>
        </div>

        <ToggleRow
          label={t('strictMode')}
          description={t('strictModeDesc')}
          checked={strictMode}
          onChange={(v) => void setStrictMode(v)}
        />

        <ToggleRow
          label={t('soundEnabled')}
          description={t('soundEnabledDesc')}
          checked={soundEnabled}
          onChange={(v) => void setSoundEnabled(v)}
        />
      </Card>

      <Card className="space-y-4">
        <h2 className="font-semibold">{t('dataTitle')}</h2>
        <p className="text-sm text-muted">{t('dataDesc')}</p>

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => void handleExport()}>{t('export')}</Button>
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
            {t('import')}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleImport(file);
              e.target.value = '';
            }}
          />
        </div>

        <div className="space-y-2 border-t border-border pt-4">
          <p className="text-sm font-medium text-error">{t('dangerZone')}</p>
          <Button variant="secondary" onClick={() => void handleReset()}>
            {t('resetAll')}
          </Button>
          <div className="flex flex-wrap gap-2">
            {manifest.tracks.map((track) => (
              <Button key={track.id} variant="ghost" onClick={() => void handleReset(track.id)}>
                {t('resetTrack', { track: track.id })}
              </Button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

function LocaleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button variant={active ? 'primary' : 'secondary'} onClick={onClick}>
      {children}
    </Button>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted">{description}</p>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-accent"
      />
    </div>
  );
}
