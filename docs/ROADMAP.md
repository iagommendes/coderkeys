# CoderKeys — Roadmap Pós-Fase 3

> **Última atualização:** 2026-06-29  
> **Status do projeto:** Fases 1–3 concluídas (PRs [#1](https://github.com/iagommendes/coderkeys/pull/1)–[#4](https://github.com/iagommendes/coderkeys/pull/4))

---

## Resumo executivo

O CoderKeys evoluiu de documento de arquitetura para produto open source funcional em três fases. Este roadmap define **melhorias priorizadas** organizadas em **4 sprints** (Sprints 4–7), com issues vinculadas no GitHub.

| Métrica atual | Valor |
|---------------|-------|
| Lições validadas | 60 (en-US + pt-BR) |
| Tracks | 5 |
| Idiomas UI | en-US, pt-BR, es-ES |
| Idiomas conteúdo | en-US, pt-BR |
| Testes engine | 21 |
| E2E Playwright | 2 fluxos |
| Desktop | Tauri 2 (Linux CI ✅) |

---

## O que foi entregue (PRs)

### PR #1 — Documentação de arquitetura
- `docs/PLANEJAMENTO-ARQUITETURA.md` — visão, stack, schemas, roadmap 3 fases

### PR #2 — Fase 1 (MVP)
- Monorepo pnpm (`apps/web`, `packages/engine`, `packages/schemas`)
- Typing engine com testes, Dexie/IndexedDB, i18n en/pt
- 20 lições seed, CI básico

### PR #3 — Fase 2 (Experiência)
- Dashboard (gráficos, heatmap, sugestões)
- Modo translation, CodeMirror, PWA
- Export/import/reset de progresso, temas claro/escuro

### PR #4 — Fase 3 (Comunidade)
- Tauri 2 desktop, 3 temas de cores, es-ES UI
- Tracks devops, data-science, legal-translators (+30 lições)
- CONTRIBUTING.md, issue forms, content preview CI, Playwright E2E

---

## Lacunas identificadas (Fase 3 incompleta)

| Item planejado | Status |
|----------------|--------|
| Lighthouse > 95 | ❌ Não implementado |
| Desktop macOS/Windows CI | ❌ Só Linux |
| Lições es-ES | ❌ Só metadados + UI |
| Tema Nord | ❌ Só default + Dracula |
| RTL implementado | ⚠️ CSS prep only |
| CONTRIBUTING-CONTENT completo | ⚠️ Parcial |
| Bundle < 500KB | ❌ ~1.3MB chunk principal |

---

## Visão das próximas fases

```
Sprint 4 — Polish & Launch     Sprint 5 — Content & i18n
(deploy, perf, desktop 3 OS)   (100+ lições, es-ES content)
         │                              │
         └──────────┬───────────────────┘
                    ▼
         Sprint 6 — Platform & UX
         (countdown, RTL, teclados, path adaptativo)
                    │
                    ▼
         Sprint 7 — Community & Scale
         (releases, preview web, docs, project board)
```

---

## Sprint 4 — Polish & Launch

**Objetivo:** Estabilizar, publicar demo pública e fechar pendências técnicas da Fase 3.

| # | Tarefa | Prioridade | Issue |
|---|--------|------------|-------|
| 4.1 | GitHub Pages deploy + badge CI | Alta | [#6](https://github.com/iagommendes/coderkeys/issues/6) |
| 4.2 | Lighthouse CI (Perf + A11y ≥ 95) | Alta | [#7](https://github.com/iagommendes/coderkeys/issues/7) |
| 4.3 | Code splitting (lazy routes, recharts) | Alta | [#8](https://github.com/iagommendes/coderkeys/issues/8) |
| 4.4 | Desktop builds macOS + Windows | Média | [#9](https://github.com/iagommendes/coderkeys/issues/9) |
| 4.5 | Atualizar doc de arquitetura (fases ✅) | Baixa | [#10](https://github.com/iagommendes/coderkeys/issues/10) |

**Critério de conclusão:** Demo pública online, Lighthouse verde, releases desktop 3 plataformas.

---

## Sprint 5 — Content & i18n

**Objetivo:** Expandir catálogo e completar internacionalização.

| # | Tarefa | Prioridade | Issue |
|---|--------|------------|-------|
| 5.1 | 30 lições es-ES (conteúdo) | Alta | [#11](https://github.com/iagommendes/coderkeys/issues/11) |
| 5.2 | 100+ lições totais | Alta | [#12](https://github.com/iagommendes/coderkeys/issues/12) |
| 5.3 | Tema Nord + galeria visual | Média | [#13](https://github.com/iagommendes/coderkeys/issues/13) |
| 5.4 | Validação de progressão de difficulty | Média | [#14](https://github.com/iagommendes/coderkeys/issues/14) |

**Critério de conclusão:** 90+ lições em 3 idiomas UI, 100+ em 2 idiomas de conteúdo.

---

## Sprint 6 — Platform & UX

**Objetivo:** Diferenciais de produto para retenção diária.

| # | Tarefa | Prioridade | Issue |
|---|--------|------------|-------|
| 6.1 | Countdown opcional pré-lição | Média | [#15](https://github.com/iagommendes/coderkeys/issues/15) |
| 6.2 | Layouts de teclado (ABNT2, Dvorak) | Média | [#16](https://github.com/iagommendes/coderkeys/issues/16) |
| 6.3 | RTL piloto (ar/he) | Baixa | [#17](https://github.com/iagommendes/coderkeys/issues/17) |
| 6.4 | Trilha adaptativa por skill tag | Alta | [#18](https://github.com/iagommendes/coderkeys/issues/18) |
| 6.5 | E2E expandido (dashboard, translation) | Média | [#19](https://github.com/iagommendes/coderkeys/issues/19) |

**Critério de conclusão:** Path de aprendizado personalizado + cobertura E2E das features principais.

---

## Sprint 7 — Community & Scale

**Objetivo:** Infraestrutura para crescimento orgânico OSS.

| # | Tarefa | Prioridade | Issue |
|---|--------|------------|-------|
| 7.1 | Auto-release desktop em tags | Alta | [#20](https://github.com/iagommendes/coderkeys/issues/20) |
| 7.2 | Lesson preview web (validar JSON) | Média | [#21](https://github.com/iagommendes/coderkeys/issues/21) |
| 7.3 | CONTRIBUTING-CONTENT bilíngue completo | Média | [#22](https://github.com/iagommendes/coderkeys/issues/22) |
| 7.4 | Issue templates bug + feature | Baixa | [#23](https://github.com/iagommendes/coderkeys/issues/23) |
| 7.5 | GitHub Project board | Baixa | [#24](https://github.com/iagommendes/coderkeys/issues/24) |

**Critério de conclusão:** Releases automatizados, contribuidores conseguem validar lições sem clone completo.

---

## Como usar este roadmap no GitHub

### Criar o Project (manual — requer permissão de owner)

1. Acesse https://github.com/users/iagommendes/projects
2. **New project** → Template **Board**
3. Nome: `CoderKeys Roadmap`
4. **Link repository:** `iagommendes/coderkeys`
5. Colunas sugeridas:

```
Backlog → Sprint 4 → Sprint 5 → Sprint 6 → Sprint 7 → Done
```

6. Filtre issues pelo prefixo `[Sprint N]` no título
7. Opcional: campo custom **Priority** (Alta/Média/Baixa)

### Issues

Execute localmente para recriar issues (se necessário):

```bash
bash scripts/create-roadmap-issues.sh
```

Liste issues do roadmap:

```bash
gh issue list --repo iagommendes/coderkeys --search "[Sprint" --limit 30
```

---

## Documentação existente

| Arquivo | Propósito |
|---------|-----------|
| [PLANEJAMENTO-ARQUITETURA.md](./PLANEJAMENTO-ARQUITETURA.md) | Arquitetura e fases 1–3 (histórico) |
| [../CONTRIBUTING.md](../CONTRIBUTING.md) | Guia geral de contribuição |
| [../content/CONTRIBUTING-CONTENT.md](../content/CONTRIBUTING-CONTENT.md) | Como adicionar lições |
| [ADDING-LOCALE.md](./ADDING-LOCALE.md) | Novos idiomas |
| [ADDING-THEME.md](./ADDING-THEME.md) | Novos temas |
| [ADDING-TRACK.md](./ADDING-TRACK.md) | Novos tracks |

---

## Priorização recomendada (ordem de execução)

1. **GitHub Pages** — visibilidade imediata para OSS
2. **Code splitting** — desbloqueia Lighthouse
3. **Lighthouse CI** — qualidade mensurável
4. **Lições es-ES** — completa promessa da Fase 3
5. **Desktop 3 OS** — diferencial Tauri
6. **Trilha adaptativa** — retenção
7. **Auto-release** — sustentabilidade do projeto

---

## Riscos e dependências

| Risco | Mitigação |
|-------|-----------|
| Bundle grande bloqueia Lighthouse | Sprint 4.3 antes de 4.2 |
| Tauri macOS/Windows consome minutos CI | Jobs paralelos, cache Rust |
| Tradução es-ES manual é lenta | Campanha comunitária + issue form |
| Token bot sem escopo `project` | Owner cria Project manualmente (issue #7.5) |
