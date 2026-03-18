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

export type RecommendationSource = 'all' | 'system' | 'user';

export type RecommendationItem = {
  book: Book;
  sourceTags: Array<'SYSTEM' | 'USER'>;
};

export type BookDetails = {
  book: Book;
  averageRating: number;
  ratingsCount: number;
  myRating?: number | null;
};

export type Review = {
  id: number;
  bookId: number;
  userId: number;
  text: string;
  createdAt: string;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
};

export type Loan = {
  id: number;
  userId: number;
  bookId: number;
  bookTitle: string;
  status: string;
  borrowedAt: string;
  dueDate: string;
  returnedAt?: string | null;
  myRating?: number | null;
};

export type Reservation = {
  id: number;
  userId: number;
  bookId: number;
  status: string;
  createdAt: string;
  notifiedAt?: string | null;
  expiresAt?: string | null;
  cancelledAt?: string | null;
};

export type AdminUser = {
  id: number;
  email: string;
  nickname: string | null;
  roles: string[];
};

export type AdminLoan = {
  id: number;
  userId: number;
  userEmail: string;
  bookId: number;
  bookTitle: string;
  status: string;
  borrowedAt: string;
  dueDate: string;
  returnedAt?: string | null;
};

export type LibrarianReservation = {
  id: number;
  userId: number;
  userEmail: string;
  bookId: number;
  bookTitle: string;
  status: string;
  createdAt: string;
  notifiedAt?: string | null;
  expiresAt?: string | null;
  cancelledAt?: string | null;
  loanId?: number | null;
  loanStatus?: string | null;
  borrowedAt?: string | null;
  dueDate?: string | null;
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
  nickname: string | null;
  avatarUrl?: string | null;
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
