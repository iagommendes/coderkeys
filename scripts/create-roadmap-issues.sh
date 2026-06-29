#!/usr/bin/env bash
# Creates GitHub issues for CoderKeys post-Phase 3 roadmap.
# Requires: gh CLI with issue write access to iagommendes/coderkeys

set -euo pipefail
REPO="iagommendes/coderkeys"

create_issue() {
  local title="$1"
  local label="$2"
  local body="$3"
  gh issue create --repo "$REPO" --title "$title" --label "$label" --body "$body"
}

# ─── Sprint 4 — Polish & Launch ───────────────────────────────────────────────
# Issue #6 already tracks GitHub Pages deploy — skip duplicate.

create_issue "[Sprint 4] Lighthouse CI — Performance e Accessibility > 95" "enhancement" "$(cat <<'EOF'
## Sprint 4 — Polish & Launch

Pendência da Fase 3 (3.6).

### Tarefas
- [ ] Adicionar `@lhci/cli` ou `treosh/lighthouse-ci-action`
- [ ] Budget: Performance ≥ 95, Accessibility ≥ 95
- [ ] Corrigir gargalos (bundle size, contraste, aria-labels)
- [ ] Rodar no CI em PRs

### Referência
`docs/PLANEJAMENTO-ARQUITETURA.md` § 3.6
EOF
)" || true

create_issue "[Sprint 4] Code splitting — reduzir bundle principal" "enhancement" "$(cat <<'EOF'
## Sprint 4 — Polish & Launch

Build atual gera chunk JS ~1.3MB (warning Vite > 500KB).

### Tarefas
- [ ] Lazy load de rotas (`React.lazy` + `Suspense`)
- [ ] Lazy load dashboard (recharts)
- [ ] Lazy load CodeMirror por lição
- [ ] Meta: chunk inicial < 300KB gzip

### Impacto
Melhora TTI no mobile e no PWA.
EOF
)" || true

create_issue "[Sprint 4] Desktop releases — macOS e Windows no CI" "enhancement" "$(cat <<'EOF'
## Sprint 4 — Polish & Launch

Pendência Fase 3 (3.1): hoje só build Linux.

### Tarefas
- [ ] Job `build-macos` (macos-latest) no `desktop.yml`
- [ ] Job `build-windows` (windows-latest)
- [ ] Upload artifacts (.dmg, .msi, .exe) em tags `v*`
- [ ] Documentar instalação no README

### Critério de aceite
Release `v0.2.0` com binários para 3 plataformas.
EOF
)" || true

create_issue "[Sprint 4] Atualizar PLANEJAMENTO-ARQUITETURA.md — marcar fases concluídas" "documentation" "$(cat <<'EOF'
## Sprint 4 — Polish & Launch

Documentação desatualizada: checkboxes das Fases 1–3 ainda estão `[ ]`.

### Tarefas
- [ ] Marcar itens entregues nos PRs #1–#4
- [ ] Adicionar seção **Fase 4 — Crescimento** (link para ROADMAP.md)
- [ ] Registrar decisões tomadas (Tauri vs Electron, Vite 8, etc.)
EOF
)" || true

# ─── Sprint 5 — Content & i18n ────────────────────────────────────────────────

create_issue "[Sprint 5] Lições es-ES — 30 lições em conteúdo" "enhancement" "$(cat <<'EOF'
## Sprint 5 — Content & i18n

UI es-ES existe; conteúdo de lições ainda só en-US + pt-BR.

### Tarefas
- [ ] Traduzir 30 lições prioritárias (programmers + technical-writers)
- [ ] Adicionar slugs `es-ES` no `manifest.json`
- [ ] Validar com `pnpm validate-content`
- [ ] Atualizar `docs/ADDING-LOCALE.md` (tabela de status)

### Meta
90 lições totais (30 × 3 idiomas)
EOF
)" || true

create_issue "[Sprint 5] Expandir catálogo — 100+ lições" "enhancement" "$(cat <<'EOF'
## Sprint 5 — Content & i18n

Hoje: 60 lições (en-US + pt-BR).

### Tarefas
- [ ] +5 lições por módulo existente (syntax, translation, docker, python, legal)
- [ ] Módulos novos: `shell-commands`, `api-snippets`, `glossaries`
- [ ] Script de estatísticas de conteúdo no CI
- [ ] Campanha "good first issue" para contribuidores

### Meta
100+ lições em 2+ idiomas
EOF
)" || true

create_issue "[Sprint 5] Temas — Nord + galeria visual nas Settings" "enhancement" "$(cat <<'EOF'
## Sprint 5 — Content & i18n

Plano original citava tema Nord; hoje só default-dark/light + Dracula.

### Tarefas
- [ ] Adicionar `nord.json` + registrar em `BuiltInThemeIdSchema`
- [ ] Preview de cores (swatches) no seletor de tema
- [ ] Permitir import de tema JSON via Settings (local)
- [ ] Documentar em `docs/ADDING-THEME.md`
EOF
)" || true

create_issue "[Sprint 5] Validação de progressão de dificuldade por módulo" "enhancement" "$(cat <<'EOF'
## Sprint 5 — Content & i18n

### Tarefas
- [ ] Script `validate-difficulty-progression.ts`
- [ ] Alertar se lição N+1 tem difficulty menor que N
- [ ] Integrar ao CI quando `content/` mudar
- [ ] Sugestão de `minWpm` baseada em difficulty
EOF
)" || true

