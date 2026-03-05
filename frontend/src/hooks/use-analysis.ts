'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { analysisApi } from '@/lib/api';

export function useAnalyses() {
  return useQuery({
    queryKey: ['analyses'],
    queryFn: analysisApi.list,
  });
}

export function useAnalysisStatus(analysisId: string, enabled = true) {
  return useQuery({
    queryKey: ['analysis', analysisId, 'status'],
    queryFn: () => analysisApi.getStatus(analysisId),
    enabled: enabled && !!analysisId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      // Poll every 2 seconds while processing
      if (status === 'pending' || status === 'processing') {
        return 2000;
      }
      return false;
    },
  });
}

export function useAnalysisResults(analysisId: string, enabled = true) {
  return useQuery({
    queryKey: ['analysis', analysisId, 'results'],
    queryFn: () => analysisApi.getResults(analysisId),
    enabled: enabled && !!analysisId,
  });
}

export function useStartAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: analysisApi.start,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analyses'] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}
