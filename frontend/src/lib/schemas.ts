import { z } from 'zod';

export const authSchema = z.object({
  email: z.string().email('Введите корректный e-mail'),
  password: z.string().min(6, 'Минимум 6 символов'),
});

export const catalogFilterSchema = z.object({
  genre: z.string().optional().default(''),
  author: z.string().optional().default(''),
});

export const preferencesSchema = z.object({
  userId: z.coerce.number().int().positive('User ID должен быть > 0').optional(),
  genres: z.array(z.string()).min(1, 'Укажите хотя бы один жанр'),
  authors: z.array(z.string()).min(1, 'Укажите хотя бы одного автора'),
});

export const profileSchema = z.object({
  fullName: z.string().min(2, 'Минимум 2 символа'),
  email: z.string().email('Введите корректный e-mail'),
});

export type AuthFormValues = z.infer<typeof authSchema>;
export type CatalogFilterValues = z.infer<typeof catalogFilterSchema>;
export type PreferencesFormValues = z.infer<typeof preferencesSchema>;
export type ProfileFormValues = z.infer<typeof profileSchema>;
