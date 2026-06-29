import { useEffect } from 'react';
import type { BuiltInThemeId } from '@coderkeys/schemas';
import { useSettingsStore } from '@/shared/stores/settings.store';
import { applyThemeColors, getTheme } from '@/shared/lib/themes';

function resolveAppearance(theme: 'light' | 'dark' | 'system'): 'light' | 'dark' {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme;
}

function resolveColorTheme(
  colorTheme: BuiltInThemeId,
  appearance: 'light' | 'dark',
): BuiltInThemeId {
  if (colorTheme === 'default-dark' || colorTheme === 'default-light') {
    return appearance === 'dark' ? 'default-dark' : 'default-light';
  }
  return colorTheme;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSettingsStore((s) => s.theme);
  const colorTheme = useSettingsStore((s) => s.colorTheme);

  useEffect(() => {
    const apply = () => {
      const appearance = resolveAppearance(theme);
      const resolved = resolveColorTheme(colorTheme, appearance);
      applyThemeColors(getTheme(resolved));
      document.documentElement.setAttribute('data-theme', appearance);
      document.documentElement.setAttribute('dir', 'ltr');
    };

    apply();

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener('change', apply);
      return () => mq.removeEventListener('change', apply);
    }
  }, [theme, colorTheme]);

  return <>{children}</>;
}
