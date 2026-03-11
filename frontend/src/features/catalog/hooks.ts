import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { borrowBook, createBookWithUpload, fetchBooks, fetchCatalogMeta, returnBook } from '../../api/libraryApi';
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

export function useBorrowBookMutation(params: BookSearchParams) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, bookId }: { userId: number; bookId: number }) => borrowBook(userId, bookId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['books', params] });
      void queryClient.invalidateQueries({ queryKey: ['loans'] });
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

export function useReturnBookMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (loanId: number) => returnBook(loanId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['books'] });
      void queryClient.invalidateQueries({ queryKey: ['loans'] });
    },
  });
}
