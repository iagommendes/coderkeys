# Contributing to CoderKeys

Thank you for helping make CoderKeys better! This project is local-first, content-driven, and designed for community contributions.

## Quick start

```bash
git clone https://github.com/iagommendes/coderkeys.git
cd coderkeys
pnpm install
pnpm dev
```

## What you can contribute

| Area | Where to work | Guide |
|------|---------------|-------|
| **Lessons & tracks** | `content/` | [CONTRIBUTING-CONTENT.md](content/CONTRIBUTING-CONTENT.md) |
| **UI translations** | `apps/web/src/i18n/locales/` | [docs/ADDING-LOCALE.md](docs/ADDING-LOCALE.md) |
| **Color themes** | `apps/web/src/themes/` | [docs/ADDING-THEME.md](docs/ADDING-THEME.md) |
| **Typing engine** | `packages/engine/` | Add tests in `packages/engine/tests/` |
| **Web app** | `apps/web/` | Follow existing React + Tailwind patterns |

## Development workflow

1. Fork the repository and create a branch from `main`.
2. Make focused changes with clear commit messages.
3. Run checks locally before opening a PR:

```bash
pnpm typecheck
pnpm test
pnpm validate-content
pnpm check-i18n
pnpm build
```

4. Open a pull request using the PR template checklist.

## Project structure

```
apps/web/           React SPA (Vite)
packages/engine/    Typing engine (framework-agnostic)
packages/schemas/   Zod schemas shared across app and CI
content/            Lesson JSON files (contributor-friendly)
src-tauri/          Desktop wrapper (Tauri 2)
```

## Code style

- TypeScript strict mode — no `any` without justification
- Match existing naming and file layout
- Keep the engine free of React dependencies
- Prefer small, reviewable PRs

## Reporting issues

Use the GitHub issue forms:

- **New lesson** — propose a lesson idea
- **New locale** — request or offer a UI/content language
- **Bug report** — something broken in the app

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License. Lesson content may use CC0 where noted in `content/CONTRIBUTING-CONTENT.md`.
