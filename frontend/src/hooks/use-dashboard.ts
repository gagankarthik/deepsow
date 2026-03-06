'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api';

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: dashboardApi.getSummary,
  });
}

export function useSOWDataList() {
  return useQuery({
    queryKey: ['sow-data'],
    queryFn: dashboardApi.listSOWData,
  });
}

export function useSOWData(id: string) {
  return useQuery({
    queryKey: ['sow-data', id],
    queryFn: () => dashboardApi.getSOWData(id),
    enabled: !!id,
  });
}

export function useSOWDataByDocument(documentId: string) {
  return useQuery({
    queryKey: ['sow-data', 'document', documentId],
    queryFn: () => dashboardApi.getSOWDataByDocument(documentId),
    enabled: !!documentId,
  });
}

export function useSOWDataByAnalysis(analysisId: string) {
  return useQuery({
    queryKey: ['sow-data', 'analysis', analysisId],
    queryFn: () => dashboardApi.getSOWDataByAnalysis(analysisId),
    enabled: !!analysisId,
  });
}

export function useUpdateSOWData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      dashboardApi.updateSOWData(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sow-data'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sowDataId,
      employeeId,
      data,
    }: {
      sowDataId: string;
      employeeId: string;
      data: any;
    }) => dashboardApi.updateEmployee(sowDataId, employeeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sow-data'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateMilestone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sowDataId,
      milestoneId,
      data,
    }: {
      sowDataId: string;
      milestoneId: string;
      data: any;
    }) => dashboardApi.updateMilestone(sowDataId, milestoneId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sow-data'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useAddEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sowDataId, employee }: { sowDataId: string; employee: any }) =>
      dashboardApi.addEmployee(sowDataId, employee),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sow-data'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useAddMilestone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sowDataId, milestone }: { sowDataId: string; milestone: any }) =>
      dashboardApi.addMilestone(sowDataId, milestone),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sow-data'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sowDataId, employeeId }: { sowDataId: string; employeeId: string }) =>
      dashboardApi.deleteEmployee(sowDataId, employeeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sow-data'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteMilestone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sowDataId, milestoneId }: { sowDataId: string; milestoneId: string }) =>
      dashboardApi.deleteMilestone(sowDataId, milestoneId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sow-data'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
