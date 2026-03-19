import { z } from 'zod';

const currentYear = new Date().getFullYear();
const isbnRegex = /^(?:97[89])?\d{9}[\dXx]$/;
const phoneRegex = /^\+?[0-9()\-\s]{7,25}$/;
const postalCodeRegex = /^[A-Za-z0-9\- ]{3,12}$/;

const optionalTrimmedString = () => z.string().trim().optional().or(z.literal(''));
const optionalTrimmedEmail = z
  .string()
  .trim()
  .email('Введите корректный e-mail');
const optionalPhoneSchema = z
  .string()
  .trim()
  .refine((value) => value === '' || phoneRegex.test(value), 'Введите корректный номер телефона')
  .optional()
  .default('');
const optionalPostalCodeSchema = z
  .string()
  .trim()
  .refine((value) => value === '' || postalCodeRegex.test(value), 'Введите корректный почтовый индекс')
  .optional()
  .default('');
const optionalIsbnSchema = z
  .string()
  .trim()
  .refine((value) => value === '' || isbnRegex.test(value.replace(/[-\s]/g, '')), 'Введите корректный ISBN-10 или ISBN-13')
  .optional()
  .default('');

export const authSchema = z.object({
  email: z.string().trim().email('Введите корректный e-mail'),
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
  publisher: z.string().trim().optional().default(''),
  language: z.string().trim().optional().default(''),
  isbn: optionalIsbnSchema,
  keyword: z.string().trim().optional().default(''),
  yearFrom: z
    .union([z.string(), z.number()])
    .transform((v) => `${v}`.trim())
    .refine((value) => value === '' || (/^\d{4}$/.test(value) && Number(value) >= 1450 && Number(value) <= currentYear), `Введите год от 1450 до ${currentYear}`)
    .optional()
    .default(''),
  yearTo: z
    .union([z.string(), z.number()])
    .transform((v) => `${v}`.trim())
    .refine((value) => value === '' || (/^\d{4}$/.test(value) && Number(value) >= 1450 && Number(value) <= currentYear), `Введите год от 1450 до ${currentYear}`)
    .optional()
    .default(''),
  availability: z.enum(['all', 'available', 'unavailable']).default('all'),
});

export const createBookSchema = z.object({
  title: z.string().trim().min(2, 'Минимум 2 символа').max(255, 'Максимум 255 символов'),
  author: z.string().trim().min(2, 'Минимум 2 символа').max(255, 'Максимум 255 символов'),
  publicationYear: z.coerce.number({ invalid_type_error: 'Укажите год публикации' }).int('Введите целый год').min(1450, 'Год не может быть раньше 1450').max(currentYear, `Год не может быть позже ${currentYear}`),
  copies: z.coerce.number({ invalid_type_error: 'Укажите количество копий' }).int('Введите целое число').min(1, 'Минимум 1 копия').max(1000, 'Максимум 1000 копий'),
  genresCsv: z.string().trim().min(2, 'Укажите жанры через запятую'),
  isbn: optionalIsbnSchema,
  publisher: optionalTrimmedString(),
  language: optionalTrimmedString(),
  pageCount: z.union([z.coerce.number().int('Введите целое число').min(1, 'Минимум 1 страница').max(10000, 'Максимум 10000 страниц'), z.nan()]).optional().transform((value) => (Number.isNaN(value) ? undefined : value)),
  description: z.string().trim().max(2000, 'Максимум 2000 символов').optional(),
});

export const preferencesSchema = z.object({
  userId: z.coerce.number().int().positive('User ID должен быть > 0').optional(),
  genres: z.array(z.string()).default([]),
  authors: z.array(z.string()).default([]),
});

export const profileSchema = z.object({
  nickname: z.string().trim().min(2, 'Минимум 2 символа').max(50, 'Максимум 50 символов'),
  avatarUrl: z.string().url('Некорректный URL').optional().or(z.literal('')),
  email: optionalTrimmedEmail,
  firstName: z.string().trim().max(100, 'Максимум 100 символов').optional(),
  lastName: z.string().trim().max(100, 'Максимум 100 символов').optional(),
  birthDate: z.string().optional(),
  country: z.string().trim().max(100, 'Максимум 100 символов').optional(),
  city: z.string().trim().max(100, 'Максимум 100 символов').optional(),
  postalCode: optionalPostalCodeSchema,
  street: z.string().trim().max(120, 'Максимум 120 символов').optional(),
  houseNumber: z.string().trim().max(20, 'Максимум 20 символов').optional(),
  phoneNumber: optionalPhoneSchema,
});

export type AuthFormValues = z.infer<typeof authSchema>;
export type SimpleCatalogSearchValues = z.infer<typeof simpleCatalogSearchSchema>;
export type AdvancedCatalogSearchValues = z.infer<typeof advancedCatalogSearchSchema>;
export type CreateBookFormValues = z.infer<typeof createBookSchema>;
export type PreferencesFormValues = z.infer<typeof preferencesSchema>;
export type ProfileFormValues = z.infer<typeof profileSchema>;
