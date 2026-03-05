'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { issuesApi } from '@/lib/api';
import type { IssueFilters, IssueUpdate } from '@/types';

export function useIssues(filters?: IssueFilters) {
  return useQuery({
    queryKey: ['issues', filters],
    queryFn: () => issuesApi.list(filters),
  });
}

export function useIssue(id: string) {
  return useQuery({
    queryKey: ['issues', id],
    queryFn: () => issuesApi.get(id),
    enabled: !!id,
  });
}

export function useUpdateIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IssueUpdate }) =>
      issuesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    },
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      content,
      author,
    }: {
      id: string;
      content: string;
      author?: string;
    }) => issuesApi.addComment(id, content, author),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    },
  });
}

export function useDeleteIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: issuesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    },
  });
}

export function useIssueStats() {
  return useQuery({
    queryKey: ['issues', 'stats'],
    queryFn: issuesApi.getStats,
  });
}
