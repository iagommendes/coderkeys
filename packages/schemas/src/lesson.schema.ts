import { z } from 'zod';

export const LocaleSchema = z.enum(['en-US', 'pt-BR', 'es-ES']);

export const LessonModeSchema = z.enum(['code', 'prose', 'translation']);

export const LessonContentSchema = z.object({
  text: z.string().min(20, 'Lesson text must be at least 20 characters'),
  display: z.enum(['code', 'prose']),
  language: z.string().optional(),
  sourceText: z.string().optional(),
});

export const LessonGoalsSchema = z.object({
  minWpm: z.number().min(0).optional(),
  minAccuracy: z.number().min(0).max(100).optional(),
});

export const LessonHintsSchema = z.object({
  keyboard: z.array(z.string()).optional(),
  shortcuts: z
    .array(
      z.object({
        keys: z.string(),
        description: z.string(),
      }),
    )
    .optional(),
});

export const LessonSchema = z
  .object({
    id: z.string().regex(/^\d{3}-[a-z0-9-]+$/, 'ID must match pattern 001-slug'),
    module: z.string().min(1),
    track: z.string().min(1),
    locale: LocaleSchema,
    title: z.string().min(1),
    description: z.string().min(1),
    difficulty: z.number().int().min(1).max(5),
    estimatedMinutes: z.number().min(1),
    skills: z.array(z.string()).min(1),
    tags: z.array(z.string()).optional(),
    mode: LessonModeSchema,
    content: LessonContentSchema,
    goals: LessonGoalsSchema.optional(),
    hints: LessonHintsSchema.optional(),
    author: z.string().min(1),
    source: z.string().nullable().optional(),
    version: z.number().int().min(1),
  })
  .superRefine((lesson, ctx) => {
    if (lesson.mode === 'translation' && !lesson.content.sourceText) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Translation lessons require content.sourceText',
        path: ['content', 'sourceText'],
      });
    }
  });

export const TrackMetaSchema = z.object({
  id: z.string().min(1),
  name: z.record(LocaleSchema, z.string()),
  description: z.record(LocaleSchema, z.string()),
  defaultModule: z.string().min(1),
});

export const ManifestModuleSchema = z.object({
  id: z.string().min(1),
  skills: z.array(z.string()).min(1),
  lessons: z.record(LocaleSchema, z.array(z.string())),
});

export const ManifestTrackSchema = z.object({
  id: z.string().min(1),
  icon: z.string().min(1),
  modules: z.array(ManifestModuleSchema).min(1),
});

export const ManifestSchema = z.object({
  version: z.string().min(1),
  tracks: z.array(ManifestTrackSchema).min(1),
});

export const SessionResultSchema = z.object({
  id: z.string().uuid(),
  lessonId: z.string().min(1),
  wpm: z.number().min(0),
  rawWpm: z.number().min(0),
  accuracy: z.number().min(0).max(100),
  awpm: z.number().min(0),
  durationMs: z.number().min(0),
  errorPositions: z.array(z.number()),
  errorChars: z.array(z.string()),
  completedAt: z.string().datetime(),
});

export type Locale = z.infer<typeof LocaleSchema>;
export type Lesson = z.infer<typeof LessonSchema>;
export type TrackMeta = z.infer<typeof TrackMetaSchema>;
export type Manifest = z.infer<typeof ManifestSchema>;
export type SessionResult = z.infer<typeof SessionResultSchema>;
