import { ThemeSchema, type BuiltInThemeId, type Theme } from '@coderkeys/schemas';
import defaultDark from '@/themes/default-dark.json';
import defaultLight from '@/themes/default-light.json';
import dracula from '@/themes/dracula.json';
import nord from '@/themes/nord.json';

const themes: Record<BuiltInThemeId, Theme> = {
  'default-dark': ThemeSchema.parse(defaultDark),
  'default-light': ThemeSchema.parse(defaultLight),
  dracula: ThemeSchema.parse(dracula),
  nord: ThemeSchema.parse(nord),
};

export function getBuiltInThemes(): Theme[] {
  return Object.values(themes);
}

export function getTheme(id: BuiltInThemeId): Theme {
  return themes[id];
}

export function applyThemeColors(theme: Theme): void {
  const root = document.documentElement;
  const { colors, fonts } = theme;

  root.style.setProperty('--color-surface', colors.surface);
  root.style.setProperty('--color-surface-elevated', colors.surfaceElevated);
  root.style.setProperty('--color-border', colors.border);
  root.style.setProperty('--color-accent', colors.accent);
  root.style.setProperty('--color-accent-hover', colors.accentHover);
  root.style.setProperty('--color-success', colors.success);
  root.style.setProperty('--color-error', colors.error);
  root.style.setProperty('--color-muted', colors.muted);
  root.style.setProperty('--color-foreground', colors.foreground);

  if (fonts?.sans) root.style.setProperty('--font-sans', fonts.sans);
  if (fonts?.mono) root.style.setProperty('--font-mono', fonts.mono);

  root.setAttribute('data-color-theme', theme.id);
}
