import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { IssueFilters, KanbanColumn } from '@/types';

interface AppState {
  // UI State
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // Issue Filters
  issueFilters: IssueFilters;
  setIssueFilters: (filters: IssueFilters) => void;
  clearIssueFilters: () => void;

  // Selected Issue for Modal
  selectedIssueId: string | null;
  setSelectedIssueId: (id: string | null) => void;

  // Settings
  settings: {
    analysisDepth: number; // 1-10 scale
    autoAnalyze: boolean;
    showEstimatedSavings: boolean;
    riskThreshold: 'low' | 'medium' | 'high';
  };
  updateSettings: (settings: Partial<AppState['settings']>) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // UI State
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      // Issue Filters
      issueFilters: {},
      setIssueFilters: (filters) =>
        set((state) => ({
          issueFilters: { ...state.issueFilters, ...filters },
        })),
      clearIssueFilters: () => set({ issueFilters: {} }),

      // Selected Issue
      selectedIssueId: null,
      setSelectedIssueId: (id) => set({ selectedIssueId: id }),

      // Settings
      settings: {
        analysisDepth: 7,
        autoAnalyze: false,
        showEstimatedSavings: true,
        riskThreshold: 'medium',
      },
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
    }),
    {
      name: 'sow-analyzer-storage',
      partialize: (state) => ({
        settings: state.settings,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);
