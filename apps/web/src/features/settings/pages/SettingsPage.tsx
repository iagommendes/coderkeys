import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Locale } from '@coderkeys/schemas';
import { useSettingsStore } from '@/shared/stores/settings.store';
import { Button, Card } from '@/shared/components/ui';

export function SettingsPage() {
  const { t, i18n } = useTranslation('settings');
  const { uiLocale, contentLocale, strictMode, loaded, load, setUiLocale, setContentLocale, setStrictMode } =
    useSettingsStore();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (loaded) {
      void i18n.changeLanguage(uiLocale);
    }
  }, [loaded, uiLocale, i18n]);

  const handleUiLocale = async (locale: Locale) => {
    await setUiLocale(locale);
    await i18n.changeLanguage(locale);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!loaded) return null;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-3xl font-bold">{t('title')}</h1>

      <Card className="space-y-4">
        <div>
          <label className="text-sm font-medium">{t('uiLocale')}</label>
          <div className="mt-2 flex gap-2">
            <LocaleButton active={uiLocale === 'en-US'} onClick={() => handleUiLocale('en-US')}>
              English
            </LocaleButton>
            <LocaleButton active={uiLocale === 'pt-BR'} onClick={() => handleUiLocale('pt-BR')}>
              Português (BR)
            </LocaleButton>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">{t('contentLocale')}</label>
          <div className="mt-2 flex gap-2">
            <LocaleButton
              active={contentLocale === 'en-US'}
              onClick={() => void setContentLocale('en-US')}
            >
              English
            </LocaleButton>
            <LocaleButton
              active={contentLocale === 'pt-BR'}
              onClick={() => void setContentLocale('pt-BR')}
            >
              Português (BR)
            </LocaleButton>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{t('strictMode')}</p>
            <p className="text-xs text-muted">{t('strictModeDesc')}</p>
          </div>
          <input
            type="checkbox"
            checked={strictMode}
            onChange={(e) => void setStrictMode(e.target.checked)}
            className="h-4 w-4 accent-accent"
          />
        </div>

        {saved && <p className="text-sm text-success">{t('saved')}</p>}
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
