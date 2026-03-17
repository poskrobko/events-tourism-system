import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchLoans, fetchMe, fetchRecommendations, updateMe, updatePreferences } from '../../api/libraryApi';
import type { PreferencesPayload, RecommendationSource } from '../../types/api';

export function useRecommendationsQuery(userId: number | null, page = 0, size = 20, source: RecommendationSource = 'all') {
  return useQuery({
    queryKey: ['recommendations', userId, page, size, source],
    queryFn: () => fetchRecommendations(userId ?? 0, page, size, source),
    enabled: Boolean(userId),
  });
}

export function useUpdatePreferencesMutation(userId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PreferencesPayload) => updatePreferences(userId ?? 0, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['recommendations', userId] });
    },
  });
}

export function useLoansQuery(userId?: number | null) {
  return useQuery({
    queryKey: ['loans', userId ?? 'me'],
    queryFn: () => fetchLoans(userId),
    enabled: userId === undefined || userId === null || Boolean(userId),
  });
}

export function useMeQuery(enabled = true) {
  return useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
    enabled,
  });
}

export function useUpdateMeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMe,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}
