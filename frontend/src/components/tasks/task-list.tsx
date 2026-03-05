'use client';

import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  User,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { useDeleteTask } from '@/hooks/use-tasks';
import { cn } from '@/lib/utils';
import type { Task } from '@/types';

interface TaskListProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
}

const STATUS_CONFIG = {
  not_started: { label: 'Not Started', icon: Clock, color: 'text-gray-500' },
  in_progress: { label: 'In Progress', icon: Clock, color: 'text-blue-500' },
  completed: { label: 'Completed', icon: CheckCircle2, color: 'text-green-500' },
  on_hold: { label: 'On Hold', icon: AlertTriangle, color: 'text-yellow-500' },
  cancelled: { label: 'Cancelled', icon: AlertTriangle, color: 'text-red-500' },
};

const PRIORITY_CONFIG = {
  low: { label: 'Low', color: 'bg-green-100 text-green-700' },
  medium: { label: 'Medium', color: 'bg-blue-100 text-blue-700' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-700' },
  critical: { label: 'Critical', color: 'bg-red-100 text-red-700' },
};

export function TaskList({ tasks, onEditTask }: TaskListProps) {
  const deleteMutation = useDeleteTask();

  const handleDelete = async (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteMutation.mutateAsync(taskId);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Tasks ({tasks.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          <div className="divide-y">
            {tasks.map((task) => {
              const statusConfig = STATUS_CONFIG[task.status];
              const priorityConfig = PRIORITY_CONFIG[task.priority];
              const StatusIcon = statusConfig.icon;

              return (
                <div
                  key={task.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <StatusIcon
                          className={cn('h-4 w-4', statusConfig.color)}
                        />
                        <h4 className="font-medium truncate">{task.title}</h4>
                      </div>

                      {task.description && (
                        <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                          {task.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                        <Badge
                          variant="outline"
                          className={priorityConfig.color}
                        >
                          {priorityConfig.label}
                        </Badge>

                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(task.start_date), 'MMM d')} -{' '}
                          {format(new Date(task.end_date), 'MMM d')}
                        </span>

                        {task.assigned_to && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {task.assigned_to}
                          </span>
                        )}
                      </div>

                      <div className="mt-2 flex items-center gap-2">
                        <Progress value={task.progress} className="h-2 flex-1" />
                        <span className="text-xs font-medium">
                          {task.progress}%
                        </span>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEditTask(task)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(task.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}

            {tasks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Calendar className="h-12 w-12 text-gray-300 mb-4" />
                <p>No tasks created yet</p>
                <p className="text-sm">Create your first task to get started</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
