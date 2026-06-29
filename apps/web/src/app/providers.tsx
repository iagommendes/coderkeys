import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '@/shared/stores/settings.store';
import { ThemeProvider } from './ThemeProvider';
import '@/i18n';

export function AppProviders({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  const { load, uiLocale, loaded } = useSettingsStore();

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (loaded) {
      void i18n.changeLanguage(uiLocale);
    }
  }, [loaded, uiLocale, i18n]);

  if (!loaded) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted">
        Loading...
      </div>
    );
  }

  return <ThemeProvider>{children}</ThemeProvider>;
}
