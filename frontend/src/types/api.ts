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

export type UserProfile = {
  id: number;
  email: string;
  fullName: string;
  roles: string[];
};
