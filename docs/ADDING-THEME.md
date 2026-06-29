# Adding a color theme

CoderKeys supports customizable color palettes inspired by community typing apps.

## Theme file format

Create a JSON file in `apps/web/src/themes/`:

```json
{
  "id": "my-theme",
  "name": "My Theme",
  "author": "your-github-username",
  "description": "Optional short description",
  "colors": {
    "surface": "#0f1419",
    "surfaceElevated": "#1a2332",
    "border": "#2d3a4f",
    "accent": "#3b82f6",
    "accentHover": "#2563eb",
    "success": "#22c55e",
    "error": "#ef4444",
    "muted": "#94a3b8",
    "foreground": "#e2e8f0"
  },
  "fonts": {
    "sans": "'Inter', sans-serif",
    "mono": "'JetBrains Mono', monospace"
  }
}
```

## Register the theme

1. Add the theme id to `BuiltInThemeIdSchema` in `packages/schemas/src/theme.schema.ts`.
2. Import and register it in `apps/web/src/shared/lib/themes.ts`.
3. Validate with `ThemeSchema.parse()` (done automatically at load time).

## Built-in themes

| ID | Description |
|----|-------------|
| `default-dark` | Default dark palette (syncs with appearance) |
| `default-light` | Default light palette (syncs with appearance) |
| `dracula` | Dracula-inspired palette |

When `default-dark` or `default-light` is selected, the app picks the variant matching the current appearance (light/dark/system).

## Guidelines

- Ensure sufficient contrast for `foreground` on `surface`
- Test both code lesson view and dashboard
- Avoid neon colors that reduce readability during long sessions
