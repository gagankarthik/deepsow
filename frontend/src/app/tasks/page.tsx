'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { GanttChart } from '@/components/tasks/gantt-chart';
import { TaskList } from '@/components/tasks/task-list';
import { TaskForm } from '@/components/tasks/task-form';
import { useTasks, useGanttTasks } from '@/hooks/use-tasks';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, BarChart3, List } from 'lucide-react';
import type { Task, TaskGanttView } from '@/types';

export default function TasksPage() {
  const { data: tasks, isLoading: tasksLoading } = useTasks();
  const { data: ganttTasks, isLoading: ganttLoading } = useGanttTasks();
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleGanttTaskClick = (ganttTask: TaskGanttView) => {
    const task = tasks?.find((t) => t.id === ganttTask.id);
    if (task) {
      handleEditTask(task);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Tasks & Timeline" />
      <div className="flex-1 p-6 overflow-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Project Tasks</h2>
            <p className="mt-2 text-gray-600">
              Manage tasks and view the project timeline with Gantt chart.
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>

        <Tabs defaultValue="gantt" className="space-y-4">
          <TabsList>
            <TabsTrigger value="gantt" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Gantt Chart
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              List View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gantt">
            {ganttLoading ? (
              <Skeleton className="h-[400px]" />
            ) : (
              <GanttChart
                tasks={ganttTasks || []}
                onTaskClick={handleGanttTaskClick}
              />
            )}
          </TabsContent>

          <TabsContent value="list">
            {tasksLoading ? (
              <Skeleton className="h-[400px]" />
            ) : (
              <TaskList tasks={tasks || []} onEditTask={handleEditTask} />
            )}
          </TabsContent>
        </Tabs>

        <TaskForm
          task={editingTask}
          open={showForm}
          onClose={handleCloseForm}
        />
      </div>
    </div>
  );
}
