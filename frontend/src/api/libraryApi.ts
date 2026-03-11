import { apiClient } from './client';
import type { AuthResponse, Book, BookSearchParams, CatalogMeta, Loan, Page, PreferencesPayload, UserProfile } from '../types/api';

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', { email, password });
  return data;
}

export async function register(email: string, password: string): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/register', { email, password });
  return data;
}

export async function fetchBooks(params: BookSearchParams): Promise<Page<Book>> {
  const { data } = await apiClient.get<Page<Book>>('/books', { params });
  return data;
}

export async function fetchCatalogMeta(): Promise<CatalogMeta> {
  const { data } = await apiClient.get<CatalogMeta>('/books/meta');
  return data;
}

export async function fetchRecommendations(userId: number, page = 0, size = 10): Promise<Page<Book>> {
  const { data } = await apiClient.get<Page<Book>>(`/users/${userId}/recommendations`, { params: { page, size } });
  return data;
}

export async function updatePreferences(userId: number, payload: PreferencesPayload): Promise<void> {
  await apiClient.post(`/users/${userId}/preferences`, {
    preferredGenresCsv: payload.preferredGenres.join(','),
    favoriteAuthorsCsv: payload.favoriteAuthors.join(','),
  });
}

export async function borrowBook(userId: number, bookId: number): Promise<void> {
  await apiClient.post('/loans', { userId, bookId });
}

export async function returnBook(loanId: number): Promise<void> {
  await apiClient.post(`/loans/${loanId}/return`);
}

export async function fetchLoans(userId: number): Promise<Loan[]> {
  const { data } = await apiClient.get<Loan[]>(`/users/${userId}/loans`);
  return data;
}

export function getBookCoverUrl(bookId: number): string {
  return `${apiClient.defaults.baseURL}/books/${bookId}/cover`;
}

export function getBookDownloadUrl(bookId: number): string {
  return `${apiClient.defaults.baseURL}/books/${bookId}/download`;
}

export async function createBookWithUpload(payload: {
  title: string;
  author: string;
  publicationYear: number;
  copies: number;
  genres: string[];
  isbn?: string;
  publisher?: string;
  language?: string;
  pageCount?: number;
  description?: string;
  file?: File | null;
  cover?: File | null;
}): Promise<Book> {
  const formData = new FormData();
  formData.append('title', payload.title);
  formData.append('author', payload.author);
  formData.append('publicationYear', String(payload.publicationYear));
  formData.append('copies', String(payload.copies));
  payload.genres.filter(Boolean).forEach((genre) => formData.append('genres', genre));
  if (payload.isbn) formData.append('isbn', payload.isbn);
  if (payload.publisher) formData.append('publisher', payload.publisher);
  if (payload.language) formData.append('language', payload.language);
  if (payload.pageCount) formData.append('pageCount', String(payload.pageCount));
  if (payload.description) formData.append('description', payload.description);
  if (payload.file) formData.append('file', payload.file);
  if (payload.cover) formData.append('cover', payload.cover);

  const { data } = await apiClient.post<Book>('/books/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function fetchMe(): Promise<UserProfile> {
  const { data } = await apiClient.get<UserProfile>('/users/me');
  return data;
}

export async function updateMe(payload: {
  fullName: string;
  email: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  country?: string;
  city?: string;
  postalCode?: string;
  street?: string;
  houseNumber?: string;
  phoneNumber?: string;
}): Promise<UserProfile> {
  const { data } = await apiClient.patch<UserProfile>('/users/me', payload);
  return data;
}
