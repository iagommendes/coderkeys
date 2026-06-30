# Adding a new locale

CoderKeys separates **UI locale** (interface strings) from **content locale** (lesson JSON files).

## UI locale (interface)

1. Add the locale code to `LocaleSchema` in `packages/schemas/src/lesson.schema.ts`.
2. Create a folder `apps/web/src/i18n/locales/{locale}/` with these files:
   - `common.json`
   - `catalog.json`
   - `lesson.json`
   - `settings.json`
   - `dashboard.json`
3. Register the locale in `apps/web/src/i18n/index.ts` (`resources` + `supportedLngs`).
4. Run `pnpm check-i18n` — all keys must match across locales.

## Content locale (lessons)

1. Add lesson JSON files under `content/tracks/{track}/{locale}/{module}/`.
2. Update `content/tracks/{track}/_meta.json` with `name` and `description` for the new locale.
3. Add lesson slugs to `content/manifest.json` under each module's `lessons` object.
4. Run `pnpm validate-content`.

## RTL languages (future)

RTL is not fully implemented yet, but the CSS layer is prepared:

- `ThemeProvider` sets `dir="ltr"` by default.
- Use logical properties (`margin-inline-start`, `padding-inline-end`) in new components.
- See `[dir='rtl']` rules in `apps/web/src/index.css`.

When adding an RTL locale, update `ThemeProvider` to set `dir` based on locale.

## Supported locales today

| Code | UI | Content |
|------|----|---------|
| `en-US` | ✅ | ✅ |
| `pt-BR` | ✅ | ✅ |
| `es-ES` | ✅ | ✅ (programmers + technical-writers) |
