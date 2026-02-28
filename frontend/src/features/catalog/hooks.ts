import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { borrowBook, fetchBooks, fetchCatalogMeta, returnBook } from '../../api/libraryApi';

export function useBooksQuery(params: { page: number; size: number; genre?: string; author?: string }) {
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

export function useBorrowBookMutation(params: { page: number; size: number; genre?: string; author?: string }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, bookId }: { userId: number; bookId: number }) => borrowBook(userId, bookId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['books', params] });
      void queryClient.invalidateQueries({ queryKey: ['loans'] });
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
