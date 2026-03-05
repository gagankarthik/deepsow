'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GripVertical, MessageSquare, DollarSign } from 'lucide-react';
import { RISK_LEVELS, ABUSE_CATEGORIES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { Issue } from '@/types';

interface IssueCardProps {
  issue: Issue;
  onClick?: () => void;
}

export function IssueCard({ issue, onClick }: IssueCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: issue.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const riskConfig = RISK_LEVELS[issue.risk_level as keyof typeof RISK_LEVELS];
  const categoryConfig =
    ABUSE_CATEGORIES[issue.category as keyof typeof ABUSE_CATEGORIES];

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'cursor-pointer transition-shadow hover:shadow-md',
        isDragging && 'opacity-50 shadow-lg'
      )}
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="mb-2 flex items-start justify-between">
          <h4 className="text-sm font-medium leading-tight line-clamp-2">
            {issue.title}
          </h4>
          <button
            {...attributes}
            {...listeners}
            className="ml-2 cursor-grab touch-none text-gray-400 hover:text-gray-600"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-2 flex flex-wrap gap-1">
          <Badge
            variant="outline"
            className={`text-xs ${riskConfig?.bgColor} ${riskConfig?.textColor}`}
          >
            {riskConfig?.label || issue.risk_level}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {categoryConfig?.label?.split(' ')[0] || issue.category}
          </Badge>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            {issue.comments.length > 0 && (
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {issue.comments.length}
              </span>
            )}
            {issue.estimated_savings && (
              <span className="flex items-center gap-1 text-green-600">
                <DollarSign className="h-3 w-3" />
                {(issue.estimated_savings / 1000).toFixed(0)}k
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
