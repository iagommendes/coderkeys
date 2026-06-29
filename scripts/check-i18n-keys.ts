import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localesDir = path.join(__dirname, '../apps/web/src/i18n/locales');

async function loadKeys(dir: string): Promise<Record<string, string[]>> {
  const locales = await readdir(dir, { withFileTypes: true });
  const result: Record<string, string[]> = {};

  for (const locale of locales.filter((d) => d.isDirectory())) {
    const localePath = path.join(dir, locale.name);
    const files = await readdir(localePath);
    const keys: string[] = [];

    for (const file of files.filter((f) => f.endsWith('.json'))) {
      const content = JSON.parse(await readFile(path.join(localePath, file), 'utf-8'));
      const prefix = file.replace('.json', '');
      flattenKeys(content, prefix, keys);
    }

    result[locale.name] = keys.sort();
  }

  return result;
}

function flattenKeys(obj: Record<string, unknown>, prefix: string, out: string[]) {
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      flattenKeys(value as Record<string, unknown>, fullKey, out);
    } else {
      out.push(fullKey);
    }
  }
}

async function main() {
  const keysByLocale = await loadKeys(localesDir);
  const locales = Object.keys(keysByLocale);

  if (locales.length < 2) {
    console.log('Only one locale found, skipping parity check.');
    return;
  }

  const [base, ...others] = locales;
  const baseKeys = new Set(keysByLocale[base]);
  let ok = true;

  for (const locale of others) {
    const localeKeys = new Set(keysByLocale[locale]);

    for (const key of baseKeys) {
      if (!localeKeys.has(key)) {
        console.error(`Missing in ${locale}: ${key}`);
        ok = false;
      }
    }

    for (const key of localeKeys) {
      if (!baseKeys.has(key)) {
        console.error(`Extra in ${locale}: ${key}`);
        ok = false;
      }
    }
  }

  if (!ok) process.exit(1);
  console.log(`✓ i18n keys match across ${locales.join(', ')}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
