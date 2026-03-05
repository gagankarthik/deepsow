'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { IssuesTable } from '@/components/issues/issues-table';
import { IssueDetailModal } from '@/components/issues/issue-detail-modal';
import { useIssues } from '@/hooks/use-issues';
import { Skeleton } from '@/components/ui/skeleton';
import type { Issue } from '@/types';

export default function IssuesPage() {
  const { data: issues, isLoading } = useIssues();
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  return (
    <div className="flex flex-col">
      <Header title="Issues" />
      <div className="flex-1 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Issue Management</h2>
          <p className="mt-2 text-gray-600">
            View and manage all identified issues from SOW document analyses.
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        ) : (
          <IssuesTable
            issues={issues || []}
            onSelectIssue={setSelectedIssue}
          />
        )}

        <IssueDetailModal
          issue={selectedIssue}
          open={!!selectedIssue}
          onClose={() => setSelectedIssue(null)}
        />
      </div>
    </div>
  );
}
