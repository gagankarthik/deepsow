'use client';

import { useMemo, useState } from 'react';
import { format, differenceInDays, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isWeekend } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { TaskGanttView } from '@/types';

interface GanttChartProps {
  tasks: TaskGanttView[];
  onTaskClick?: (task: TaskGanttView) => void;
}

const TASK_STATUS_COLORS = {
  not_started: 'bg-gray-400',
  in_progress: 'bg-blue-500',
  completed: 'bg-green-500',
  on_hold: 'bg-yellow-500',
  cancelled: 'bg-red-400',
};

const TASK_PRIORITY_COLORS = {
  low: '#22c55e',
  medium: '#3b82f6',
  high: '#f97316',
  critical: '#ef4444',
};

const DAY_WIDTH = 40;
const ROW_HEIGHT = 44;
const HEADER_HEIGHT = 60;

export function GanttChart({ tasks, onTaskClick }: GanttChartProps) {
  const [hoveredTask, setHoveredTask] = useState<string | null>(null);

  const { startDate, endDate, totalDays, dates } = useMemo(() => {
    if (tasks.length === 0) {
      const today = new Date();
      const start = startOfWeek(today);
      const end = addDays(start, 30);
      return {
        startDate: start,
        endDate: end,
        totalDays: 31,
        dates: eachDayOfInterval({ start, end }),
      };
    }

    const allDates = tasks.flatMap((t) => [
      new Date(t.start_date),
      new Date(t.end_date),
    ]);
    const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map((d) => d.getTime())));

    // Add padding
    const start = addDays(startOfWeek(minDate), -7);
    const end = addDays(endOfWeek(maxDate), 7);
    const days = differenceInDays(end, start) + 1;

    return {
      startDate: start,
      endDate: end,
      totalDays: days,
      dates: eachDayOfInterval({ start, end }),
    };
  }, [tasks]);

  const getTaskPosition = (task: TaskGanttView) => {
    const taskStart = new Date(task.start_date);
    const taskEnd = new Date(task.end_date);
    const left = differenceInDays(taskStart, startDate) * DAY_WIDTH;
    const width = (differenceInDays(taskEnd, taskStart) + 1) * DAY_WIDTH;
    return { left, width };
  };

  const chartWidth = totalDays * DAY_WIDTH;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Timeline</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex">
          {/* Task Names Column */}
          <div className="w-[250px] flex-shrink-0 border-r">
            <div
              className="flex items-center border-b bg-gray-50 px-4 font-medium"
              style={{ height: HEADER_HEIGHT }}
            >
              Task Name
            </div>
            {tasks.map((task) => (
              <div
                key={task.id}
                className={cn(
                  'flex items-center border-b px-4 cursor-pointer hover:bg-gray-50 transition-colors',
                  hoveredTask === task.id && 'bg-blue-50'
                )}
                style={{ height: ROW_HEIGHT }}
                onMouseEnter={() => setHoveredTask(task.id)}
                onMouseLeave={() => setHoveredTask(null)}
                onClick={() => onTaskClick?.(task)}
              >
                <div className="flex-1 truncate">
                  <p className="font-medium text-sm truncate">{task.title}</p>
                  <p className="text-xs text-gray-500">{task.assigned_to || 'Unassigned'}</p>
                </div>
                <Badge
                  variant="outline"
                  className="ml-2 text-xs"
                  style={{
                    borderColor: TASK_PRIORITY_COLORS[task.priority as keyof typeof TASK_PRIORITY_COLORS],
                    color: TASK_PRIORITY_COLORS[task.priority as keyof typeof TASK_PRIORITY_COLORS],
                  }}
                >
                  {task.priority}
                </Badge>
              </div>
            ))}
            {tasks.length === 0 && (
              <div className="flex items-center justify-center h-[200px] text-gray-500">
                No tasks to display
              </div>
            )}
          </div>

          {/* Timeline */}
          <ScrollArea className="flex-1">
            <div style={{ width: chartWidth }}>
              {/* Date Headers */}
              <div
                className="flex border-b bg-gray-50"
                style={{ height: HEADER_HEIGHT }}
              >
                {dates.map((date, i) => {
                  const isFirstOfMonth = date.getDate() === 1;
                  const isToday =
                    format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

                  return (
                    <div
                      key={i}
                      className={cn(
                        'flex flex-col items-center justify-center border-r text-xs',
                        isWeekend(date) && 'bg-gray-100',
                        isToday && 'bg-blue-100'
                      )}
                      style={{ width: DAY_WIDTH }}
                    >
                      {isFirstOfMonth && (
                        <span className="font-medium text-gray-700">
                          {format(date, 'MMM')}
                        </span>
                      )}
                      <span
                        className={cn(
                          'font-medium',
                          isToday && 'text-blue-600'
                        )}
                      >
                        {format(date, 'd')}
                      </span>
                      <span className="text-gray-400">
                        {format(date, 'EEE').charAt(0)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Task Bars */}
              {tasks.map((task) => {
                const { left, width } = getTaskPosition(task);
                const statusColor =
                  task.color ||
                  TASK_STATUS_COLORS[task.status as keyof typeof TASK_STATUS_COLORS] ||
                  'bg-gray-400';

                return (
                  <div
                    key={task.id}
                    className={cn(
                      'relative border-b',
                      hoveredTask === task.id && 'bg-blue-50'
                    )}
                    style={{ height: ROW_HEIGHT }}
                    onMouseEnter={() => setHoveredTask(task.id)}
                    onMouseLeave={() => setHoveredTask(null)}
                  >
                    {/* Grid lines */}
                    <div className="absolute inset-0 flex">
                      {dates.map((date, i) => (
                        <div
                          key={i}
                          className={cn(
                            'border-r',
                            isWeekend(date) && 'bg-gray-50'
                          )}
                          style={{ width: DAY_WIDTH }}
                        />
                      ))}
                    </div>

                    {/* Task Bar */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            'absolute top-2 h-7 rounded cursor-pointer transition-all',
                            statusColor,
                            hoveredTask === task.id && 'ring-2 ring-blue-400'
                          )}
                          style={{
                            left: left + 2,
                            width: Math.max(width - 4, 20),
                          }}
                          onClick={() => onTaskClick?.(task)}
                        >
                          {/* Progress bar */}
                          <div
                            className="absolute inset-0 bg-black/20 rounded"
                            style={{ width: `${task.progress}%` }}
                          />
                          {/* Label */}
                          {width > 80 && (
                            <span className="absolute inset-0 flex items-center px-2 text-xs text-white font-medium truncate">
                              {task.title}
                            </span>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-sm">
                          <p className="font-medium">{task.title}</p>
                          <p className="text-gray-400">
                            {format(new Date(task.start_date), 'MMM d')} -{' '}
                            {format(new Date(task.end_date), 'MMM d, yyyy')}
                          </p>
                          <p>Progress: {task.progress}%</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>

                    {/* Dependencies arrows would go here */}
                  </div>
                );
              })}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
