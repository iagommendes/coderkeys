import { create } from 'zustand';
import type { BuiltInThemeId, Locale } from '@coderkeys/schemas';
import { getSettings, saveSettings } from '@/db/repositories/settings.repo';

type Theme = 'light' | 'dark' | 'system';

interface SettingsState {
  uiLocale: Locale;
  contentLocale: Locale;
  theme: Theme;
  colorTheme: BuiltInThemeId;
  strictMode: boolean;
  soundEnabled: boolean;
  loaded: boolean;
  load: () => Promise<void>;
  setUiLocale: (locale: Locale) => Promise<void>;
  setContentLocale: (locale: Locale) => Promise<void>;
  setTheme: (theme: Theme) => Promise<void>;
  setColorTheme: (colorTheme: BuiltInThemeId) => Promise<void>;
  setStrictMode: (strict: boolean) => Promise<void>;
  setSoundEnabled: (enabled: boolean) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  uiLocale: 'en-US',
  contentLocale: 'en-US',
  theme: 'dark',
  colorTheme: 'default-dark',
  strictMode: false,
  soundEnabled: false,
  loaded: false,

  load: async () => {
    const settings = await getSettings();
    set({
      uiLocale: settings.uiLocale,
      contentLocale: settings.contentLocale,
      theme: settings.theme,
      colorTheme: settings.colorTheme ?? 'default-dark',
      strictMode: settings.strictMode,
      soundEnabled: settings.soundEnabled,
      loaded: true,
    });
  },

  setUiLocale: async (locale) => {
    await saveSettings({ uiLocale: locale });
    set({ uiLocale: locale });
  },

  setContentLocale: async (locale) => {
    await saveSettings({ contentLocale: locale });
    set({ contentLocale: locale });
  },

  setTheme: async (theme) => {
    await saveSettings({ theme });
    set({ theme });
  },

  setColorTheme: async (colorTheme) => {
    await saveSettings({ colorTheme });
    set({ colorTheme });
  },

  setStrictMode: async (strict) => {
    await saveSettings({ strictMode: strict });
    set({ strictMode: strict });
  },

  setSoundEnabled: async (enabled) => {
    await saveSettings({ soundEnabled: enabled });
    set({ soundEnabled: enabled });
  },
}));
