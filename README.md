# CoderKeys

Open-source, local-first typing tutor tailored for **programmers** and **technical writers** to master code syntax and real-world vocabularies.

## Features

- **Skill-based tracks** — Programmers (code syntax, symbols) and Technical Writers (requirements, documentation)
- **Bilingual** — Interface and lessons in `en-US` and `pt-BR`
- **100% local** — No backend, no cloud costs; progress saved in IndexedDB
- **Contributor-friendly** — Add lessons by creating JSON files in `content/`

## Quick Start

```bash
git clone https://github.com/iagommendes/coderkeys.git
cd coderkeys
pnpm install
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Other commands

```bash
pnpm build            # Production build
pnpm preview          # Preview production build locally
pnpm test             # Run all tests
pnpm validate-content # Validate lesson JSON files
pnpm check-i18n       # Verify translation key parity
```

## Project Structure

```
coderkeys/
├── apps/web/           # React SPA (Vite + Tailwind)
├── packages/engine/    # Typing engine (WPM, accuracy) — framework-agnostic
├── packages/schemas/   # Zod schemas for lessons and progress
├── content/            # Lesson content (contributors edit here)
└── docs/               # Architecture and planning docs
```

## Contributing Lessons

1. Create a JSON file in `content/tracks/{track}/{locale}/{module}/`
2. Follow the schema in `packages/schemas/src/lesson.schema.ts`
3. Run `pnpm validate-content`
4. Open a Pull Request

See [docs/PLANEJAMENTO-ARQUITETURA.md](docs/PLANEJAMENTO-ARQUITETURA.md) for the full architecture plan.

## License

MIT
