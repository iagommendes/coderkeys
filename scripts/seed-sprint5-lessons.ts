/**
 * Generates Sprint 5 content:
 * - Lessons 006–010 for all modules (en-US + pt-BR)
 * - Lessons 001–010 for programmers + technical-writers (es-ES)
 * Run: pnpm exec tsx scripts/seed-sprint5-lessons.ts
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.join(__dirname, '../content');
const tracksDir = path.join(contentDir, 'tracks');

type Locale = 'en-US' | 'pt-BR' | 'es-ES';
type LessonMode = 'code' | 'prose' | 'translation';

interface LessonDef {
  id: string;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  difficulty: number;
  skills: string[];
  mode: LessonMode;
  text: Record<Locale, string>;
  display: 'code' | 'prose';
  language?: string;
  sourceText?: Record<Locale, string>;
}

interface ModuleDef {
  track: string;
  module: string;
  lessons: LessonDef[];
}

function lessonPath(track: string, locale: Locale, module: string, id: string) {
  return path.join(tracksDir, track, locale, module, `${id}.json`);
}

async function writeLesson(
  track: string,
  module: string,
  locale: Locale,
  def: LessonDef,
) {
  const dir = path.join(tracksDir, track, locale, module);
  await mkdir(dir, { recursive: true });

  const content: Record<string, unknown> = {
    text: def.text[locale],
    display: def.display,
  };
  if (def.language) content.language = def.language;
  if (def.mode === 'translation' && def.sourceText) {
    content.sourceText = def.sourceText[locale];
  }

  const lesson = {
    id: def.id,
    module,
    track,
    locale,
    title: def.title[locale],
    description: def.description[locale],
    difficulty: def.difficulty,
    estimatedMinutes: def.difficulty + 1,
    skills: def.skills,
    mode: def.mode,
    content,
    goals: { minWpm: 20 + def.difficulty * 5, minAccuracy: 88 },
    author: 'coderkeys-team',
    source: null,
    version: 1,
  };

  await writeFile(lessonPath(track, locale, module, def.id), JSON.stringify(lesson, null, 2) + '\n');
}

const expansionLessons: ModuleDef[] = [
  {
    track: 'programmers',
    module: 'syntax-brackets',
    lessons: [
      {
        id: '006-destructuring',
        title: { 'en-US': 'Nested Destructuring', 'pt-BR': 'Desestruturação Aninhada', 'es-ES': 'Desestructuración anidada' },
        description: {
          'en-US': 'Practice nested object and array destructuring.',
          'pt-BR': 'Pratique desestruturação aninhada de objetos e arrays.',
          'es-ES': 'Practica desestructuración anidada de objetos y arrays.',
        },
        difficulty: 3,
        skills: ['destructuring', 'objects'],
        mode: 'code',
        display: 'code',
        language: 'javascript',
        text: {
          'en-US': "const { user: { name, address: { city } } } = payload;\nconsole.log(name, city);",
          'pt-BR': "const { user: { name, address: { city } } } = payload;\nconsole.log(name, city);",
          'es-ES': "const { user: { name, address: { city } } } = payload;\nconsole.log(name, city);",
        },
      },
      {
        id: '007-optional-chaining',
        title: { 'en-US': 'Optional Chaining', 'pt-BR': 'Optional Chaining', 'es-ES': 'Encadenamiento opcional' },
        description: {
          'en-US': 'Type optional chaining and nullish coalescing patterns.',
          'pt-BR': 'Digite optional chaining e nullish coalescing.',
          'es-ES': 'Escribe encadenamiento opcional y coalescencia nula.',
        },
        difficulty: 3,
        skills: ['optional-chaining', 'operators'],
        mode: 'code',
        display: 'code',
        language: 'typescript',
        text: {
          'en-US': "const label = config?.ui?.theme?.name ?? 'default';\nreturn label.toUpperCase();",
          'pt-BR': "const label = config?.ui?.theme?.name ?? 'default';\nreturn label.toUpperCase();",
          'es-ES': "const label = config?.ui?.theme?.name ?? 'default';\nreturn label.toUpperCase();",
        },
      },
      {
        id: '008-spread-rest',
        title: { 'en-US': 'Spread and Rest', 'pt-BR': 'Spread e Rest', 'es-ES': 'Spread y rest' },
        description: {
          'en-US': 'Practice spread in arrays and object merges.',
          'pt-BR': 'Pratique spread em arrays e merge de objetos.',
          'es-ES': 'Practica spread en arrays y fusión de objetos.',
        },
        difficulty: 3,
        skills: ['spread', 'rest'],
        mode: 'code',
        display: 'code',
        language: 'javascript',
        text: {
          'en-US': 'const merged = { ...defaults, ...overrides, version: 2 };\nconst all = [...items, ...extras];',
          'pt-BR': 'const merged = { ...defaults, ...overrides, version: 2 };\nconst all = [...items, ...extras];',
          'es-ES': 'const merged = { ...defaults, ...overrides, version: 2 };\nconst all = [...items, ...extras];',
        },
      },
      {
        id: '009-regex-literals',
        title: { 'en-US': 'Regex Literals', 'pt-BR': 'Literais Regex', 'es-ES': 'Literales regex' },
        description: {
          'en-US': 'Type common regular expression patterns.',
          'pt-BR': 'Digite padrões comuns de expressões regulares.',
          'es-ES': 'Escribe patrones comunes de expresiones regulares.',
        },
        difficulty: 4,
        skills: ['regex', 'patterns'],
        mode: 'code',
        display: 'code',
        language: 'javascript',
        text: {
          'en-US': "const email = /^[\\w.-]+@[\\w.-]+\\.\\w{2,}$/;\nconst slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;",
          'pt-BR': "const email = /^[\\w.-]+@[\\w.-]+\\.\\w{2,}$/;\nconst slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;",
          'es-ES': "const email = /^[\\w.-]+@[\\w.-]+\\.\\w{2,}$/;\nconst slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;",
        },
      },
      {
        id: '010-generics',
        title: { 'en-US': 'TypeScript Generics', 'pt-BR': 'Generics em TypeScript', 'es-ES': 'Genéricos en TypeScript' },
        description: {
          'en-US': 'Practice generic function and interface syntax.',
          'pt-BR': 'Pratique sintaxe de funções e interfaces genéricas.',
          'es-ES': 'Practica sintaxis de funciones e interfaces genéricas.',
        },
        difficulty: 4,
        skills: ['generics', 'typescript'],
        mode: 'code',
        display: 'code',
        language: 'typescript',
        text: {
          'en-US': 'function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {\n  return keys.reduce((acc, k) => ({ ...acc, [k]: obj[k] }), {} as Pick<T, K>);\n}',
          'pt-BR': 'function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {\n  return keys.reduce((acc, k) => ({ ...acc, [k]: obj[k] }), {} as Pick<T, K>);\n}',
          'es-ES': 'function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {\n  return keys.reduce((acc, k) => ({ ...acc, [k]: obj[k] }), {} as Pick<T, K>);\n}',
        },
      },
    ],
  },
  {
    track: 'technical-writers',
    module: 'requirements',
    lessons: [
      {
        id: '006-performance-req',
        title: { 'en-US': 'Performance Requirement', 'pt-BR': 'Requisito de Performance', 'es-ES': 'Requisito de rendimiento' },
        description: {
          'en-US': 'Write a performance acceptance requirement.',
          'pt-BR': 'Escreva um requisito de aceite de performance.',
          'es-ES': 'Escribe un requisito de aceptación de rendimiento.',
        },
        difficulty: 3,
        skills: ['performance', 'requirements'],
        mode: 'prose',
        display: 'prose',
        text: {
          'en-US': 'The search endpoint must return results within 200ms for 95% of requests under normal load.',
          'pt-BR': 'O endpoint de busca deve retornar resultados em até 200ms para 95% das requisições sob carga normal.',
          'es-ES': 'El endpoint de búsqueda debe devolver resultados en 200 ms para el 95% de las solicitudes bajo carga normal.',
        },
      },
      {
        id: '007-security-req',
        title: { 'en-US': 'Security Requirement', 'pt-BR': 'Requisito de Segurança', 'es-ES': 'Requisito de seguridad' },
        description: {
          'en-US': 'Document a security-related requirement.',
          'pt-BR': 'Documente um requisito relacionado à segurança.',
          'es-ES': 'Documenta un requisito relacionado con la seguridad.',
        },
        difficulty: 3,
        skills: ['security', 'requirements'],
        mode: 'prose',
        display: 'prose',
        text: {
          'en-US': 'All API tokens must expire after 24 hours and support immediate revocation by administrators.',
          'pt-BR': 'Todos os tokens de API devem expirar após 24 horas e suportar revogação imediata por administradores.',
          'es-ES': 'Todos los tokens de API deben expirar tras 24 horas y permitir revocación inmediata por administradores.',
        },
      },
      {
        id: '008-compliance-req',
        title: { 'en-US': 'Compliance Requirement', 'pt-BR': 'Requisito de Conformidade', 'es-ES': 'Requisito de cumplimiento' },
        description: {
          'en-US': 'Practice compliance-oriented requirement writing.',
          'pt-BR': 'Pratique redação de requisitos orientados à conformidade.',
          'es-ES': 'Practica redacción de requisitos orientados al cumplimiento.',
        },
        difficulty: 4,
        skills: ['compliance', 'requirements'],
        mode: 'prose',
        display: 'prose',
        text: {
          'en-US': 'Personal data must be stored in the EU region and deleted within 30 days of account closure.',
          'pt-BR': 'Dados pessoais devem ser armazenados na região da UE e excluídos em até 30 dias após encerramento da conta.',
          'es-ES': 'Los datos personales deben almacenarse en la región de la UE y eliminarse en 30 días tras el cierre de cuenta.',
        },
      },
      {
        id: '009-migration-req',
        title: { 'en-US': 'Migration Requirement', 'pt-BR': 'Requisito de Migração', 'es-ES': 'Requisito de migración' },
        description: {
          'en-US': 'Describe a data migration requirement.',
          'pt-BR': 'Descreva um requisito de migração de dados.',
          'es-ES': 'Describe un requisito de migración de datos.',
        },
        difficulty: 3,
        skills: ['migration', 'requirements'],
        mode: 'prose',
        display: 'prose',
        text: {
          'en-US': 'Legacy customer records must be migrated with zero data loss and a rollback plan validated in staging.',
          'pt-BR': 'Registros legados de clientes devem ser migrados sem perda de dados e com plano de rollback validado em staging.',
          'es-ES': 'Los registros heredados deben migrarse sin pérdida de datos y con plan de reversión validado en staging.',
        },
      },
      {
        id: '010-observability-req',
        title: { 'en-US': 'Observability Requirement', 'pt-BR': 'Requisito de Observabilidade', 'es-ES': 'Requisito de observabilidad' },
        description: {
          'en-US': 'Write observability requirements for production services.',
          'pt-BR': 'Escreva requisitos de observabilidade para serviços em produção.',
          'es-ES': 'Escribe requisitos de observabilidad para servicios en producción.',
        },
        difficulty: 4,
        skills: ['observability', 'requirements'],
        mode: 'prose',
        display: 'prose',
        text: {
          'en-US': 'Each service must expose health, readiness, and latency metrics with alert thresholds documented in the runbook.',
          'pt-BR': 'Cada serviço deve expor métricas de health, readiness e latência com limiares de alerta documentados no runbook.',
          'es-ES': 'Cada servicio debe exponer métricas de salud, readiness y latencia con umbrales de alerta documentados en el runbook.',
        },
      },
    ],
  },
  {
    track: 'technical-writers',
    module: 'translation',
    lessons: [
      {
        id: '006-rate-limit-msg',
        title: { 'en-US': 'Rate Limit Message', 'pt-BR': 'Mensagem de Rate Limit', 'es-ES': 'Mensaje de límite de tasa' },
        description: { 'en-US': 'Translate a rate limit error.', 'pt-BR': 'Traduza um erro de rate limit.', 'es-ES': 'Traduce un error de límite de tasa.' },
        difficulty: 3,
        skills: ['translation', 'errors'],
        mode: 'translation',
        display: 'prose',
        text: {
          'en-US': 'You have exceeded the request limit. Please wait a minute and try again.',
          'pt-BR': 'Você excedeu o limite de requisições. Aguarde um minuto e tente novamente.',
          'es-ES': 'Has superado el límite de solicitudes. Espera un minuto e inténtalo de nuevo.',
        },
        sourceText: {
          'en-US': 'Você excedeu o limite de requisições. Aguarde um minuto e tente novamente.',
          'pt-BR': 'You have exceeded the request limit. Please wait a minute and try again.',
          'es-ES': 'Você excedeu o limite de requisições. Aguarde um minuto e tente novamente.',
        },
      },
      {
        id: '007-maintenance-notice',
        title: { 'en-US': 'Maintenance Notice', 'pt-BR': 'Aviso de Manutenção', 'es-ES': 'Aviso de mantenimiento' },
        description: { 'en-US': 'Translate a maintenance window notice.', 'pt-BR': 'Traduza um aviso de janela de manutenção.', 'es-ES': 'Traduce un aviso de ventana de mantenimiento.' },
        difficulty: 3,
        skills: ['translation', 'notifications'],
        mode: 'translation',
        display: 'prose',
        text: {
          'en-US': 'Scheduled maintenance will occur on Sunday from 02:00 to 04:00 UTC.',
          'pt-BR': 'Manutenção programada ocorrerá no domingo das 02:00 às 04:00 UTC.',
          'es-ES': 'El mantenimiento programado será el domingo de 02:00 a 04:00 UTC.',
        },
        sourceText: {
          'en-US': 'Manutenção programada ocorrerá no domingo das 02:00 às 04:00 UTC.',
          'pt-BR': 'Scheduled maintenance will occur on Sunday from 02:00 to 04:00 UTC.',
          'es-ES': 'Manutenção programada ocorrerá no domingo das 02:00 às 04:00 UTC.',
        },
      },
      {
        id: '008-api-deprecation',
        title: { 'en-US': 'API Deprecation', 'pt-BR': 'Depreciação de API', 'es-ES': 'Deprecación de API' },
        description: { 'en-US': 'Translate API deprecation messaging.', 'pt-BR': 'Traduza mensagem de depreciação de API.', 'es-ES': 'Traduce mensaje de deprecación de API.' },
        difficulty: 4,
        skills: ['translation', 'api-docs'],
        mode: 'translation',
        display: 'prose',
        text: {
          'en-US': 'This endpoint is deprecated and will be removed on 2026-12-01. Migrate to /v2/users.',
          'pt-BR': 'Este endpoint está obsoleto e será removido em 2026-12-01. Migre para /v2/users.',
          'es-ES': 'Este endpoint está obsoleto y se eliminará el 2026-12-01. Migra a /v2/users.',
        },
        sourceText: {
          'en-US': 'Este endpoint está obsoleto e será removido em 2026-12-01. Migre para /v2/users.',
          'pt-BR': 'This endpoint is deprecated and will be removed on 2026-12-01. Migrate to /v2/users.',
          'es-ES': 'Este endpoint está obsoleto e será removido em 2026-12-01. Migre para /v2/users.',
        },
      },
      {
        id: '009-support-reply',
        title: { 'en-US': 'Support Reply', 'pt-BR': 'Resposta de Suporte', 'es-ES': 'Respuesta de soporte' },
        description: { 'en-US': 'Translate a support ticket reply.', 'pt-BR': 'Traduza uma resposta de ticket de suporte.', 'es-ES': 'Traduce una respuesta de ticket de soporte.' },
        difficulty: 3,
        skills: ['translation', 'support'],
        mode: 'translation',
        display: 'prose',
        text: {
          'en-US': 'We reproduced the issue and deployed a fix. Please clear your cache and confirm.',
          'pt-BR': 'Reproduzimos o problema e implantamos uma correção. Limpe o cache e confirme.',
          'es-ES': 'Reprodujimos el problema y desplegamos una corrección. Borra la caché y confirma.',
        },
        sourceText: {
          'en-US': 'Reproduzimos o problema e implantamos uma correção. Limpe o cache e confirme.',
          'pt-BR': 'We reproduced the issue and deployed a fix. Please clear your cache and confirm.',
          'es-ES': 'Reproduzimos o problema e implantamos uma correção. Limpe o cache e confirme.',
        },
      },
      {
        id: '010-release-notes',
        title: { 'en-US': 'Release Notes', 'pt-BR': 'Notas de Release', 'es-ES': 'Notas de versión' },
        description: { 'en-US': 'Translate a short release note.', 'pt-BR': 'Traduza uma nota de release curta.', 'es-ES': 'Traduce una nota de versión corta.' },
        difficulty: 4,
        skills: ['translation', 'release-notes'],
        mode: 'translation',
        display: 'prose',
        text: {
          'en-US': 'Version 2.4 adds dark mode, improves export performance, and fixes session timeout bugs.',
          'pt-BR': 'A versão 2.4 adiciona modo escuro, melhora performance de exportação e corrige bugs de timeout de sessão.',
          'es-ES': 'La versión 2.4 añade modo oscuro, mejora el rendimiento de exportación y corrige errores de timeout de sesión.',
        },
        sourceText: {
          'en-US': 'A versão 2.4 adiciona modo escuro, melhora performance de exportação e corrige bugs de timeout de sessão.',
          'pt-BR': 'Version 2.4 adds dark mode, improves export performance, and fixes session timeout bugs.',
          'es-ES': 'A versão 2.4 adiciona modo escuro, melhora performance de exportação e corrige bugs de timeout de sessão.',
        },
      },
    ],
  },
  {
    track: 'devops',
    module: 'docker-cli',
    lessons: [
      {
        id: '006-docker-build',
        title: { 'en-US': 'Docker Build', 'pt-BR': 'Docker Build', 'es-ES': 'Docker Build' },
        description: { 'en-US': 'Practice docker build with tags.', 'pt-BR': 'Pratique docker build com tags.', 'es-ES': 'Practica docker build con tags.' },
        difficulty: 3,
        skills: ['docker', 'build'],
        mode: 'code',
        display: 'code',
        language: 'bash',
        text: {
          'en-US': 'docker build -t myapp:1.2.0 -f Dockerfile.prod .\ndocker image ls myapp',
          'pt-BR': 'docker build -t myapp:1.2.0 -f Dockerfile.prod .\ndocker image ls myapp',
          'es-ES': 'docker build -t myapp:1.2.0 -f Dockerfile.prod .\ndocker image ls myapp',
        },
      },
      {
        id: '007-kubectl-apply',
        title: { 'en-US': 'Kubectl Apply', 'pt-BR': 'Kubectl Apply', 'es-ES': 'Kubectl Apply' },
        description: { 'en-US': 'Apply Kubernetes manifests from files.', 'pt-BR': 'Aplique manifests Kubernetes de arquivos.', 'es-ES': 'Aplica manifiestos de Kubernetes desde archivos.' },
        difficulty: 3,
        skills: ['kubernetes', 'yaml'],
        mode: 'code',
        display: 'code',
        language: 'bash',
        text: {
          'en-US': 'kubectl apply -f k8s/deployment.yaml\nkubectl rollout status deployment/api',
          'pt-BR': 'kubectl apply -f k8s/deployment.yaml\nkubectl rollout status deployment/api',
          'es-ES': 'kubectl apply -f k8s/deployment.yaml\nkubectl rollout status deployment/api',
        },
      },
      {
        id: '008-helm-install',
        title: { 'en-US': 'Helm Install', 'pt-BR': 'Helm Install', 'es-ES': 'Helm Install' },
        description: { 'en-US': 'Type helm chart install commands.', 'pt-BR': 'Digite comandos de instalação de chart helm.', 'es-ES': 'Escribe comandos de instalación de chart helm.' },
        difficulty: 4,
        skills: ['helm', 'kubernetes'],
        mode: 'code',
        display: 'code',
        language: 'bash',
        text: {
          'en-US': 'helm upgrade --install api ./charts/api -n production --set image.tag=2.1.0',
          'pt-BR': 'helm upgrade --install api ./charts/api -n production --set image.tag=2.1.0',
          'es-ES': 'helm upgrade --install api ./charts/api -n production --set image.tag=2.1.0',
        },
      },
      {
        id: '009-ansible-playbook',
        title: { 'en-US': 'Ansible Playbook', 'pt-BR': 'Playbook Ansible', 'es-ES': 'Playbook Ansible' },
        description: { 'en-US': 'Run ansible playbooks for provisioning.', 'pt-BR': 'Execute playbooks ansible para provisionamento.', 'es-ES': 'Ejecuta playbooks de Ansible para aprovisionamiento.' },
        difficulty: 3,
        skills: ['ansible', 'automation'],
        mode: 'code',
        display: 'code',
        language: 'bash',
        text: {
          'en-US': 'ansible-playbook -i inventory/prod site.yml --tags deploy --check',
          'pt-BR': 'ansible-playbook -i inventory/prod site.yml --tags deploy --check',
          'es-ES': 'ansible-playbook -i inventory/prod site.yml --tags deploy --check',
        },
      },
      {
        id: '010-journalctl',
        title: { 'en-US': 'Journalctl Logs', 'pt-BR': 'Logs com Journalctl', 'es-ES': 'Logs con journalctl' },
        description: { 'en-US': 'Inspect systemd service logs.', 'pt-BR': 'Inspecione logs de serviços systemd.', 'es-ES': 'Inspecciona logs de servicios systemd.' },
        difficulty: 3,
        skills: ['systemd', 'logs'],
        mode: 'code',
        display: 'code',
        language: 'bash',
        text: {
          'en-US': 'journalctl -u api.service -f --since "10 min ago" | grep ERROR',
          'pt-BR': 'journalctl -u api.service -f --since "10 min ago" | grep ERROR',
          'es-ES': 'journalctl -u api.service -f --since "10 min ago" | grep ERROR',
        },
      },
    ],
  },
  {
    track: 'data-science',
    module: 'python-sql',
    lessons: [
      {
        id: '006-groupby-agg',
        title: { 'en-US': 'Pandas GroupBy', 'pt-BR': 'Pandas GroupBy', 'es-ES': 'Pandas GroupBy' },
        description: { 'en-US': 'Practice groupby aggregations in pandas.', 'pt-BR': 'Pratique agregações groupby no pandas.', 'es-ES': 'Practica agregaciones groupby en pandas.' },
        difficulty: 3,
        skills: ['pandas', 'aggregation'],
        mode: 'code',
        display: 'code',
        language: 'python',
        text: {
          'en-US': "df.groupby('region')['revenue'].agg(['sum', 'mean', 'count'])",
          'pt-BR': "df.groupby('region')['revenue'].agg(['sum', 'mean', 'count'])",
          'es-ES': "df.groupby('region')['revenue'].agg(['sum', 'mean', 'count'])",
        },
      },
      {
        id: '007-sql-join',
        title: { 'en-US': 'SQL Join', 'pt-BR': 'Join em SQL', 'es-ES': 'Join en SQL' },
        description: { 'en-US': 'Type a multi-table SQL join query.', 'pt-BR': 'Digite uma query SQL com join entre tabelas.', 'es-ES': 'Escribe una consulta SQL con join entre tablas.' },
        difficulty: 3,
        skills: ['sql', 'joins'],
        mode: 'code',
        display: 'code',
        language: 'sql',
        text: {
          'en-US': 'SELECT u.name, o.total FROM users u\nINNER JOIN orders o ON o.user_id = u.id;',
          'pt-BR': 'SELECT u.name, o.total FROM users u\nINNER JOIN orders o ON o.user_id = u.id;',
          'es-ES': 'SELECT u.name, o.total FROM users u\nINNER JOIN orders o ON o.user_id = u.id;',
        },
      },
      {
        id: '008-pandas-merge',
        title: { 'en-US': 'Pandas Merge', 'pt-BR': 'Merge no Pandas', 'es-ES': 'Merge en Pandas' },
        description: { 'en-US': 'Merge DataFrames on keys.', 'pt-BR': 'Faça merge de DataFrames por chaves.', 'es-ES': 'Combina DataFrames por claves.' },
        difficulty: 4,
        skills: ['pandas', 'merge'],
        mode: 'code',
        display: 'code',
        language: 'python',
        text: {
          'en-US': "merged = users.merge(orders, on='user_id', how='left', validate='one_to_many')",
          'pt-BR': "merged = users.merge(orders, on='user_id', how='left', validate='one_to_many')",
          'es-ES': "merged = users.merge(orders, on='user_id', how='left', validate='one_to_many')",
        },
      },
      {
        id: '009-sklearn-pipeline',
        title: { 'en-US': 'Sklearn Pipeline', 'pt-BR': 'Pipeline Sklearn', 'es-ES': 'Pipeline Sklearn' },
        description: { 'en-US': 'Define a scikit-learn preprocessing pipeline.', 'pt-BR': 'Defina um pipeline de pré-processamento scikit-learn.', 'es-ES': 'Define un pipeline de preprocesamiento scikit-learn.' },
        difficulty: 4,
        skills: ['sklearn', 'pipeline'],
        mode: 'code',
        display: 'code',
        language: 'python',
        text: {
          'en-US': "pipe = Pipeline([('scale', StandardScaler()), ('clf', LogisticRegression())])\npipe.fit(X_train, y_train)",
          'pt-BR': "pipe = Pipeline([('scale', StandardScaler()), ('clf', LogisticRegression())])\npipe.fit(X_train, y_train)",
          'es-ES': "pipe = Pipeline([('scale', StandardScaler()), ('clf', LogisticRegression())])\npipe.fit(X_train, y_train)",
        },
      },
      {
        id: '010-seaborn-plot',
        title: { 'en-US': 'Seaborn Plot', 'pt-BR': 'Gráfico Seaborn', 'es-ES': 'Gráfico Seaborn' },
        description: { 'en-US': 'Create a seaborn visualization snippet.', 'pt-BR': 'Crie um snippet de visualização seaborn.', 'es-ES': 'Crea un fragmento de visualización con seaborn.' },
        difficulty: 3,
        skills: ['seaborn', 'visualization'],
        mode: 'code',
        display: 'code',
        language: 'python',
        text: {
          'en-US': "import seaborn as sns\nsns.scatterplot(data=df, x='latency', y='errors', hue='region')",
          'pt-BR': "import seaborn as sns\nsns.scatterplot(data=df, x='latency', y='errors', hue='region')",
          'es-ES': "import seaborn as sns\nsns.scatterplot(data=df, x='latency', y='errors', hue='region')",
        },
      },
    ],
  },
  {
    track: 'legal-translators',
    module: 'legal-terms',
    lessons: [
      {
        id: '006-arbitration-clause',
        title: { 'en-US': 'Arbitration Clause', 'pt-BR': 'Cláusula de Arbitragem', 'es-ES': 'Cláusula de arbitraje' },
        description: { 'en-US': 'Practice typing arbitration language.', 'pt-BR': 'Pratique digitar linguagem de arbitragem.', 'es-ES': 'Practica redactar lenguaje de arbitraje.' },
        difficulty: 4,
        skills: ['legal', 'contracts'],
        mode: 'prose',
        display: 'prose',
        text: {
          'en-US': 'Any dispute arising from this agreement shall be resolved by binding arbitration under the rules of the local chamber.',
          'pt-BR': 'Qualquer disputa decorrente deste acordo será resolvida por arbitragem vinculante conforme as regras da câmara local.',
          'es-ES': 'Cualquier disputa derivada de este acuerdo se resolverá mediante arbitraje vinculante según las reglas de la cámara local.',
        },
      },
      {
        id: '007-nda-term',
        title: { 'en-US': 'NDA Term', 'pt-BR': 'Termo de NDA', 'es-ES': 'Término de NDA' },
        description: { 'en-US': 'Type confidentiality agreement wording.', 'pt-BR': 'Digite redação de acordo de confidencialidade.', 'es-ES': 'Escribe redacción de acuerdo de confidencialidad.' },
        difficulty: 3,
        skills: ['legal', 'nda'],
        mode: 'prose',
        display: 'prose',
        text: {
          'en-US': 'The receiving party shall not disclose confidential information except as required by applicable law.',
          'pt-BR': 'A parte receptora não divulgará informações confidenciais, exceto quando exigido pela lei aplicável.',
          'es-ES': 'La parte receptora no divulgará información confidencial, salvo cuando lo exija la ley aplicable.',
        },
      },
      {
        id: '008-force-majeure',
        title: { 'en-US': 'Force Majeure', 'pt-BR': 'Força Maior', 'es-ES': 'Fuerza mayor' },
        description: { 'en-US': 'Practice force majeure contractual language.', 'pt-BR': 'Pratique linguagem contratual de força maior.', 'es-ES': 'Practica lenguaje contractual de fuerza mayor.' },
        difficulty: 4,
        skills: ['legal', 'contracts'],
        mode: 'prose',
        display: 'prose',
        text: {
          'en-US': 'Neither party shall be liable for delays caused by events beyond reasonable control, including natural disasters.',
          'pt-BR': 'Nenhuma parte será responsável por atrasos causados por eventos além do controle razoável, incluindo desastres naturais.',
          'es-ES': 'Ninguna parte será responsable por retrasos causados por eventos fuera de su control razonable, incluidos desastres naturales.',
        },
      },
      {
        id: '009-gdpr-notice',
        title: { 'en-US': 'GDPR Notice', 'pt-BR': 'Aviso GDPR', 'es-ES': 'Aviso GDPR' },
        description: { 'en-US': 'Type GDPR-related privacy notice text.', 'pt-BR': 'Digite texto de aviso de privacidade relacionado ao GDPR.', 'es-ES': 'Escribe texto de aviso de privacidad relacionado con el GDPR.' },
        difficulty: 3,
        skills: ['legal', 'privacy'],
        mode: 'prose',
        display: 'prose',
        text: {
          'en-US': 'You may request access, correction, or deletion of your personal data by contacting the data protection officer.',
          'pt-BR': 'Você pode solicitar acesso, correção ou exclusão dos seus dados pessoais entrando em contato com o encarregado de proteção de dados.',
          'es-ES': 'Puede solicitar acceso, rectificación o supresión de sus datos personales contactando al delegado de protección de datos.',
        },
      },
      {
        id: '010-ip-assignment',
        title: { 'en-US': 'IP Assignment', 'pt-BR': 'Cessão de PI', 'es-ES': 'Cesión de PI' },
        description: { 'en-US': 'Practice intellectual property assignment clauses.', 'pt-BR': 'Pratique cláusulas de cessão de propriedade intelectual.', 'es-ES': 'Practica cláusulas de cesión de propiedad intelectual.' },
        difficulty: 4,
        skills: ['legal', 'ip'],
        mode: 'prose',
        display: 'prose',
        text: {
          'en-US': 'The contractor hereby assigns all rights, title, and interest in the work product to the company upon payment.',
          'pt-BR': 'O contratado cede todos os direitos, títulos e interesses sobre o produto do trabalho à empresa mediante pagamento.',
          'es-ES': 'El contratista cede todos los derechos, títulos e intereses sobre el producto del trabajo a la empresa tras el pago.',
        },
      },
    ],
  },
];

// es-ES base lessons 001-005 for programmers + technical-writers (from en-US sources)
const esEsBaseLessons: ModuleDef[] = [
  {
    track: 'programmers',
    module: 'syntax-brackets',
    lessons: [
      {
        id: '001-curly-basics',
        title: { 'en-US': '', 'pt-BR': '', 'es-ES': 'Bases de llaves' },
        description: { 'en-US': '', 'pt-BR': '', 'es-ES': 'Practica llaves de apertura y cierre en patrones comunes.' },
        difficulty: 1,
        skills: ['curly-braces'],
        mode: 'code',
        display: 'code',
        language: 'javascript',
        text: {
          'en-US': '',
          'pt-BR': '',
          'es-ES': "const obj = { key: 'value' };\nif (true) {\n  console.log('hola');\n}",
        },
      },
      {
        id: '002-array-brackets',
        title: { 'en-US': '', 'pt-BR': '', 'es-ES': 'Corchetes de array' },
        description: { 'en-US': '', 'pt-BR': '', 'es-ES': 'Practica corchetes en arrays y acceso indexado.' },
        difficulty: 2,
        skills: ['arrays'],
        mode: 'code',
        display: 'code',
        language: 'javascript',
        text: {
          'en-US': '',
          'pt-BR': '',
          'es-ES': "const items = [1, 2, 3];\nconst first = items[0];\nitems.push(items[items.length - 1]);",
        },
      },
      {
        id: '003-pipe-chain',
        title: { 'en-US': '', 'pt-BR': '', 'es-ES': 'Cadena de pipes' },
        description: { 'en-US': '', 'pt-BR': '', 'es-ES': 'Practica encadenamiento con operador pipe.' },
        difficulty: 2,
        skills: ['pipes', 'functional'],
        mode: 'code',
        display: 'code',
        language: 'javascript',
        text: {
          'en-US': '',
          'pt-BR': '',
          'es-ES': 'const result = data |> filterActive |> sortByName |> take(10);',
        },
      },
      {
        id: '004-template-literals',
        title: { 'en-US': '', 'pt-BR': '', 'es-ES': 'Template literals' },
        description: { 'en-US': '', 'pt-BR': '', 'es-ES': 'Practica template literals con interpolación.' },
        difficulty: 2,
        skills: ['templates'],
        mode: 'code',
        display: 'code',
        language: 'javascript',
        text: {
          'en-US': '',
          'pt-BR': '',
          'es-ES': "const msg = `Usuario ${user.name} tiene ${user.score} puntos`;",
        },
      },
      {
        id: '005-arrow-functions',
        title: { 'en-US': '', 'pt-BR': '', 'es-ES': 'Arrow functions' },
        description: { 'en-US': '', 'pt-BR': '', 'es-ES': 'Practica funciones flecha y callbacks.' },
        difficulty: 2,
        skills: ['arrow-functions'],
        mode: 'code',
        display: 'code',
        language: 'javascript',
        text: {
          'en-US': '',
          'pt-BR': '',
          'es-ES': 'const doubled = values.map((n) => n * 2);\nconst sum = values.reduce((a, b) => a + b, 0);',
        },
      },
    ],
  },
  {
    track: 'technical-writers',
    module: 'requirements',
    lessons: [
      {
        id: '001-user-story',
        title: { 'en-US': '', 'pt-BR': '', 'es-ES': 'Historia de usuario' },
        description: { 'en-US': '', 'pt-BR': '', 'es-ES': 'Practica redactar una historia de usuario clara.' },
        difficulty: 2,
        skills: ['user-stories'],
        mode: 'prose',
        display: 'prose',
        text: {
          'en-US': '',
          'pt-BR': '',
          'es-ES': 'Como administrador, quiero exportar informes en CSV para analizar métricas fuera de la plataforma.',
        },
      },
      {
        id: '002-acceptance-criteria',
        title: { 'en-US': '', 'pt-BR': '', 'es-ES': 'Criterios de aceptación' },
        description: { 'en-US': '', 'pt-BR': '', 'es-ES': 'Escribe criterios de aceptación medibles.' },
        difficulty: 2,
        skills: ['acceptance-criteria'],
        mode: 'prose',
        display: 'prose',
        text: {
          'en-US': '',
          'pt-BR': '',
          'es-ES': 'Dado un usuario autenticado, cuando exporta un informe, entonces el archivo CSV debe descargarse en menos de 5 segundos.',
        },
      },
      {
        id: '003-given-when-then',
        title: { 'en-US': '', 'pt-BR': '', 'es-ES': 'Dado-Cuando-Entonces' },
        description: { 'en-US': '', 'pt-BR': '', 'es-ES': 'Practica formato Given-When-Then en español.' },
        difficulty: 3,
        skills: ['gherkin'],
        mode: 'prose',
        display: 'prose',
        text: {
          'en-US': '',
          'pt-BR': '',
          'es-ES': 'Dado que el carrito tiene artículos, cuando el usuario aplica un cupón válido, entonces el total debe actualizarse con el descuento.',
        },
      },
      {
        id: '004-api-requirement',
        title: { 'en-US': '', 'pt-BR': '', 'es-ES': 'Requisito de API' },
        description: { 'en-US': '', 'pt-BR': '', 'es-ES': 'Documenta un requisito de endpoint REST.' },
        difficulty: 3,
        skills: ['api', 'requirements'],
        mode: 'prose',
        display: 'prose',
        text: {
          'en-US': '',
          'pt-BR': '',
          'es-ES': 'El endpoint GET /v1/users/{id} debe devolver 200 con el perfil del usuario o 404 si no existe.',
        },
      },
      {
        id: '005-edge-case',
        title: { 'en-US': '', 'pt-BR': '', 'es-ES': 'Caso límite' },
        description: { 'en-US': '', 'pt-BR': '', 'es-ES': 'Describe un caso límite en requisitos.' },
        difficulty: 3,
        skills: ['edge-cases'],
        mode: 'prose',
        display: 'prose',
        text: {
          'en-US': '',
          'pt-BR': '',
          'es-ES': 'Si el usuario envía un archivo vacío, el sistema debe rechazar la carga con un mensaje de error claro y código 400.',
        },
      },
    ],
  },
  {
    track: 'technical-writers',
    module: 'translation',
    lessons: [
      {
        id: '001-password-reset',
        title: { 'en-US': '', 'pt-BR': '', 'es-ES': 'Restablecer contraseña' },
        description: { 'en-US': '', 'pt-BR': '', 'es-ES': 'Traduce un flujo de restablecimiento de contraseña.' },
        difficulty: 2,
        skills: ['translation'],
        mode: 'translation',
        display: 'prose',
        text: {
          'en-US': '',
          'pt-BR': '',
          'es-ES': 'Hemos enviado un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada.',
        },
        sourceText: {
          'en-US': '',
          'pt-BR': '',
          'es-ES': 'Enviamos um link para redefinir sua senha. Verifique sua caixa de entrada.',
        },
      },
      {
        id: '002-feature-request',
        title: { 'en-US': '', 'pt-BR': '', 'es-ES': 'Solicitud de función' },
        description: { 'en-US': '', 'pt-BR': '', 'es-ES': 'Traduce una solicitud de nueva funcionalidad.' },
        difficulty: 2,
        skills: ['translation'],
        mode: 'translation',
        display: 'prose',
        text: {
          'en-US': '',
          'pt-BR': '',
          'es-ES': 'Los usuarios solicitan exportar datos en formato JSON además de CSV.',
        },
        sourceText: {
          'en-US': '',
          'pt-BR': '',
          'es-ES': 'Usuários solicitam exportar dados em JSON além de CSV.',
        },
      },
      {
        id: '003-error-message',
        title: { 'en-US': '', 'pt-BR': '', 'es-ES': 'Mensaje de error' },
        description: { 'en-US': '', 'pt-BR': '', 'es-ES': 'Traduce un mensaje de error de validación.' },
        difficulty: 2,
        skills: ['translation'],
        mode: 'translation',
        display: 'prose',
        text: {
          'en-US': '',
          'pt-BR': '',
          'es-ES': 'El campo correo electrónico no es válido. Introduce una dirección con formato correcto.',
        },
        sourceText: {
          'en-US': '',
          'pt-BR': '',
          'es-ES': 'O campo e-mail é inválido. Informe um endereço com formato correto.',
        },
      },
      {
        id: '004-onboarding-step',
        title: { 'en-US': '', 'pt-BR': '', 'es-ES': 'Paso de onboarding' },
        description: { 'en-US': '', 'pt-BR': '', 'es-ES': 'Traduce un paso de onboarding de producto.' },
        difficulty: 3,
        skills: ['translation'],
        mode: 'translation',
        display: 'prose',
        text: {
          'en-US': '',
          'pt-BR': '',
          'es-ES': 'Conecta tu repositorio para importar proyectos y empezar a practicar en minutos.',
        },
        sourceText: {
          'en-US': '',
          'pt-BR': '',
          'es-ES': 'Conecte seu repositório para importar projetos e começar a praticar em minutos.',
        },
      },
      {
        id: '005-commit-message',
        title: { 'en-US': '', 'pt-BR': '', 'es-ES': 'Mensaje de commit' },
        description: { 'en-US': '', 'pt-BR': '', 'es-ES': 'Traduce una convención de mensaje de commit.' },
        difficulty: 3,
        skills: ['translation'],
        mode: 'translation',
        display: 'prose',
        text: {
          'en-US': '',
          'pt-BR': '',
          'es-ES': 'feat(auth): añadir inicio de sesión con proveedor OAuth2',
        },
        sourceText: {
          'en-US': '',
          'pt-BR': '',
          'es-ES': 'feat(auth): add OAuth2 provider sign-in',
        },
      },
    ],
  },
];

async function updateManifest() {
  const manifestPath = path.join(contentDir, 'manifest.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf-8'));

  const addSlugs = (trackId: string, moduleId: string, slugs: string[], locale: string) => {
    const track = manifest.tracks.find((t: { id: string }) => t.id === trackId);
    const mod = track?.modules.find((m: { id: string }) => m.id === moduleId);
    if (!mod) return;
    if (!mod.lessons[locale]) mod.lessons[locale] = [];
    for (const slug of slugs) {
      if (!mod.lessons[locale].includes(slug)) mod.lessons[locale].push(slug);
    }
    mod.lessons[locale].sort();
  };

  for (const mod of expansionLessons) {
    const slugs = mod.lessons.map((l) => l.id);
    addSlugs(mod.track, mod.module, slugs, 'en-US');
    addSlugs(mod.track, mod.module, slugs, 'pt-BR');
  }

  for (const mod of [...esEsBaseLessons, ...expansionLessons.filter((m) => m.track === 'programmers' || m.track === 'technical-writers')]) {
    const slugs = mod.lessons.map((l) => l.id);
    addSlugs(mod.track, mod.module, slugs, 'es-ES');
  }

  manifest.version = '1.2.0';
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
}

async function main() {
  let count = 0;

  for (const mod of expansionLessons) {
    for (const lesson of mod.lessons) {
      for (const locale of ['en-US', 'pt-BR'] as Locale[]) {
        await writeLesson(mod.track, mod.module, locale, lesson);
        count++;
      }
    }
  }

  for (const mod of esEsBaseLessons) {
    for (const lesson of mod.lessons) {
      await writeLesson(mod.track, mod.module, 'es-ES', lesson);
      count++;
    }
  }

  for (const mod of expansionLessons.filter((m) => m.track === 'programmers' || m.track === 'technical-writers')) {
    for (const lesson of mod.lessons) {
      await writeLesson(mod.track, mod.module, 'es-ES', lesson);
      count++;
    }
  }

  await updateManifest();
  console.log(`✓ Generated ${count} lesson files`);
  console.log('✓ Updated manifest.json to v1.2.0');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
