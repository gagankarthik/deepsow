'use client';

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { IssueCard } from './issue-card';
import { IssueDetailModal } from '@/components/issues/issue-detail-modal';
import { useUpdateIssue } from '@/hooks/use-issues';
import { KANBAN_COLUMNS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { Issue, KanbanColumn } from '@/types';

interface KanbanBoardProps {
  issues: Issue[];
}

export function KanbanBoard({ issues }: KanbanBoardProps) {
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const updateMutation = useUpdateIssue();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const getIssuesForColumn = (columnId: string) =>
    issues.filter((issue) => issue.kanban_column === columnId);

  const handleDragStart = (event: DragStartEvent) => {
    const issue = issues.find((i) => i.id === event.active.id);
    if (issue) {
      setActiveIssue(issue);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveIssue(null);

    if (!over) return;

    const activeIssue = issues.find((i) => i.id === active.id);
    if (!activeIssue) return;

    // Check if dropped on a column
    const targetColumn = KANBAN_COLUMNS.find((col) => col.id === over.id);
    if (targetColumn) {
      if (activeIssue.kanban_column !== targetColumn.id) {
        updateMutation.mutate({
          id: activeIssue.id,
          data: { kanban_column: targetColumn.id as KanbanColumn },
        });
      }
      return;
    }

    // Check if dropped on another issue
    const targetIssue = issues.find((i) => i.id === over.id);
    if (targetIssue && activeIssue.kanban_column !== targetIssue.kanban_column) {
      updateMutation.mutate({
        id: activeIssue.id,
        data: { kanban_column: targetIssue.kanban_column },
      });
    }
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {KANBAN_COLUMNS.map((column) => {
            const columnIssues = getIssuesForColumn(column.id);

            return (
              <div
                key={column.id}
                className="flex w-[300px] flex-shrink-0 flex-col"
              >
                <div
                  className={cn(
                    'mb-3 flex items-center justify-between rounded-t-lg px-3 py-2',
                    column.color
                  )}
                >
                  <h3 className="font-medium">{column.label}</h3>
                  <span className="rounded-full bg-white px-2 py-0.5 text-sm font-medium">
                    {columnIssues.length}
                  </span>
                </div>

                <ScrollArea className="flex-1">
                  <SortableContext
                    items={columnIssues.map((i) => i.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div
                      className="min-h-[200px] space-y-2 rounded-b-lg border-2 border-dashed border-gray-200 p-2"
                      id={column.id}
                    >
                      {columnIssues.length > 0 ? (
                        columnIssues.map((issue) => (
                          <IssueCard
                            key={issue.id}
                            issue={issue}
                            onClick={() => setSelectedIssue(issue)}
                          />
                        ))
                      ) : (
                        <div className="flex h-[100px] items-center justify-center text-sm text-gray-400">
                          Drop issues here
                        </div>
                      )}
                    </div>
                  </SortableContext>
                </ScrollArea>
              </div>
            );
          })}
        </div>

        <DragOverlay>
          {activeIssue && <IssueCard issue={activeIssue} />}
        </DragOverlay>
      </DndContext>

      <IssueDetailModal
        issue={selectedIssue}
        open={!!selectedIssue}
        onClose={() => setSelectedIssue(null)}
      />
    </>
  );
}
