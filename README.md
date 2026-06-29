# CoderKeys

[![CI](https://github.com/iagommendes/coderkeys/actions/workflows/ci.yml/badge.svg)](https://github.com/iagommendes/coderkeys/actions/workflows/ci.yml)
[![Deploy](https://github.com/iagommendes/coderkeys/actions/workflows/deploy.yml/badge.svg)](https://github.com/iagommendes/coderkeys/actions/workflows/deploy.yml)
[![Live Demo](https://img.shields.io/badge/demo-GitHub%20Pages-blue)](https://iagommendes.github.io/coderkeys/)

Open-source, local-first typing tutor tailored for **programmers** and **technical writers** to master code syntax and real-world vocabularies.

## Features

- **Skill-based tracks** — Programmers, Technical Writers, DevOps, Data Science, and Legal Translators
- **Multilingual** — UI in `en-US`, `pt-BR`, and `es-ES`; lessons in `en-US` and `pt-BR` (60+ lessons)
- **Custom themes** — Built-in dark, light, and Dracula color palettes
- **Desktop app** — Optional Tauri 2 wrapper for Linux, macOS, and Windows
- **Progress dashboard** — WPM charts, error heatmap, lesson suggestions
- **Translation mode** — Practice bilingual technical writing
- **100% local** — No backend, no cloud costs; progress saved in IndexedDB
- **PWA** — Installable and works offline after first load
- **Contributor-friendly** — Add lessons by creating JSON files in `content/`

## Quick Start

```bash
git clone https://github.com/iagommendes/coderkeys.git
cd coderkeys
pnpm install
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

**Live demo:** [https://iagommendes.github.io/coderkeys/](https://iagommendes.github.io/coderkeys/)

### Other commands

```bash
pnpm build            # Production build
pnpm preview          # Preview production build locally
pnpm test             # Run all tests
pnpm validate-content # Validate lesson JSON files
pnpm check-i18n       # Verify translation key parity
pnpm test:e2e         # Playwright end-to-end tests
pnpm tauri:dev        # Desktop app (dev)
pnpm tauri:build      # Desktop app (release)
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for contributor guidelines.

## Project Structure

```
coderkeys/
├── apps/web/           # React SPA (Vite + Tailwind)
├── packages/engine/    # Typing engine (WPM, accuracy) — framework-agnostic
├── packages/schemas/   # Zod schemas for lessons and progress
├── content/            # Lesson content (contributors edit here)
├── src-tauri/          # Tauri 2 desktop wrapper
└── docs/               # Architecture and planning docs
```

## Contributing Lessons

1. Create a JSON file in `content/tracks/{track}/{locale}/{module}/`
2. Follow the schema in `packages/schemas/src/lesson.schema.ts`
3. Run `pnpm validate-content`
4. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) and [content/CONTRIBUTING-CONTENT.md](content/CONTRIBUTING-CONTENT.md).

## License

MIT
