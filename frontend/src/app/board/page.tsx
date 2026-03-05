'use client';

import { Header } from '@/components/layout/header';
import { KanbanBoard } from '@/components/board/kanban-board';
import { useIssues } from '@/hooks/use-issues';
import { Skeleton } from '@/components/ui/skeleton';
import { Kanban } from 'lucide-react';

export default function BoardPage() {
  const { data: issues, isLoading } = useIssues();

  return (
    <div className="flex flex-col h-full">
      <Header title="Kanban Board" />
      <div className="flex-1 p-6 overflow-hidden">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Issue Board</h2>
          <p className="mt-2 text-gray-600">
            Drag and drop issues between columns to update their status.
          </p>
        </div>

        {isLoading ? (
          <div className="flex gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-[300px] flex-shrink-0">
                <Skeleton className="h-10 mb-3" />
                <Skeleton className="h-[400px]" />
              </div>
            ))}
          </div>
        ) : issues && issues.length > 0 ? (
          <KanbanBoard issues={issues} />
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <Kanban className="mb-4 h-16 w-16 text-gray-300" />
            <p className="text-lg font-medium">No issues to display</p>
            <p className="mt-2 text-sm">
              Upload and analyze documents to generate issues for the board.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
