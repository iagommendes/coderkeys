import { create } from 'zustand';
import type { Locale } from '@coderkeys/schemas';
import { getSettings, saveSettings } from '@/db/repositories/settings.repo';

interface SettingsState {
  uiLocale: Locale;
  contentLocale: Locale;
  strictMode: boolean;
  loaded: boolean;
  load: () => Promise<void>;
  setUiLocale: (locale: Locale) => Promise<void>;
  setContentLocale: (locale: Locale) => Promise<void>;
  setStrictMode: (strict: boolean) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  uiLocale: 'en-US',
  contentLocale: 'en-US',
  strictMode: false,
  loaded: false,

  load: async () => {
    const settings = await getSettings();
    set({
      uiLocale: settings.uiLocale,
      contentLocale: settings.contentLocale,
      strictMode: settings.strictMode,
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

  setStrictMode: async (strict) => {
    await saveSettings({ strictMode: strict });
    set({ strictMode: strict });
  },
}));
