# Proposing a new track

A **track** is a top-level learning path (e.g. `programmers`, `devops`).

## Steps

1. **Discuss first** — open a GitHub issue describing the audience and sample lessons.
2. Create `content/tracks/{track-id}/_meta.json`:

```json
{
  "id": "my-track",
  "name": {
    "en-US": "My Track",
    "pt-BR": "Minha Trilha",
    "es-ES": "Mi Ruta"
  },
  "description": {
    "en-US": "Short description.",
    "pt-BR": "Descrição curta.",
    "es-ES": "Descripción corta."
  },
  "defaultModule": "first-module"
}
```

3. Add at least one module with lessons in `en-US` and `pt-BR` (minimum for merge).
4. Register the track in `content/manifest.json`.
5. Add a catalog icon mapping in `CatalogPage.tsx` if using a new icon key.
6. Run `pnpm validate-content`.

## Track ideas welcome

- `devops` — Docker, kubectl, Terraform
- `data-science` — Python, SQL, pandas
- `legal-translators` — bilingual legal vocabulary

See existing tracks under `content/tracks/` for reference.