# ─── Sprint 6 — Platform & UX ─────────────────────────────────────────────────

create_issue "[Sprint 6] Countdown opcional antes da lição" "enhancement" "$(cat <<'EOF'
## Sprint 6 — Platform & UX

Mencionado no diagrama de estados (Apêndice A).

### Tarefas
- [ ] Setting: countdown 3s on/off
- [ ] Estado `countdown` entre `ready` e `active`
- [ ] UI animada + som opcional
- [ ] Teste E2E do fluxo
EOF
)" || true

create_issue "[Sprint 6] Layouts de teclado — ABNT2 e Dvorak" "enhancement" "$(cat <<'EOF'
## Sprint 6 — Platform & UX

### Tarefas
- [ ] Setting `keyboardLayout` em Dexie
- [ ] Hints adaptados por layout nas lições
- [ ] Visualização opcional do teclado (SVG) com heatmap de erros
- [ ] Documentar extensão do schema de hints
EOF
)" || true

create_issue "[Sprint 6] RTL — piloto com árabe (ar) ou hebraico (he)" "enhancement" "$(cat <<'EOF'
## Sprint 6 — Platform & UX

CSS RTL preparado; implementação pendente.

### Tarefas
- [ ] `dir="rtl"` no ThemeProvider por locale
- [ ] Auditar componentes com `margin-left` → logical properties
- [ ] Lição piloto prose RTL
- [ ] Testes visuais/E2E básicos
EOF
)" || true

create_issue "[Sprint 6] Trilha adaptativa — sugestões por skill tag" "enhancement" "$(cat <<'EOF'
## Sprint 6 — Platform & UX

Dashboard já sugere lições; evoluir para path completo.

### Tarefas
- [ ] Agregar `SkillStats` no IndexedDB (schema + repo)
- [ ] Algoritmo: próxima lição = weakest skill + difficulty +1
- [ ] Widget "Your learning path" no dashboard
- [ ] Testes unitários do recomendador
EOF
)" || true

create_issue "[Sprint 6] E2E expandido — dashboard, settings, translation" "enhancement" "$(cat <<'EOF'
## Sprint 6 — Platform & UX

Hoje: 2 testes Playwright (catalog→lesson, settings load).

### Tarefas
- [ ] E2E: trocar tema e verificar `data-color-theme`
- [ ] E2E: completar lição translation mode
- [ ] E2E: export/import progresso
- [ ] E2E: dashboard com dados seed
EOF
)" || true

# ─── Sprint 7 — Community & Scale ───────────────────────────────────────────

create_issue "[Sprint 7] Auto-release desktop em tags GitHub" "enhancement" "$(cat <<'EOF'
## Sprint 7 — Community & Scale

### Tarefas
- [ ] Workflow `release.yml` on push tag `v*`
- [ ] Gerar changelog automático
- [ ] Attach .deb, .AppImage, .dmg, .msi ao GitHub Release
- [ ] Assinatura de código (opcional, documentar)
EOF
)" || true

create_issue "[Sprint 7] Lesson preview web — validar JSON antes do PR" "enhancement" "$(cat <<'EOF'
## Sprint 7 — Community & Scale

### Tarefas
- [ ] Página `/preview?lesson=...` (dev only ou flag)
- [ ] Renderizar lição a partir de JSON colado/upload
- [ ] Link no PR template para testar localmente
- [ ] Integrar com content-preview bot (link no comentário)
EOF
)" || true

create_issue "[Sprint 7] CONTRIBUTING-CONTENT.md — guia completo bilíngue" "documentation" "$(cat <<'EOF'
## Sprint 7 — Community & Scale

Pendência Fase 3: plano citava `CONTRIBUTING-CONTENT.md` completo.

### Tarefas
- [ ] Expandir com exemplos por mode (code, prose, translation)
- [ ] Seção de licença de conteúdo (CC0 vs MIT)
- [ ] Checklist visual para PRs de conteúdo
- [ ] Versão pt-BR do guia
EOF
)" || true

create_issue "[Sprint 7] Issue template — bug report + feature request" "documentation" "$(cat <<'EOF'
## Sprint 7 — Community & Scale

Hoje: forms para lesson e locale apenas.

### Tarefas
- [ ] `bug_report.yml` com versão, browser, steps
- [ ] `feature_request.yml` com problema vs solução
- [ ] `config.yml` atualizado com links
EOF
)" || true

create_issue "[Sprint 7] GitHub Project board — importar roadmap" "documentation" "$(cat <<'EOF'
## Sprint 7 — Community & Scale

> **Nota:** O agente não tem permissão `project` no token GitHub.
> Esta issue documenta o setup manual.

### Passos (owner)
1. GitHub → Projects → New project → Board
2. Nome: **CoderKeys Roadmap**
3. Link ao repo `iagommendes/coderkeys`
4. Colunas: `Backlog` | `Sprint 4` | `Sprint 5` | `Sprint 6` | `Sprint 7` | `Done`
5. Importar issues com label `[Sprint N]` no título
6. Referência completa: `docs/ROADMAP.md`

### Issues já criadas
Ver milestone issues #6+ no repositório.
EOF
)" || true

echo "Done. List issues:"
gh issue list --repo "$REPO" --limit 30
