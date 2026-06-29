import { z } from 'zod';

export const ThemeColorsSchema = z.object({
  surface: z.string(),
  surfaceElevated: z.string(),
  border: z.string(),
  accent: z.string(),
  accentHover: z.string(),
  success: z.string(),
  error: z.string(),
  muted: z.string(),
  foreground: z.string(),
});

export const ThemeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  author: z.string().min(1),
  description: z.string().optional(),
  colors: ThemeColorsSchema,
  fonts: z
    .object({
      sans: z.string().optional(),
      mono: z.string().optional(),
    })
    .optional(),
});

export const BuiltInThemeIdSchema = z.enum(['default-dark', 'default-light', 'dracula']);

export type Theme = z.infer<typeof ThemeSchema>;
export type BuiltInThemeId = z.infer<typeof BuiltInThemeIdSchema>;
