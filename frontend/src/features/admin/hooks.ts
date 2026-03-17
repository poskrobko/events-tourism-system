import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteAdminBook, deleteAdminUser, fetchAdminBooks, fetchAdminLoans, fetchAdminUsers, fetchLibrarianLoans, inviteLibrarian, updateAdminUser } from '../../api/libraryApi';
import type { BookSearchParams } from '../../types/api';

export function useAdminUsersQuery(params: { page: number; size: number; query?: string; role?: string }, enabled: boolean) {
  return useQuery({
    queryKey: ['admin-users', params],
    queryFn: () => fetchAdminUsers(params),
    enabled,
  });
}

export function useUpdateAdminUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: { email?: string; nickname?: string; roles?: string[] } }) => updateAdminUser(id, payload),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });
}

export function useDeleteAdminUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteAdminUser(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      void queryClient.invalidateQueries({ queryKey: ['admin-loans'] });
    },
  });
}

export function useAdminBooksQuery(params: BookSearchParams, enabled: boolean) {
  return useQuery({
    queryKey: ['admin-books', params],
    queryFn: () => fetchAdminBooks(params),
    enabled,
  });
}

export function useDeleteAdminBookMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteAdminBook(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-books'] });
      void queryClient.invalidateQueries({ queryKey: ['admin-loans'] });
      void queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
}

export function useAdminLoansQuery(params: { page: number; size: number; userQuery?: string; bookQuery?: string; status?: string }, enabled: boolean) {
  return useQuery({
    queryKey: ['admin-loans', params],
    queryFn: () => fetchAdminLoans(params),
    enabled,
  });
}

export function useLibrarianLoansQuery(params: { page: number; size: number; userQuery?: string; bookQuery?: string; status?: string }, enabled: boolean) {
  return useQuery({
    queryKey: ['librarian-loans', params],
    queryFn: () => fetchLibrarianLoans(params),
    enabled,
  });
}


export function useInviteLibrarianMutation() {
  return useMutation({
    mutationFn: (payload: { email: string; nickname?: string }) => inviteLibrarian(payload),
  });
}
