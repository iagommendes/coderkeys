# Contributing Content

Thank you for contributing lessons to CoderKeys!

## Where to add lessons

```
content/tracks/{track}/{locale}/{module}/{id}.json
```

Example:

```
content/tracks/programmers/en-US/syntax-brackets/006-destructuring.json
```

## Lesson file format

See `packages/schemas/src/lesson.schema.ts` for the full schema.

Required fields:

- `id` — format `001-slug` (three-digit prefix + kebab-case slug)
- `track`, `module`, `locale` — must match the folder path
- `title`, `description` — in the lesson's language
- `difficulty` — 1 to 5
- `content.text` — exact text the user must type (min 20 characters)
- `mode` — `code`, `prose`, or `translation`

## Validation

Before opening a PR:

```bash
pnpm validate-content
pnpm check-i18n
```

See also [docs/ADDING-TRACK.md](../docs/ADDING-TRACK.md) for proposing new tracks and [docs/ADDING-LOCALE.md](../docs/ADDING-LOCALE.md) for new languages.

## Guidelines

- Use realistic code snippets or professional technical prose
- No secrets, credentials, or offensive content
- Keep lessons between 50–500 characters (ideal: 100–200)
- Progress difficulty gradually within a module
- Add the lesson slug to `content/manifest.json` under the correct module
