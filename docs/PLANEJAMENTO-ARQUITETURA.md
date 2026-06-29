# CoderKeys — Plano de Arquitetura e Roadmap

> **Status:** Documento de planejamento (pré-implementação)  
> **Versão:** 1.0  
> **Escopo:** Typing tutor open source, local-first, focado em skills específicas para programadores e escritores técnicos.

---

## Sumário

1. [Visão Geral da Arquitetura](#1-visão-geral-da-arquitetura)
2. [Stack Tecnológica Recomendada](#2-stack-tecnológica-recomendada)
3. [Estrutura de Diretórios](#3-estrutura-de-diretórios)
4. [Estrutura de Dados das Lições](#4-estrutura-de-dados-das-lições)
5. [Roadmap de Implementação](#5-roadmap-de-implementação)
6. [Apêndices](#6-apêndices)

---

## 1. Visão Geral da Arquitetura

### 1.1 Princípios de Design

| Princípio | Descrição |
|-----------|-----------|
| **Local-first** | Toda a aplicação roda no navegador do usuário. Não há servidor backend, banco remoto ou autenticação. |
| **Content-as-data** | Lições são arquivos estáticos versionados no Git. Contribuidores editam JSON/Markdown, não código da engine. |
| **Separação engine/conteúdo** | O motor de digitação (WPM, precisão, estados) é independente do conteúdo das lições. |
| **Validação em build** | Schemas Zod validam lições e traduções antes do merge, reduzindo PRs quebrados. |
| **Zero custo** | Sem dependências pagas, sem deploy obrigatório. Hospedagem opcional via GitHub Pages. |

### 1.2 Como a Aplicação Funciona Localmente

```
┌─────────────────────────────────────────────────────────────────┐
│                        Navegador (SPA)                          │
│                                                                 │
│  ┌──────────────┐   ┌──────────────┐   ┌─────────────────────┐ │
│  │   UI Layer   │──▶│  App State   │──▶│  Typing Engine      │ │
│  │  (React)     │◀──│  (Zustand)   │◀──│  (puro TypeScript)  │ │
│  └──────────────┘   └──────────────┘   └─────────────────────┘ │
│         │                  │                      │             │
│         ▼                  ▼                      ▼             │
│  ┌──────────────┐   ┌──────────────┐   ┌─────────────────────┐ │
│  │  i18n UI     │   │  Progress    │   │  Lesson Loader      │ │
│  │  (react-     │   │  Repository  │   │  (import estático   │ │
│  │   i18next)   │   │  (Dexie/IDB) │   │   + lazy chunks)    │ │
│  └──────────────┘   └──────────────┘   └─────────────────────┘ │
│                              │                      │             │
└──────────────────────────────┼──────────────────────┼─────────────┘
                               │                      │
                               ▼                      ▼
                    ┌──────────────────┐    ┌──────────────────┐
                    │   IndexedDB      │    │  content/        │
                    │   (progresso,    │    │  (JSON lições,   │
                    │    settings)     │    │   versionado)    │
                    └──────────────────┘    └──────────────────┘
```

**Fluxo de execução:**

1. O usuário clona o repositório e executa `pnpm install && pnpm dev`.
2. O Vite serve a SPA em `http://localhost:5173` (ou build estático via `pnpm build && pnpm preview`).
3. Na inicialização, a app carrega o catálogo de lições (manifest JSON) e as preferências do usuário do IndexedDB.
4. Ao iniciar uma lição, o texto é carregado via `import()` dinâmico (code-splitting por trilha/idioma).
5. O **Typing Engine** (módulo puro, sem React) processa cada keystroke, calcula métricas e emite eventos.
6. A UI reage aos eventos e atualiza o display de caracteres (correto/incorreto/atual).
7. Ao finalizar, o resultado é persistido no IndexedDB e exibido no dashboard de progresso.

### 1.3 Persistência do Progresso

**Por que IndexedDB (via Dexie.js)?**

- Suporta centenas de MB — mais que suficiente para histórico de sessões.
- API assíncrona, não bloqueia a UI durante digitação.
- Funciona 100% offline, sem servidor.
- Dexie oferece `liveQuery()` para atualizar dashboards automaticamente e migrations versionadas.

**O que é persistido localmente:**

| Entidade | Exemplos de campos | Quando gravar |
|----------|-------------------|---------------|
| `UserSettings` | idioma UI, tema, layout de teclado, modo strict | Ao alterar configuração |
| `LessonProgress` | lessonId, bestWpm, bestAccuracy, attempts, lastPlayedAt | Ao completar lição |
| `SessionResult` | sessionId, lessonId, wpm, accuracy, rawWpm, durationMs, errors[], completedAt | Ao completar sessão |
| `SkillStats` | skillTag, aggregateWpm, errorHotspots (ex: `{`, `=>`) | Debounced após sessão |

**Estratégia de gravação:**

- **Não** persistir a cada keystroke — apenas manter estado em memória durante a sessão.
- Gravar no IndexedDB ao completar a lição ou ao sair explicitamente (com confirmação se houver progresso parcial).
- Usar transações únicas (`db.transaction('rw', [...], async () => {...})`) para batch writes.
- Export/import de progresso via JSON (funcionalidade da Fase 2) para backup manual.

### 1.4 Modelo de Métricas (Typing Engine)

O motor deve implementar métricas transparentes e documentadas, seguindo convenções da indústria:

```
WPM (net)     = (caracteres_corretos / 5) / minutos_decorridos
WPM (raw)     = (total_caracteres_digitados / 5) / minutos_decorridos
Precisão (%)  = (keystrokes_corretos / total_keystrokes) × 100
AWPM          = WPM × (precisão / 100)   // velocidade ajustada
```

**Regras adicionais para o domínio do projeto:**

| Regra | Justificativa |
|-------|---------------|
| Usar `performance.now()` para timing | Monotônico, alta resolução, imune a ajustes de relógio do SO |
| WPM ao vivo via janela deslizante (5s) | Feedback instantâneo sem subestimar no início da sessão |
| Backspace conta no total de keystrokes | Reflete esforço real de correção |
| Modo código: espaços e indentação contam | Programadores precisam de precisão em whitespace |
| Modo tradução: penalizar palavras inteiras incorretas opcionalmente | Métrica específica para escritores técnicos |

### 1.5 Modos de Treinamento

```
                    ┌─────────────────────────────────────┐
                    │           CoderKeys Tracks          │
                    └─────────────────────────────────────┘
                                      │
              ┌───────────────────────┼───────────────────────┐
              ▼                       ▼                       ▼
     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
     │  Programadores  │     │ Escritores Téc. │     │  (futuro)       │
     │  track          │     │  track          │     │  Outras tracks  │
     └─────────────────┘     └─────────────────┘     └─────────────────┘
              │                       │
     ┌────────┴────────┐     ┌────────┴────────┐
     │ syntax-drills   │     │ requirements    │
     │ api-snippets    │     │ api-docs        │
     │ shell-commands  │     │ translation     │
     │ shortcuts       │     │ glossaries      │
     └─────────────────┘     └─────────────────┘
```

Cada **track** agrupa **módulos**, que contêm **lições**. Essa hierarquia é refletida na estrutura de pastas em `content/`.

---

## 2. Stack Tecnológica Recomendada

### 2.1 Stack Principal

| Camada | Tecnologia | Versão sugerida | Justificativa |
|--------|-----------|-----------------|---------------|
| **Build** | Vite | 6.x | Dev server instantâneo, HMR, tree-shaking, `import.meta.glob` para descoberta automática de lições |
| **Framework UI** | React | 19.x | Ecossistema massivo, familiaridade da comunidade OSS, excelente suporte a TypeScript |
| **Linguagem** | TypeScript | 5.x | Type-safety para engine e schemas; contratos claros para contribuidores |
| **Estilização** | Tailwind CSS | 4.x | Utility-first, design consistente, fácil para contribuidores ajustarem UI |
| **Roteamento** | React Router | 7.x | Padrão de fato, documentação abundante, loaders para prefetch de lições |
| **Estado global** | Zustand | 5.x | ~1KB, API mínima, sem boilerplate; ideal para estado de sessão ativa |
| **i18n (UI)** | react-i18next + i18next | 24.x / 23.x | Padrão da indústria, pluralização, lazy loading, tipagem via `i18next-resources-for-ts` |
| **Persistência** | Dexie.js | 4.x | Wrapper maduro sobre IndexedDB, migrations, `liveQuery`, bulk operations |
| **Validação** | Zod | 3.x | Schemas para lições, settings e resultados; validação em CI |
| **Testes** | Vitest + Testing Library | — | Mesmo ecossistema Vite, rápido, zero config extra |
| **Lint/Format** | ESLint + Prettier | — | Consistência em PRs da comunidade |
| **Package manager** | pnpm | 9.x | Workspaces para monorepo leve (`packages/engine`, `packages/schemas`) |

### 2.2 Por que React e não Vue?

Ambos atendem aos requisitos. **React é recomendado** porque:

- Maior pool de contribuidores potenciais em projetos OSS de ferramentas dev.
- `react-i18next` e ecossistema de acessibilidade (Radix UI) são mais maduros para o caso de uso.
- A preferência inicial do autor já aponta para React.

> Se a equipe tiver forte preferência por Vue, a arquitetura se mantém idêntica — apenas troca-se a camada UI. O `packages/engine` permanece framework-agnóstico.

### 2.3 Bibliotecas Complementares

| Biblioteca | Uso | Por que não alternativa X |
|-----------|-----|--------------------------|
| **@radix-ui/react-*** | Componentes acessíveis (Dialog, Select, Tabs) | Headless, composable, sem CSS opinativo |
| **clsx + tailwind-merge** | Classes condicionais | Padrão Tailwind |
| **date-fns** | Formatação de datas no histórico | Leve, tree-shakeable (vs moment) |
| **recharts** (Fase 2) | Gráficos de progresso | Declarativo, React-native |
| **@codemirror/view** (Fase 2) | Highlight de código nas lições | Renderização fiel de syntax sem executar código |

### 2.4 O que deliberadamente NÃO usar

| Tecnologia | Motivo da exclusão |
|-----------|-------------------|
| Backend (Node/Express/Fastify) | Requisito de custo zero e execução local |
| Firebase / Supabase | Custo e dependência de nuvem |
| Redux | Boilerplate excessivo para o escopo |
| SQLite WASM + OPFS | Over-engineering para volume de dados de um typing tutor (~500KB de progresso) |
| Next.js | SSR desnecessário; app é 100% client-side |
| Electron | Bundle pesado (~150MB); Tauri é alternativa futura mais leve |

### 2.5 Execução Local — Comandos do Usuário Final

```bash
# Desenvolvimento
git clone https://github.com/<org>/coderkeys.git
cd coderkeys
pnpm install
pnpm dev          # → http://localhost:5173

# Produção local
pnpm build
pnpm preview      # → serve build estático localmente

# (Fase 3) App desktop opcional
pnpm tauri dev
```

### 2.6 Hospedagem Opcional (sem custo)

- **GitHub Pages** ou **Cloudflare Pages** para demo pública — deploy via GitHub Actions no push para `main`.
- O app continua funcionando offline após primeiro carregamento (Service Worker na Fase 2).

---

## 3. Estrutura de Diretórios

### 3.1 Árvore Completa Proposta

```
coderkeys/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── new-lesson.yml          # Template: contribuir lição
│   │   └── new-language.yml        # Template: contribuir idioma
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── workflows/
│       ├── ci.yml                  # lint + test + validate-content
│       └── deploy-demo.yml         # GitHub Pages (opcional)
│
├── apps/
│   └── web/                        # Aplicação principal (Vite + React)
│       ├── public/
│       │   ├── favicon.svg
│       │   └── fonts/              # Fontes monospace para código
│       ├── src/
│       │   ├── app/                # Bootstrap, providers, router
│       │   │   ├── App.tsx
│       │   │   ├── router.tsx
│       │   │   └── providers.tsx
│       │   ├── features/           # Módulos por funcionalidade (vertical slices)
│       │   │   ├── lesson/
│       │   │   │   ├── components/ # LessonView, CharDisplay, KeyboardHints
│       │   │   │   ├── hooks/      # useLessonSession, useTypingInput
│       │   │   │   └── pages/      # LessonPage, LessonCompletePage
│       │   │   ├── dashboard/
│       │   │   │   ├── components/ # StatsCard, ProgressChart, SkillHeatmap
│       │   │   │   └── pages/      # DashboardPage
│       │   │   ├── catalog/
│       │   │   │   ├── components/ # TrackCard, ModuleList, LessonCard
│       │   │   │   └── pages/      # CatalogPage, TrackPage
│       │   │   └── settings/
│       │   │       ├── components/
│       │   │       └── pages/      # SettingsPage
│       │   ├── shared/             # Componentes e utils compartilhados na app
│       │   │   ├── components/     # Button, Card, Layout, Header
│       │   │   └── hooks/          # useMediaQuery, useLocalStorage
│       │   ├── i18n/               # Traduções da INTERFACE (não das lições)
│       │   │   ├── index.ts
│       │   │   └── locales/
│       │   │       ├── en-US/
│       │   │       │   ├── common.json
│       │   │       │   ├── catalog.json
│       │   │       │   ├── lesson.json
│       │   │       │   └── settings.json
│       │   │       └── pt-BR/
│       │   │           └── ... (mesma estrutura)
│       │   ├── db/                 # Camada de persistência (Dexie)
│       │   │   ├── database.ts
│       │   │   ├── migrations.ts
│       │   │   └── repositories/
│       │   │       ├── progress.repo.ts
│       │   │       └── settings.repo.ts
│       │   └── main.tsx
│       ├── index.html
│       ├── vite.config.ts
│       ├── tailwind.config.ts
│       └── package.json
│
├── packages/
│   ├── engine/                     # ⭐ MOTOR PURO (zero dependência de React)
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── session.ts          # Máquina de estados: idle → active → paused → complete
│   │   │   ├── keystroke.ts        # Processamento de input, backspace, skip
│   │   │   ├── metrics/
│   │   │   │   ├── wpm.ts          # Cálculo WPM (live + final)
│   │   │   │   ├── accuracy.ts
│   │   │   │   └── error-analysis.ts  # Hotspots: {}, =>, etc.
│   │   │   ├── diff.ts             # Comparação caractere a caractere
│   │   │   └── types.ts
│   │   ├── tests/
│   │   │   ├── wpm.test.ts
│   │   │   ├── accuracy.test.ts
│   │   │   └── session.test.ts
│   │   └── package.json
│   │
│   └── schemas/                    # ⭐ CONTRATOS ZOD (lições + progresso)
│       ├── src/
│       │   ├── lesson.schema.ts
│       │   ├── manifest.schema.ts
│       │   ├── session-result.schema.ts
│       │   └── index.ts
│       └── package.json
│
├── content/                        # ⭐ CONTEÚDO DAS LIÇÕES (PRs da comunidade)
│   ├── manifest.json               # Índice global de tracks/módulos/lições
│   ├── tracks/
│   │   ├── programmers/
│   │   │   ├── _meta.json          # Metadados do track
│   │   │   ├── en-US/
│   │   │   │   ├── syntax-brackets/
│   │   │   │   │   ├── 001-curly-basics.json
│   │   │   │   │   └── 002-array-brackets.json
│   │   │   │   └── api-snippets/
│   │   │   │       └── 001-fetch-async.json
│   │   │   └── pt-BR/
│   │   │       └── syntax-brackets/
│   │   │           └── 001-chaves-basico.json
│   │   └── technical-writers/
│   │       ├── _meta.json
│   │       ├── en-US/
│   │       │   ├── requirements/
│   │       │   │   └── 001-user-story.json
│   │       │   └── api-docs/
│   │       │       └── 001-endpoint-description.json
│   │       └── pt-BR/
│   │           └── requirements/
│   │               └── 001-historia-usuario.json
│   └── CONTRIBUTING-CONTENT.md     # Guia para contribuidores de conteúdo
│
├── scripts/
│   ├── validate-content.ts         # Valida todos os JSONs contra Zod
│   ├── generate-manifest.ts        # Regenera manifest.json (opcional)
│   └── check-i18n-keys.ts          # Verifica chaves faltantes pt-BR ↔ en-US
│
├── docs/
│   ├── PLANEJAMENTO-ARQUITETURA.md # Este documento
│   ├── METRICS.md                  # Especificação formal de WPM/precisão
│   └── CONTRIBUTING.md
│
├── package.json                    # Root workspace (pnpm)
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── LICENSE
└── README.md
```

### 3.2 Zonas de Responsabilidade para Contribuidores

| Zona | Quem contribui | O que fazem | O que NÃO tocam |
|------|---------------|-------------|-----------------|
| `content/` | **Qualquer pessoa** | Adicionam lições, traduções de conteúdo | Engine, UI |
| `apps/web/src/i18n/` | Tradutores | Traduzem labels da interface | Lógica de negócio |
| `packages/engine/` | Devs experientes | Melhoram métricas, corrigem bugs | Conteúdo |
| `packages/schemas/` | Maintainers | Evoluem contratos de dados | — |
| `apps/web/src/features/` | Devs frontend | Novas telas, UX | Métricas core |

### 3.3 Convenções de Nomenclatura

- **IDs de lição:** `{track}/{module}/{locale}/{filename}` → ex: `programmers/syntax-brackets/en-US/001-curly-basics`
- **Arquivos de lição:** `{ordem}-{slug}.json` com padding de 3 dígitos para ordenação
- **Metadados:** `_meta.json` (prefixo underscore = não é lição)
- **Namespaces i18n:** um arquivo JSON por feature (`catalog.json`, `lesson.json`)

---

## 4. Estrutura de Dados das Lições

### 4.1 Filosofia: JSON como Fonte da Verdade

**Lições em JSON** (não Markdown) para o conteúdo digitável, pelos seguintes motivos:

- Validação estrutural rigorosa via Zod em CI.
- Metadados ricos (skills, dificuldade, tags) sem frontmatter frágil.
- Comparação caractere-a-caractere exige string literal exata — JSON escapa corretamente `\n`, `\t`, `\"`.
- Inspiração comprovada: [Monkeytype](https://github.com/monkeytypegame/monkeytype) usa JSON estático com sucesso em produção.

**Markdown** fica reservado para documentação (`CONTRIBUTING-CONTENT.md`, README de módulos).

### 4.2 Schema: Manifest Global (`content/manifest.json`)

```json
{
  "version": "1.0.0",
  "tracks": [
    {
      "id": "programmers",
      "icon": "code",
      "modules": [
        {
          "id": "syntax-brackets",
          "skills": ["brackets", "symbols"],
          "lessons": {
            "en-US": ["001-curly-basics", "002-array-brackets"],
            "pt-BR": ["001-chaves-basico"]
          }
        }
      ]
    },
    {
      "id": "technical-writers",
      "icon": "document",
      "modules": [
        {
          "id": "requirements",
          "skills": ["user-stories", "acceptance-criteria"],
          "lessons": {
            "en-US": ["001-user-story"],
            "pt-BR": ["001-historia-usuario"]
          }
        }
      ]
    }
  ]
}
```

> O manifest pode ser **gerado automaticamente** pelo script `generate-manifest.ts` varrendo `content/tracks/`, evitando edição manual e dessincronia.

### 4.3 Schema: Metadados do Track (`_meta.json`)

```json
{
  "id": "programmers",
  "name": {
    "en-US": "Programmers",
    "pt-BR": "Programadores"
  },
  "description": {
    "en-US": "Master code syntax, symbols, and IDE shortcuts.",
    "pt-BR": "Domine sintaxe de código, símbolos e atalhos de IDE."
  },
  "defaultModule": "syntax-brackets"
}
```

### 4.4 Schema: Lição Individual (`*.json`)

```json
{
  "$schema": "../../../packages/schemas/lesson.schema.json",
  "id": "001-curly-basics",
  "module": "syntax-brackets",
  "track": "programmers",
  "locale": "en-US",
  "title": "Curly Braces Basics",
  "description": "Practice typing opening and closing curly braces in common patterns.",
  "difficulty": 1,
  "estimatedMinutes": 2,
  "skills": ["curly-braces", "indentation"],
  "tags": ["javascript", "typescript", "symbols"],
  "mode": "code",
  "content": {
    "text": "const obj = { key: 'value' };\nif (true) {\n  console.log('hello');\n}",
    "display": "code",
    "language": "javascript"
  },
  "goals": {
    "minWpm": 30,
    "minAccuracy": 90
  },
  "hints": {
    "keyboard": ["{", "}", "[", "]"],
    "shortcuts": []
  },
  "author": "coderkeys-team",
  "source": null,
  "version": 1
}
```

### 4.5 Campos do Schema — Referência

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | `string` | ✅ | Identificador único dentro do módulo + locale |
| `module` | `string` | ✅ | Referência ao módulo pai |
| `track` | `string` | ✅ | Referência ao track pai |
| `locale` | `"en-US" \| "pt-BR"` | ✅ | BCP-47 do conteúdo digitável |
| `title` | `string` | ✅ | Título exibido (no idioma da lição) |
| `description` | `string` | ✅ | Descrição curta |
| `difficulty` | `1..5` | ✅ | Nível de dificuldade |
| `estimatedMinutes` | `number` | ✅ | Tempo estimado |
| `skills` | `string[]` | ✅ | Skills treinadas (para analytics) |
| `tags` | `string[]` | ❌ | Tags livres para busca |
| `mode` | `"code" \| "prose" \| "translation"` | ✅ | Afeta renderização e métricas |
| `content.text` | `string` | ✅ | Texto exato a ser digitado |
| `content.display` | `"code" \| "prose"` | ✅ | Tipo de renderização |
| `content.language` | `string` | ❌ | Linguagem para highlight (ex: `typescript`) |
| `content.sourceText` | `string` | ❌ | Texto original (modo translation) |
| `goals.minWpm` | `number` | ❌ | Meta de WPM para "passar" |
| `goals.minAccuracy` | `number` | ❌ | Meta de precisão (%) |
| `hints.keyboard` | `string[]` | ❌ | Teclas especiais enfatizadas |
| `hints.shortcuts` | `object[]` | ❌ | Atalhos `{ keys, description }` |
| `author` | `string` | ✅ | Autor ou `@github-username` |
| `source` | `string \| null` | ❌ | Atribuição (livro, docs, etc.) |
| `version` | `number` | ✅ | Versão da lição (incrementar ao editar) |

### 4.6 Modo `translation` — Estrutura Estendida

Para escritores técnicos e tradutores:

```json
{
  "id": "001-historia-usuario",
  "mode": "translation",
  "locale": "pt-BR",
  "content": {
    "text": "Como usuário, eu quero redefinir minha senha para recuperar o acesso à minha conta.",
    "sourceText": "As a user, I want to reset my password so that I can regain access to my account.",
    "display": "prose",
    "language": "pt-BR"
  },
  "goals": {
    "minAccuracy": 95
  }
}
```

A UI exibe o `sourceText` como referência e o usuário digita a tradução em `text`.

### 4.7 Validação em CI

O script `scripts/validate-content.ts` executa:

1. Parse JSON de cada lição.
2. Validação contra `LessonSchema` (Zod).
3. Verificação de unicidade de `id` por módulo + locale.
4. Verificação de que `content.text` não está vazio e tem comprimento mínimo (ex: 20 chars).
5. Verificação de que `locale` corresponde à pasta pai.
6. (Opcional) Detecção de caracteres invisíveis problemáticos (BOM, non-breaking spaces).

```bash
pnpm validate-content   # roda no CI em todo PR que toca content/
```

### 4.8 Fluxo de Contribuição de Conteúdo

```
1. Fork do repositório
2. Criar arquivo em content/tracks/{track}/{locale}/{module}/{id}.json
3. Seguir CONTRIBUTING-CONTENT.md (guidelines de qualidade)
4. Rodar pnpm validate-content localmente
5. Abrir PR → CI valida → Review de conteúdo → Merge
```

**Guidelines de qualidade (resumo):**

| Tipo | Regra |
|------|-------|
| Código | Trechos compiláveis ou plausíveis; sem secrets/credenciais |
| Prosa técnica | Tom profissional; sem conteúdo ofensivo |
| Tradução | Fiel ao sourceText; sem anglicismos desnecessários |
| Comprimento | 50–500 caracteres por lição (ideal: 100–200) |
| Dificuldade | Progressão gradual dentro do módulo |

---

## 5. Roadmap de Implementação

> **Status (2026-06):** Fases 1–3 **concluídas** (PRs [#2](https://github.com/iagommendes/coderkeys/pull/2)–[#4](https://github.com/iagommendes/coderkeys/pull/4)).  
> **Sprint 4 em andamento:** deploy GitHub Pages, code splitting, Lighthouse CI, desktop multi-OS.  
> Melhorias futuras: issues [#6](https://github.com/iagommendes/coderkeys/issues/6)–[#24](https://github.com/iagommendes/coderkeys/issues/24).

### Visão Geral das Fases

```
Fase 1 — Fundação          Fase 2 — Experiência        Fase 3 — Comunidade
(MVP funcional)             (polish + features)          (escala + desktop)
     │                            │                            │
     ├─ Engine + métricas         ├─ Dashboard                 ├─ Tauri desktop
     ├─ UI básica de lição        ├─ Gráficos de progresso     ├─ Temas customizáveis
     ├─ 2 tracks, 2 idiomas       ├─ Modo translation          ├─ Plugin de lições
     ├─ Persistência IDB          ├─ Export/import progresso     ├─ PWA offline
     └─ 10+ lições seed           ├─ Error heatmap             └─ Contribuição automatizada
                                  └─ Service Worker
```

---

### Fase 1 — Fundação (MVP) ✅ Concluída

**Objetivo:** Aplicação funcional que roda localmente, com uma lição jogável ponta a ponta e progresso persistido.

#### 1.1 Setup do Monorepo

- [ ] Inicializar workspace pnpm (`apps/web`, `packages/engine`, `packages/schemas`)
- [ ] Configurar TypeScript project references
- [ ] Configurar ESLint + Prettier + Vitest
- [ ] Configurar Tailwind CSS 4 no `apps/web`
- [ ] README com instruções de `pnpm install && pnpm dev`

#### 1.2 Typing Engine (`packages/engine`)

- [ ] Definir tipos: `SessionState`, `KeystrokeEvent`, `SessionResult`
- [ ] Implementar máquina de estados: `idle → ready → active → complete`
- [ ] Implementar processamento de keystrokes (incluindo backspace)
- [ ] Implementar `diff.ts` — comparação caractere a caractere
- [ ] Implementar `wpm.ts` — WPM final e WPM ao vivo (janela 5s)
- [ ] Implementar `accuracy.ts`
- [ ] Testes unitários com cobertura > 90% no engine

#### 1.3 Schemas (`packages/schemas`)

- [ ] `LessonSchema` com todos os campos da seção 4
- [ ] `ManifestSchema`
- [ ] `SessionResultSchema`
- [ ] Exportar tipos TypeScript inferidos dos schemas

#### 1.4 Persistência

- [ ] Configurar Dexie com tabelas: `settings`, `lessonProgress`, `sessions`
- [ ] Implementar `settings.repo.ts` (get/set locale, theme)
- [ ] Implementar `progress.repo.ts` (save session, get best scores)
- [ ] Migration v1 inicial

#### 1.5 UI — Fluxo Principal

- [ ] Layout base (Header, navegação, footer com link GitHub)
- [ ] Página de catálogo: listar tracks e módulos
- [ ] Página de lição:
  - Display de caracteres (verde/vermelho/cursor)
  - Input invisível capturando keystrokes
  - Timer e WPM/accuracy ao vivo
  - Tela de resultados ao completar
- [ ] Integrar engine ↔ UI via Zustand store
- [ ] Página de configurações: troca de idioma UI (pt-BR / en-US)

#### 1.6 i18n

- [ ] Configurar react-i18next com namespaces
- [ ] Criar traduções `en-US` e `pt-BR` para UI (common, catalog, lesson, settings)
- [ ] Script `check-i18n-keys.ts` no CI

#### 1.7 Conteúdo Seed

- [ ] Track `programmers` / módulo `syntax-brackets`: 5 lições en-US + 5 pt-BR
- [ ] Track `technical-writers` / módulo `requirements`: 5 lições en-US + 5 pt-BR
- [ ] `manifest.json` e `_meta.json` dos tracks
- [ ] Script `validate-content.ts` integrado ao CI

#### 1.8 CI/CD Básico

- [ ] Workflow: lint → typecheck → test → validate-content
- [ ] Badge de CI no README

**Critério de conclusão da Fase 1:**
> Um usuário clona o repo, roda `pnpm dev`, seleciona uma lição, digita o texto, vê WPM/precisão ao final, fecha o navegador, reabre, e o progresso está salvo.

---

### Fase 2 — Experiência e Retenção ✅ Concluída

**Objetivo:** Transformar o MVP em uma ferramenta de treino que o usuário quer usar diariamente.

#### 2.1 Dashboard de Progresso

- [ ] Página com resumo: WPM médio, precisão, streak de dias
- [ ] Gráfico de evolução de WPM (recharts) — últimos 7/30 dias
- [ ] Lista de lições com status (não iniciada / em progresso / completa / melhor score)
- [ ] Filtro por track, módulo e skill

#### 2.2 Análise de Erros

- [ ] `error-analysis.ts` no engine: mapear posições de erro por caractere
- [ ] Heatmap de teclas problemáticas (ex: `{`, `}`, `=>`, `;`)
- [ ] Sugestão automática de lições baseada em weak spots

#### 2.3 Modo Translation

- [ ] UI split: sourceText (readonly) + área de digitação
- [ ] Métricas adaptadas (precisão por palavra opcional)
- [ ] 10 lições de tradução pt-BR ↔ en-US

#### 2.4 Renderização de Código

- [ ] Integrar CodeMirror (view-only) para highlight de syntax
- [ ] Suporte a `content.language` para temas de highlight
- [ ] Preservar indentação visual (tabs vs spaces)

#### 2.5 UX Avançada

- [ ] Atalhos de teclado (Esc = pausar, Ctrl+Enter = reiniciar)
- [ ] Animação de transição entre caracteres
- [ ] Modo "strict" (erro bloqueia avanço) vs "flexible" (permite corrigir)
- [ ] Sons opcionais de keystroke (mute por padrão)
- [ ] Tema claro/escuro

#### 2.6 Dados e Backup

- [ ] Export de progresso para JSON (download)
- [ ] Import de progresso de JSON (upload)
- [ ] Reset de progresso por track ou global

#### 2.7 PWA / Offline

- [ ] Service Worker via `vite-plugin-pwa`
- [ ] Cache de lições e assets para uso offline
- [ ] Manifest.json para "instalar" no desktop

**Critério de conclusão da Fase 2:**
> Usuário acompanha evolução no dashboard, recebe sugestões de lições baseadas em erros, e usa o app offline.

---

### Fase 3 — Comunidade e Escala ✅ Concluída

**Objetivo:** Infraestrutura para o projeto crescer organicamente via contribuições.

**Pendências movidas para Sprint 4:** Lighthouse CI, desktop macOS/Windows, lições es-ES em conteúdo.

#### 3.1 App Desktop (Tauri)

- [ ] Integrar Tauri 2.x como wrapper do build Vite
- [ ] Build para Linux, macOS, Windows via GitHub Actions
- [ ] Ícone e identidade visual

#### 3.2 Sistema de Temas

- [ ] Schema de tema (cores, fontes, cursor)
- [ ] 3 temas built-in + instruções para contribuidores criarem temas
- [ ] Inspiração: modelo de temas do Monkeytype

#### 3.3 Contribuição Automatizada

- [ ] GitHub Issue Forms para nova lição e novo idioma
- [ ] PR template com checklist de conteúdo
- [ ] Bot de CI que comenta no PR com preview do conteúdo renderizado
- [ ] `CONTRIBUTING.md` e `CONTRIBUTING-CONTENT.md` completos

#### 3.4 Novos Tracks (comunidade)

- [ ] Track `devops` (Docker, kubectl, terraform)
- [ ] Track `data-science` (Python, SQL, pandas)
- [ ] Track `legal-translators` (vocabulário jurídico bilíngue)
- [ ] Documentar processo para propor novo track

#### 3.5 Internacionalização Expandida

- [ ] Suporte a `es-ES` como terceiro idioma (validar arquitetura)
- [ ] Documentar como adicionar novo locale (UI + content)
- [ ] RTL readiness (preparar CSS, não implementar ainda)

#### 3.6 Performance e Qualidade

- [ ] Lighthouse score > 95 em Performance e Accessibility
- [ ] Testes E2E com Playwright (fluxo completo de lição)
- [ ] Benchmark do engine (meta: < 1ms por keystroke)

**Critério de conclusão da Fase 3:** ✅ Atendido
> Projeto pronto para anunciar como open source, com documentação de contribuição, app desktop, e pelo menos 50 lições em 2 idiomas.

### Fase 4 — Polish & Launch (Sprint 4, em andamento)

- [ ] GitHub Pages deploy
- [ ] Code splitting e bundle otimizado
- [ ] Lighthouse CI (Performance ≥ 90, Accessibility ≥ 95)
- [ ] Desktop builds Linux + macOS + Windows
- [ ] Documentação atualizada

---

## 6. Apêndices

### A. Diagrama de Estados da Sessão

```
                    ┌──────────┐
                    │   idle   │
                    └────┬─────┘
                         │ select lesson
                         ▼
                    ┌──────────┐
              ┌────│  ready   │──── countdown (opcional)
              │    └────┬─────┘
              │         │ first keystroke
              │         ▼
              │    ┌──────────┐
              │    │  active  │◀─────┐
              │    └────┬─────┘      │
              │         │            │ resume
              │    ┌────┴─────┐      │
              │    │          │      │
              │    ▼          ▼      │
              │ ┌──────┐ ┌────────┐  │
              │ │paused│ │complete│  │
              │ └──┬───┘ └────────┘  │
              │    │                 │
              │    └─────────────────┘
              │
              └──── reset / exit
```

### B. Modelo de Dados — IndexedDB

```typescript
// Tabelas Dexie (referência, não é código de implementação)

interface UserSettings {
  id: 'default';
  uiLocale: 'en-US' | 'pt-BR';
  theme: 'light' | 'dark' | 'system';
  strictMode: boolean;
  soundEnabled: boolean;
}

interface LessonProgress {
  lessonId: string;          // PK: "{track}/{module}/{locale}/{id}"
  track: string;
  module: string;
  bestWpm: number;
  bestAccuracy: number;
  bestAwpm: number;
  attempts: number;
  completed: boolean;
  lastPlayedAt: string;      // ISO 8601
}

interface SessionResult {
  id: string;                // UUID
  lessonId: string;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  awpm: number;
  durationMs: number;
  errorPositions: number[];
  errorChars: string[];
  completedAt: string;
}
```

### C. Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Lições com caracteres especiais quebram o diff | Alto | Validação CI + testes com trechos reais de código |
| IndexedDB limpo pelo browser (Safari ITP) | Médio | Export/import de progresso (Fase 2) |
| Contribuidores enviam conteúdo com licença inadequada | Médio | CLA ou licença CC0 para `content/`; review manual |
| Escopo cresce demais na Fase 1 | Alto | Critério de conclusão claro; resistir a feature creep |
| Layout de teclado ABNT vs US afeta métricas | Baixo | Documentar layout assumido; setting de layout (Fase 2) |

### D. Referências

- [Monkeytype — Static Content Architecture](https://github.com/monkeytypegame/monkeytype) — modelo de lições JSON
- [Local-First Web Development (Smashing Magazine, 2026)](https://www.smashingmagazine.com/2026/05/architecture-local-first-web-development/) — princípios de persistência local
- [Dexie.js Documentation](https://dexie.org/) — IndexedDB wrapper
- [react-i18next TypeScript Guide](https://react.i18next.com/latest/typescript) — i18n tipado
- [WPM Calculation Best Practices](https://dev.to/clackpit_dev/how-i-calculate-wpm-in-real-time-and-why-most-typing-sites-get-the-math-wrong-4c92) — janela deslizante e timing

### E. Nome e Identidade

| Item | Valor |
|------|-------|
| Nome do projeto | **CoderKeys** |
| Repositório | `coderkeys` |
| Público-alvo primário | Desenvolvedores e escritores técnicos bilíngues (pt-BR / en-US) |
| Licença código | MIT (já presente no repositório) |
| Licença conteúdo | CC0 ou MIT (definir antes da Fase 3) |

---

## Próximos Passos

Após aprovação deste plano:

1. Criar branch `cursor/setup-monorepo-8eb5` e executar itens **1.1** a **1.3** da Fase 1.
2. Implementar o engine com testes antes de qualquer UI (TDD).
3. Criar 2 lições "hello world" (uma code, uma prose) para validar o pipeline de conteúdo.
4. Iterar na UI da lição até o fluxo completo funcionar.

---

*Documento gerado para revisão. Ajustes são esperados antes do início da implementação.*
