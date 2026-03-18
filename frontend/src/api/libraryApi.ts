import { apiClient } from './client';
import type {
  AdminLoan,
  AdminUser,
  AuthResponse,
  Book,
  BookDetails,
  BookSearchParams,
  CatalogMeta,
  LibrarianReservation,
  Loan,
  Page,
  PreferencesPayload,
  RecommendationItem,
  RecommendationSource,
  Reservation,
  Review,
  UserProfile,
} from '../types/api';

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

export async function fetchBookDetails(bookId: number): Promise<BookDetails> {
  const { data } = await apiClient.get<BookDetails>(`/books/${bookId}/details`);
  return data;
}

export async function fetchBookReviews(bookId: number, page = 0, size = 10): Promise<Page<Review>> {
  const { data } = await apiClient.get<Page<Review>>(`/books/${bookId}/reviews`, { params: { page, size } });
  return data;
}

export async function deleteBook(id: number): Promise<void> {
  await apiClient.delete(`/books/${id}`);
}

export async function updateBook(id: number, payload: {
  title?: string;
  author?: string;
  publicationYear?: number;
  genres?: string[];
  copies?: number;
  isbn?: string | null;
  publisher?: string | null;
  language?: string | null;
  pageCount?: number | null;
  description?: string | null;
}): Promise<Book> {
  const { data } = await apiClient.patch<Book>(`/books/${id}`, payload);
  return data;
}

export async function fetchCatalogMeta(): Promise<CatalogMeta> {
  const { data } = await apiClient.get<CatalogMeta>('/books/meta');
  return data;
}

export async function fetchRecommendations(
  userId: number,
  page = 0,
  size = 10,
  source: RecommendationSource = 'all',
): Promise<Page<RecommendationItem>> {
  const { data } = await apiClient.get<Page<RecommendationItem>>(`/users/${userId}/recommendations`, { params: { page, size, source } });
  return data;
}

export async function updatePreferences(userId: number, payload: PreferencesPayload): Promise<void> {
  await apiClient.post(`/users/${userId}/preferences`, {
    preferredGenresCsv: payload.preferredGenres.join(','),
    favoriteAuthorsCsv: payload.favoriteAuthors.join(','),
  });
}

export async function createReservation(userId: number, bookId: number): Promise<Reservation> {
  const { data } = await apiClient.post<Reservation>('/reservations', { userId, bookId });
  return data;
}

export async function fetchReservations(userId?: number | null): Promise<Reservation[]> {
  const path = userId ? `/users/${userId}/reservations` : '/users/me/reservations';
  const { data } = await apiClient.get<Reservation[]>(path);
  return data;
}

export async function cancelReservation(reservationId: number, userId: number): Promise<Reservation> {
  const { data } = await apiClient.post<Reservation>(`/reservations/${reservationId}/cancel`, undefined, { params: { userId } });
  return data;
}

export async function returnBook(loanId: number): Promise<void> {
  await apiClient.post(`/loans/${loanId}/return`);
}

export async function createBookRating(bookId: number, userId: number, score: number): Promise<void> {
  await apiClient.post(`/books/${bookId}/ratings`, { score, userId });
}

export async function updateMyBookRating(bookId: number, userId: number, score: number): Promise<void> {
  await apiClient.put(`/books/${bookId}/ratings/me`, { score, userId });
}

export async function reviewBook(bookId: number, userId: number, text: string): Promise<void> {
  await apiClient.post(`/books/${bookId}/reviews`, { text, userId });
}

export async function fetchLoans(userId?: number | null): Promise<Loan[]> {
  const path = userId ? `/users/${userId}/loans` : '/users/me/loans';
  const { data } = await apiClient.get<Loan[]>(path);
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
  nickname: string;
  avatarUrl?: string | null;
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
  const normalizedPayload = {
    ...payload,
    firstName: payload.firstName?.trim() || null,
    lastName: payload.lastName?.trim() || null,
    country: payload.country?.trim() || null,
    city: payload.city?.trim() || null,
    postalCode: payload.postalCode?.trim() || null,
    street: payload.street?.trim() || null,
    houseNumber: payload.houseNumber?.trim() || null,
    phoneNumber: payload.phoneNumber?.trim() || null,
    avatarUrl: payload.avatarUrl?.trim() || null,
  };

  const { data } = await apiClient.patch<UserProfile>('/users/me', normalizedPayload);
  return data;
}

export async function fetchAdminUsers(params: { page: number; size: number; query?: string; role?: string }): Promise<Page<AdminUser>> {
  const { data } = await apiClient.get<Page<AdminUser>>('/admin/users', { params });
  return data;
}

export async function updateAdminUser(id: number, payload: { email?: string; nickname?: string; roles?: string[] }): Promise<AdminUser> {
  const { data } = await apiClient.patch<AdminUser>(`/admin/users/${id}`, payload);
  return data;
}

export async function deleteAdminUser(id: number): Promise<void> {
  await apiClient.delete(`/admin/users/${id}`);
}

export async function fetchAdminBooks(params: BookSearchParams): Promise<Page<Book>> {
  const { data } = await apiClient.get<Page<Book>>('/admin/books', { params });
  return data;
}

export async function deleteAdminBook(id: number): Promise<void> {
  await apiClient.delete(`/admin/books/${id}`);
}

export async function inviteLibrarian(payload: { email: string; nickname?: string }): Promise<{ invitedUserId: number; email: string; temporaryPassword: string }> {
  const { data } = await apiClient.post<{ invitedUserId: number; email: string; temporaryPassword: string }>('/admin/librarians/invite', payload);
  return data;
}

export async function fetchAdminLoans(params: { page: number; size: number; userQuery?: string; bookQuery?: string; status?: string }): Promise<Page<AdminLoan>> {
  const { data } = await apiClient.get<Page<AdminLoan>>('/admin/loans', { params });
  return data;
}

export async function fetchLibrarianReservations(params: { page: number; size: number; userQuery?: string; bookQuery?: string; status?: string }): Promise<Page<LibrarianReservation>> {
  const { data } = await apiClient.get<Page<LibrarianReservation>>('/librarian/reservations', { params });
  return data;
}

export async function issueLibrarianReservation(reservationId: number): Promise<LibrarianReservation> {
  const { data } = await apiClient.post<LibrarianReservation>(`/librarian/reservations/${reservationId}/issue`);
  return data;
}

export async function returnLibrarianReservation(reservationId: number): Promise<LibrarianReservation> {
  const { data } = await apiClient.post<LibrarianReservation>(`/librarian/reservations/${reservationId}/return`);
  return data;
}
