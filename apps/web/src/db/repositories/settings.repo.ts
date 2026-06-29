import type { Locale } from '@coderkeys/schemas';
import { db, DEFAULT_SETTINGS, type UserSettings } from '../database';

export async function getSettings(): Promise<UserSettings> {
  const settings = await db.settings.get('default');
  return settings ?? DEFAULT_SETTINGS;
}

export async function saveSettings(partial: Partial<Omit<UserSettings, 'id'>>): Promise<UserSettings> {
  const current = await getSettings();
  const updated: UserSettings = { ...current, ...partial };
  await db.settings.put(updated);
  return updated;
}

export async function setUiLocale(locale: Locale): Promise<UserSettings> {
  return saveSettings({ uiLocale: locale });
}
