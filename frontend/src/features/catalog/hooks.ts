import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createBookRating,
  createBookWithUpload,
  createReservation,
  deleteBook,
  fetchBookDetails,
  fetchBookReviews,
  fetchBooks,
  fetchCatalogMeta,
  updateBook,
  updateMyBookRating,
} from '../../api/libraryApi';
import type { BookSearchParams } from '../../types/api';

export function useBooksQuery(params: BookSearchParams) {
  return useQuery({
    queryKey: ['books', params],
    queryFn: () => fetchBooks(params),
  });
}

export function useCatalogMetaQuery() {
  return useQuery({
    queryKey: ['catalog-meta'],
    queryFn: fetchCatalogMeta,
  });
}

export function useOrderBookMutation(params: BookSearchParams) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, bookId }: { userId: number; bookId: number }) => createReservation(userId, bookId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['books', params] });
      void queryClient.invalidateQueries({ queryKey: ['loans'] });
      void queryClient.invalidateQueries({ queryKey: ['admin-loans'] });
      void queryClient.invalidateQueries({ queryKey: ['librarian-reservations'] });
    },
  });
}

export function useCreateBookMutation(params: BookSearchParams) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBookWithUpload,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['books', params] });
      void queryClient.invalidateQueries({ queryKey: ['catalog-meta'] });
    },
  });
}

export function useSaveBookRatingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookId, userId, score, hasExistingRating }: { bookId: number; userId: number; score: number; hasExistingRating: boolean }) => {
      if (hasExistingRating) {
        await updateMyBookRating(bookId, userId, score);
        return;
      }

      await createBookRating(bookId, userId, score);
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['book-details', variables.bookId] });
      void queryClient.invalidateQueries({ queryKey: ['book-reviews', variables.bookId] });
      void queryClient.invalidateQueries({ queryKey: ['recommendations'] });
      void queryClient.invalidateQueries({ queryKey: ['loans'] });
    },
  });
}

export function useUpdateBookMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: {
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
    } }) => updateBook(id, payload),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['book-details', variables.id] });
      void queryClient.invalidateQueries({ queryKey: ['books'] });
      void queryClient.invalidateQueries({ queryKey: ['admin-books'] });
    },
  });
}

export function useBookDetailsQuery(bookId: number | null) {
  return useQuery({
    queryKey: ['book-details', bookId],
    queryFn: () => fetchBookDetails(bookId ?? 0),
    enabled: Boolean(bookId),
  });
}

export function useBookReviewsQuery(bookId: number | null, page = 0, size = 10) {
  return useQuery({
    queryKey: ['book-reviews', bookId, page, size],
    queryFn: () => fetchBookReviews(bookId ?? 0, page, size),
    enabled: Boolean(bookId),
  });
}

export function useDeleteBookMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteBook(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['books'] });
      void queryClient.invalidateQueries({ queryKey: ['admin-books'] });
    },
  });
}
