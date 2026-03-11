import { z } from 'zod';

export const authSchema = z.object({
  email: z.string().email('Введите корректный e-mail'),
  password: z.string().min(6, 'Минимум 6 символов'),
});

export const simpleCatalogSearchSchema = z.object({
  searchText: z.string().trim().optional().default(''),
  searchIn: z.enum(['all', 'title', 'author', 'genre']).default('all'),
  availability: z.enum(['all', 'available', 'unavailable']).default('all'),
});

export const advancedCatalogSearchSchema = z.object({
  title: z.string().trim().optional().default(''),
  author: z.string().trim().optional().default(''),
  genre: z.string().trim().optional().default(''),
  keyword: z.string().trim().optional().default(''),
  yearFrom: z
    .union([z.string(), z.number()])
    .transform((v) => `${v}`.trim())
    .optional()
    .default(''),
  yearTo: z
    .union([z.string(), z.number()])
    .transform((v) => `${v}`.trim())
    .optional()
    .default(''),
  availability: z.enum(['all', 'available', 'unavailable']).default('all'),
});


export const createBookSchema = z.object({
  title: z.string().trim().min(2, 'Минимум 2 символа'),
  author: z.string().trim().min(2, 'Минимум 2 символа'),
  publicationYear: z.coerce.number().int().min(1450).max(2100),
  copies: z.coerce.number().int().min(1).max(1000),
  genresCsv: z.string().trim().min(2, 'Укажите жанры через запятую'),
  isbn: z.string().trim().optional(),
  publisher: z.string().trim().optional(),
  language: z.string().trim().optional(),
  pageCount: z.coerce.number().int().min(1).max(10000).optional(),
  description: z.string().trim().max(2000).optional(),
});

export const preferencesSchema = z.object({
  userId: z.coerce.number().int().positive('User ID должен быть > 0').optional(),
  genres: z.array(z.string()).min(1, 'Укажите хотя бы один жанр'),
  authors: z.array(z.string()).min(1, 'Укажите хотя бы одного автора'),
});

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, 'Минимум 2 символа'),
  email: z.string().email('Введите корректный e-mail'),
  firstName: z.string().trim().optional(),
  lastName: z.string().trim().optional(),
  birthDate: z.string().optional(),
  country: z.string().trim().optional(),
  city: z.string().trim().optional(),
  postalCode: z.string().trim().optional(),
  street: z.string().trim().optional(),
  houseNumber: z.string().trim().optional(),
  phoneNumber: z.string().trim().optional(),
});

export type AuthFormValues = z.infer<typeof authSchema>;
export type SimpleCatalogSearchValues = z.infer<typeof simpleCatalogSearchSchema>;
export type AdvancedCatalogSearchValues = z.infer<typeof advancedCatalogSearchSchema>;
export type CreateBookFormValues = z.infer<typeof createBookSchema>;
export type PreferencesFormValues = z.infer<typeof preferencesSchema>;
export type ProfileFormValues = z.infer<typeof profileSchema>;
