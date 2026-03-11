export type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
};

export type Book = {
  id: number;
  title: string;
  author: string;
  publicationYear: number;
  genres: string[];
  totalCopies: number;
  availableCopies: number;
  isbn?: string | null;
  publisher?: string | null;
  language?: string | null;
  pageCount?: number | null;
  description?: string | null;
  hasFile: boolean;
  hasCover: boolean;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
};

export type Loan = {
  id: number;
  userId: number;
  bookId: number;
  status: string;
  borrowedAt: string;
  dueDate: string;
  returnedAt?: string | null;
};

export type PreferencesPayload = {
  preferredGenres: string[];
  favoriteAuthors: string[];
};

export type CatalogMeta = {
  authors: string[];
  genres: string[];
};

export type BookSearchIn = 'all' | 'title' | 'author' | 'genre';
export type BookAvailability = 'all' | 'available' | 'unavailable';

export type BookSearchParams = {
  page: number;
  size: number;
  query?: string;
  title?: string;
  author?: string;
  genre?: string;
  yearFrom?: number;
  yearTo?: number;
  availability?: BookAvailability;
};

export type UserProfile = {
  id: number;
  email: string;
  fullName: string;
  firstName?: string | null;
  lastName?: string | null;
  birthDate?: string | null;
  country?: string | null;
  city?: string | null;
  postalCode?: string | null;
  street?: string | null;
  houseNumber?: string | null;
  phoneNumber?: string | null;
  roles: string[];
};
