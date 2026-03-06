'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  FileText,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Target,
  ListTodo,
  Edit,
  Trash2,
  Plus,
  Filter,
  Briefcase,
} from 'lucide-react';
import Link from 'next/link';
import { useDocuments } from '@/hooks/use-documents';
import { useIssueStats, useIssues } from '@/hooks/use-issues';
import { useAnalyses } from '@/hooks/use-analysis';
import { useTasks } from '@/hooks/use-tasks';
import {
  useDashboardSummary,
  useSOWDataList,
  useUpdateEmployee,
  useUpdateMilestone,
  useDeleteEmployee,
  useDeleteMilestone,
  useAddEmployee,
  useAddMilestone,
} from '@/hooks/use-dashboard';
import { formatDistanceToNow, format } from 'date-fns';
import { RISK_LEVELS } from '@/lib/constants';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  Legend,
} from 'recharts';

const COLORS = ['#22c55e', '#eab308', '#f97316', '#ef4444'];
const BUDGET_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function DashboardPage() {
  const { data: documents, isLoading: docsLoading } = useDocuments();
  const { data: stats, isLoading: statsLoading } = useIssueStats();
  const { data: analyses, isLoading: analysesLoading } = useAnalyses();
  const { data: issues, isLoading: issuesLoading } = useIssues();
  const { data: tasks, isLoading: tasksLoading } = useTasks();
  const { data: dashboardSummary, isLoading: summaryLoading } = useDashboardSummary();
  const { data: sowDataList, isLoading: sowLoading } = useSOWDataList();

  const updateEmployee = useUpdateEmployee();
  const updateMilestone = useUpdateMilestone();
  const deleteEmployee = useDeleteEmployee();
  const deleteMilestone = useDeleteMilestone();
  const addEmployee = useAddEmployee();
  const addMilestone = useAddMilestone();

  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDocument, setFilterDocument] = useState<string>('all');
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [editingMilestone, setEditingMilestone] = useState<any>(null);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showAddMilestone, setShowAddMilestone] = useState(false);

  // Get analyzed documents for filter
  const analyzedDocuments = documents?.filter((doc) => doc.analysis_id) || [];

  const recentDocuments = documents?.slice(0, 5) || [];
  const recentIssues = issues?.slice(0, 5) || [];

  // Filter issues by document
  const filteredIssues = issues?.filter((issue) => {
    if (filterDocument !== 'all' && issue.document_id !== filterDocument) return false;
    if (filterRisk !== 'all' && issue.risk_level !== filterRisk) return false;
    if (filterStatus !== 'all' && issue.status !== filterStatus) return false;
    return true;
  }) || [];

  // Filter SOW data by document
  const filteredSOWData = filterDocument === 'all'
    ? sowDataList
    : sowDataList?.filter((sow) => sow.document_id === filterDocument);

  // Filter tasks by document (through analysis_id)
  const selectedAnalysisId = filterDocument !== 'all'
    ? documents?.find((d) => d.id === filterDocument)?.analysis_id
    : null;

  const filteredTasks = filterDocument === 'all'
    ? tasks
    : tasks?.filter((t) => t.analysis_id === selectedAnalysisId);

  const riskData = stats?.issues_by_risk
    ? Object.entries(stats.issues_by_risk).map(([key, value]) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value,
        color: RISK_LEVELS[key as keyof typeof RISK_LEVELS]?.color || '#6b7280',
      }))
    : [];

  const statusData = stats?.issues_by_status
    ? Object.entries(stats.issues_by_status).map(([key, value]) => ({
        name: key.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        value,
      }))
    : [];

  // Budget data from SOW (filtered)
  const budgetData = filteredSOWData?.flatMap((sow) =>
    sow.budget_items.map((item) => ({
      category: item.category,
      planned: item.planned_amount,
      actual: item.actual_amount,
    }))
  ) || [];

  // Phase progress data (filtered)
  const phaseData = filteredSOWData?.flatMap((sow) =>
    sow.phases.map((phase) => ({
      name: phase.name,
      progress: phase.progress,
      budget: phase.budget || 0,
      spent: phase.spent || 0,
    }))
  ) || [];

  // Milestone data (filtered)
  const milestoneData = filteredSOWData?.flatMap((sow) =>
    sow.milestones.map((ms) => ({
      ...ms,
      sowDataId: sow.id,
    }))
  ) || [];

  // Employee data (filtered)
  const employeeData = filteredSOWData?.flatMap((sow) =>
    sow.employees.map((emp) => ({
      ...emp,
      sowDataId: sow.id,
    }))
  ) || [];

  // Task data from SOW (filtered)
  const taskData = filteredSOWData?.flatMap((sow) => sow.tasks) || [];

  // Calculate totals (filtered)
  const totalBudget = filteredSOWData?.reduce((sum, sow) => sum + (sow.total_budget || 0), 0) || 0;
  const totalSpent = filteredSOWData?.reduce((sum, sow) => sum + (sow.spent_to_date || 0), 0) || 0;
  const overallProgress =
    filteredSOWData && filteredSOWData.length > 0
      ? Math.round(filteredSOWData.reduce((sum, sow) => sum + sow.overall_progress, 0) / filteredSOWData.length)
      : 0;

  const handleSaveEmployee = (employee: any) => {
    if (employee.sowDataId && employee.id) {
      updateEmployee.mutate({
        sowDataId: employee.sowDataId,
        employeeId: employee.id,
        data: {
          name: employee.name,
          role: employee.role,
          qualification: employee.qualification,
          rate: employee.rate,
          hours_allocated: employee.hours_allocated,
          department: employee.department,
        },
      });
    }
    setEditingEmployee(null);
  };

  const handleSaveMilestone = (milestone: any) => {
    if (milestone.sowDataId && milestone.id) {
      updateMilestone.mutate({
        sowDataId: milestone.sowDataId,
        milestoneId: milestone.id,
        data: {
          name: milestone.name,
          description: milestone.description,
          progress: milestone.progress,
          status: milestone.status,
        },
      });
    }
    setEditingMilestone(null);
  };

  const handleDeleteEmployee = (sowDataId: string, employeeId: string) => {
    deleteEmployee.mutate({ sowDataId, employeeId });
  };

  const handleDeleteMilestone = (sowDataId: string, milestoneId: string) => {
    deleteMilestone.mutate({ sowDataId, milestoneId });
  };

  return (
    <div className="flex flex-col">
      <Header title="Dashboard" />
      <div className="flex-1 p-6 space-y-6">
        {/* Document Filter */}
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filter by Document:</span>
              </div>
              <Select value={filterDocument} onValueChange={setFilterDocument}>
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="Select document" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Documents</SelectItem>
                  {analyzedDocuments.map((doc) => (
                    <SelectItem key={doc.id} value={doc.id}>
                      {doc.original_filename} - {doc.metadata.vendor_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {filterDocument !== 'all' && (
                <Button variant="ghost" size="sm" onClick={() => setFilterDocument('all')}>
                  Clear Filter
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              {sowLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold text-green-600">
                  ${totalBudget.toLocaleString()}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Spent</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              {sowLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold text-blue-600">
                  ${totalSpent.toLocaleString()}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Employees</CardTitle>
              <Users className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              {sowLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold text-purple-600">{employeeData.length}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Milestones</CardTitle>
              <Target className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              {sowLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold text-orange-600">
                  {milestoneData.filter((m) => m.status === 'completed').length}/
                  {milestoneData.length}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Tasks</CardTitle>
              <ListTodo className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              {tasksLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold text-indigo-600">
                  {filteredTasks?.filter((t) => t.status === 'completed').length || 0}/{filteredTasks?.length || 0}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Issues</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              {statsLoading || issuesLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold text-red-600">
                  {filteredIssues.filter((i) => i.risk_level === 'critical').length} critical
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Overall Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Overall Project Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span className="font-medium">{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Budget Overview Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Budget Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {sowLoading ? (
                <Skeleton className="h-[250px]" />
              ) : budgetData.length > 0 ? (
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={budgetData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                      <YAxis />
                      <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                      <Legend />
                      <Bar dataKey="planned" name="Planned" fill="#3b82f6" />
                      <Bar dataKey="actual" name="Actual" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-[250px] items-center justify-center text-gray-500">
                  No budget data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Phase Progress Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Phase Progress</CardTitle>
            </CardHeader>
            <CardContent>
              {sowLoading ? (
                <Skeleton className="h-[250px]" />
              ) : phaseData.length > 0 ? (
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={phaseData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(value: number) => `${value}%`} />
                      <Bar dataKey="progress" fill="#8b5cf6" name="Progress %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-[250px] items-center justify-center text-gray-500">
                  No phase data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Second Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Issues by Risk */}
          <Card>
            <CardHeader>
              <CardTitle>Issues by Risk Level</CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-[250px]" />
              ) : riskData.length > 0 ? (
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={riskData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {riskData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-[250px] items-center justify-center text-gray-500">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Issues by Status */}
          <Card>
            <CardHeader>
              <CardTitle>Issues by Status</CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-[250px]" />
              ) : statusData.length > 0 ? (
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-[250px] items-center justify-center text-gray-500">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Employees Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Members
            </CardTitle>
            <Dialog open={showAddEmployee} onOpenChange={setShowAddEmployee}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Employee
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Employee</DialogTitle>
                </DialogHeader>
                <AddEmployeeForm
                  sowDataId={sowDataList?.[0]?.id || ''}
                  onSave={(employee) => {
                    if (sowDataList?.[0]?.id) {
                      addEmployee.mutate({ sowDataId: sowDataList[0].id, employee });
                    }
                    setShowAddEmployee(false);
                  }}
                  onCancel={() => setShowAddEmployee(false)}
                />
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {sowLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : employeeData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-gray-500">
                      <th className="pb-3 font-medium">Name</th>
                      <th className="pb-3 font-medium">Role</th>
                      <th className="pb-3 font-medium">Qualification</th>
                      <th className="pb-3 font-medium">Rate</th>
                      <th className="pb-3 font-medium">Hours</th>
                      <th className="pb-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employeeData.map((emp) => (
                      <tr key={emp.id} className="border-b">
                        <td className="py-3 font-medium">{emp.name}</td>
                        <td className="py-3">
                          <Badge variant="outline">{emp.role}</Badge>
                        </td>
                        <td className="py-3 text-sm text-gray-600">
                          {emp.qualification || '-'}
                        </td>
                        <td className="py-3">{emp.rate ? `$${emp.rate}/hr` : '-'}</td>
                        <td className="py-3">{emp.hours_allocated || '-'}</td>
                        <td className="py-3">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingEmployee(emp)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteEmployee(emp.sowDataId, emp.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <Users className="mb-2 h-12 w-12 text-gray-300" />
                <p>No team members found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Employee Edit Dialog */}
        <Dialog open={!!editingEmployee} onOpenChange={() => setEditingEmployee(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Employee</DialogTitle>
            </DialogHeader>
            {editingEmployee && (
              <EditEmployeeForm
                employee={editingEmployee}
                onSave={handleSaveEmployee}
                onCancel={() => setEditingEmployee(null)}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Milestones Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Milestones
            </CardTitle>
            <Dialog open={showAddMilestone} onOpenChange={setShowAddMilestone}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Milestone
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Milestone</DialogTitle>
                </DialogHeader>
                <AddMilestoneForm
                  sowDataId={sowDataList?.[0]?.id || ''}
                  onSave={(milestone) => {
                    if (sowDataList?.[0]?.id) {
                      addMilestone.mutate({ sowDataId: sowDataList[0].id, milestone });
                    }
                    setShowAddMilestone(false);
                  }}
                  onCancel={() => setShowAddMilestone(false)}
                />
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {sowLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
            ) : milestoneData.length > 0 ? (
              <div className="space-y-4">
                {milestoneData.map((ms) => (
                  <div key={ms.id} className="rounded-lg border p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{ms.name}</h4>
                          <Badge
                            variant="outline"
                            className={
                              ms.status === 'completed'
                                ? 'bg-green-50 text-green-700'
                                : ms.status === 'in_progress'
                                  ? 'bg-blue-50 text-blue-700'
                                  : ms.status === 'delayed'
                                    ? 'bg-red-50 text-red-700'
                                    : 'bg-gray-50 text-gray-700'
                            }
                          >
                            {ms.status}
                          </Badge>
                        </div>
                        {ms.description && (
                          <p className="mt-1 text-sm text-gray-600">{ms.description}</p>
                        )}
                        {ms.due_date && (
                          <p className="mt-1 text-sm text-gray-500">
                            <Calendar className="mr-1 inline h-3 w-3" />
                            Due: {format(new Date(ms.due_date), 'MMM d, yyyy')}
                          </p>
                        )}
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Progress</span>
                            <span>{ms.progress}%</span>
                          </div>
                          <Progress value={ms.progress} className="mt-1 h-2" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingMilestone(ms)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteMilestone(ms.sowDataId, ms.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <Target className="mb-2 h-12 w-12 text-gray-300" />
                <p>No milestones found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Milestone Edit Dialog */}
        <Dialog open={!!editingMilestone} onOpenChange={() => setEditingMilestone(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Milestone</DialogTitle>
            </DialogHeader>
            {editingMilestone && (
              <EditMilestoneForm
                milestone={editingMilestone}
                onSave={handleSaveMilestone}
                onCancel={() => setEditingMilestone(null)}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Tasks Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ListTodo className="h-5 w-5" />
              Project Tasks
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/tasks">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {sowLoading || tasksLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : (filteredTasks && filteredTasks.length > 0) || taskData.length > 0 ? (
              <div className="space-y-3">
                {[...(filteredTasks || []).slice(0, 5), ...taskData.slice(0, 5)].slice(0, 5).map((task, index) => (
                  <div
                    key={task.id || index}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{task.title}</p>
                      {task.assigned_to && (
                        <p className="text-sm text-gray-500">Assigned: {task.assigned_to}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24">
                        <Progress value={task.progress} className="h-2" />
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          task.status === 'completed'
                            ? 'bg-green-50 text-green-700'
                            : task.status === 'in_progress'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-gray-50 text-gray-700'
                        }
                      >
                        {String(task.status).replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <ListTodo className="mb-2 h-12 w-12 text-gray-300" />
                <p>No tasks found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Filters and Issues Section */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Issues
              </CardTitle>
              <div className="flex gap-2">
                <Select value={filterRisk} onValueChange={setFilterRisk}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Risk Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Risks</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_review">In Review</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="dismissed">Dismissed</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/issues">
                    View all
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {issuesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : filteredIssues.length > 0 ? (
              <div className="space-y-3">
                {filteredIssues.slice(0, 5).map((issue) => {
                  const riskConfig =
                    RISK_LEVELS[issue.risk_level as keyof typeof RISK_LEVELS] ||
                    RISK_LEVELS.medium;

                  return (
                    <div
                      key={issue.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{issue.title}</p>
                        <p className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(issue.created_at), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`${riskConfig.bgColor} ${riskConfig.textColor}`}
                      >
                        {riskConfig.label}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <AlertTriangle className="mb-2 h-12 w-12 text-gray-300" />
                <p>No issues found matching filters</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Documents */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Documents
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/upload">
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {docsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : recentDocuments.length > 0 ? (
              <div className="space-y-3">
                {recentDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="font-medium">{doc.original_filename}</p>
                        <p className="text-sm text-gray-500">{doc.metadata.vendor_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.analysis_id ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Analyzed
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                          <Clock className="mr-1 h-3 w-3" />
                          Pending
                        </Badge>
                      )}
                      {doc.analysis_id && (
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/analysis/${doc.analysis_id}`}>
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <FileText className="mb-2 h-12 w-12 text-gray-300" />
                <p>No documents uploaded yet</p>
                <Button className="mt-4" asChild>
                  <Link href="/upload">Upload your first document</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Edit Employee Form Component
function EditEmployeeForm({
  employee,
  onSave,
  onCancel,
}: {
  employee: any;
  onSave: (employee: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    ...employee,
  });

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Name</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>
      <div>
        <label className="text-sm font-medium">Role</label>
        <Input
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
        />
      </div>
      <div>
        <label className="text-sm font-medium">Qualification</label>
        <Input
          value={formData.qualification || ''}
          onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Rate ($/hr)</label>
          <Input
            type="number"
            value={formData.rate || ''}
            onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) || null })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Hours Allocated</label>
          <Input
            type="number"
            value={formData.hours_allocated || ''}
            onChange={(e) =>
              setFormData({ ...formData, hours_allocated: parseFloat(e.target.value) || null })
            }
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSave(formData)}>Save</Button>
      </div>
    </div>
  );
}

// Add Employee Form Component
function AddEmployeeForm({
  sowDataId,
  onSave,
  onCancel,
}: {
  sowDataId: string;
  onSave: (employee: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    qualification: '',
    rate: null as number | null,
    hours_allocated: null as number | null,
    department: '',
  });

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Name</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Employee name"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Role</label>
        <Input
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          placeholder="Job title"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Qualification</label>
        <Input
          value={formData.qualification}
          onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
          placeholder="Education, certifications"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Rate ($/hr)</label>
          <Input
            type="number"
            value={formData.rate || ''}
            onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) || null })}
            placeholder="0"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Hours Allocated</label>
          <Input
            type="number"
            value={formData.hours_allocated || ''}
            onChange={(e) =>
              setFormData({ ...formData, hours_allocated: parseFloat(e.target.value) || null })
            }
            placeholder="0"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSave(formData)} disabled={!formData.name || !formData.role}>
          Add Employee
        </Button>
      </div>
    </div>
  );
}

// Edit Milestone Form Component
function EditMilestoneForm({
  milestone,
  onSave,
  onCancel,
}: {
  milestone: any;
  onSave: (milestone: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    ...milestone,
  });

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Name</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>
      <div>
        <label className="text-sm font-medium">Description</label>
        <Input
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
      <div>
        <label className="text-sm font-medium">Progress (%)</label>
        <Input
          type="number"
          min="0"
          max="100"
          value={formData.progress}
          onChange={(e) =>
            setFormData({ ...formData, progress: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })
          }
        />
      </div>
      <div>
        <label className="text-sm font-medium">Status</label>
        <Select
          value={formData.status}
          onValueChange={(value) => setFormData({ ...formData, status: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="delayed">Delayed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSave(formData)}>Save</Button>
      </div>
    </div>
  );
}

// Add Milestone Form Component
function AddMilestoneForm({
  sowDataId,
  onSave,
  onCancel,
}: {
  sowDataId: string;
  onSave: (milestone: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    progress: 0,
    status: 'pending',
    due_date: '',
    deliverables: [] as string[],
  });

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Name</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Milestone name"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Description</label>
        <Input
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Description"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Due Date</label>
        <Input
          type="date"
          value={formData.due_date}
          onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
        />
      </div>
      <div>
        <label className="text-sm font-medium">Status</label>
        <Select
          value={formData.status}
          onValueChange={(value) => setFormData({ ...formData, status: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="delayed">Delayed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSave(formData)} disabled={!formData.name}>
          Add Milestone
        </Button>
      </div>
    </div>
  );
}
