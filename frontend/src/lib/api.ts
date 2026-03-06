const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;

  let url = `${API_BASE_URL}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
      throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Connection error. Please ensure the backend server is running on http://localhost:8000');
    }
    throw error;
  }
}

// Document API
export const documentsApi = {
  upload: async (formData: FormData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/documents/upload`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
        throw new Error(error.detail);
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Connection error. Please start the backend server:\n\ncd backend && uvicorn main:app --reload');
      }
      throw error;
    }
  },

  list: () => fetchApi<Document[]>('/documents'),

  get: (id: string) => fetchApi<Document>(`/documents/${id}`),

  delete: (id: string) =>
    fetchApi(`/documents/${id}`, { method: 'DELETE' }),
};

// Analysis API
export const analysisApi = {
  start: (documentId: string) =>
    fetchApi<AnalysisResponse>(`/analysis/start/${documentId}`, { method: 'POST' }),

  getStatus: (analysisId: string) =>
    fetchApi<AnalysisResponse>(`/analysis/${analysisId}/status`),

  getResults: (analysisId: string) =>
    fetchApi<AnalysisResults>(`/analysis/${analysisId}/results`),

  list: () => fetchApi<AnalysisResponse[]>('/analysis'),
};

// Issues API
export const issuesApi = {
  list: (filters?: IssueFilters) =>
    fetchApi<Issue[]>('/issues', { params: filters as Record<string, string> }),

  get: (id: string) => fetchApi<Issue>(`/issues/${id}`),

  update: (id: string, data: IssueUpdate) =>
    fetchApi<Issue>(`/issues/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  addComment: (id: string, content: string, author?: string) =>
    fetchApi<Issue>(`/issues/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content, author: author || 'User' }),
    }),

  delete: (id: string) =>
    fetchApi(`/issues/${id}`, { method: 'DELETE' }),

  getStats: () => fetchApi<IssueStats>('/issues/stats/summary'),
};

// Comparison API
export const comparisonApi = {
  compare: (documentId1: string, documentId2: string) =>
    fetchApi<ComparisonResponse>('/comparison', {
      method: 'POST',
      body: JSON.stringify({
        document_id_1: documentId1,
        document_id_2: documentId2,
      }),
    }),
};

// Export API
export const exportApi = {
  pdf: async (analysisId: string, includeDetails = true) => {
    const response = await fetch(`${API_BASE_URL}/export/pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analysis_id: analysisId, include_details: includeDetails }),
    });
    if (!response.ok) throw new Error('Export failed');
    return response.blob();
  },

  excel: async (analysisId: string, includeDetails = true) => {
    const response = await fetch(`${API_BASE_URL}/export/excel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analysis_id: analysisId, include_details: includeDetails }),
    });
    if (!response.ok) throw new Error('Export failed');
    return response.blob();
  },
};

// Tasks API
export const tasksApi = {
  list: (filters?: TaskFilters) =>
    fetchApi<Task[]>('/tasks', { params: filters as Record<string, string> }),

  get: (id: string) => fetchApi<Task>(`/tasks/${id}`),

  create: (data: TaskCreate) =>
    fetchApi<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: TaskUpdate) =>
    fetchApi<Task>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchApi(`/tasks/${id}`, { method: 'DELETE' }),

  getGantt: () => fetchApi<TaskGanttView[]>('/tasks/gantt'),

  getSubtasks: (id: string) => fetchApi<Task[]>(`/tasks/${id}/subtasks`),

  createFromIssue: (issueId: string, data: TaskCreate) =>
    fetchApi<Task>(`/tasks/from-issue/${issueId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Types
interface Document {
  id: string;
  filename: string;
  original_filename: string;
  file_size: number;
  file_type: string;
  metadata: {
    vendor_name: string;
    contract_value: number | null;
    contract_date: string | null;
    description: string | null;
  };
  uploaded_at: string;
  has_text_content: boolean;
  analysis_id: string | null;
}

interface AnalysisResponse {
  id: string;
  document_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  current_step: string;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
}

interface Finding {
  id: string;
  category: string;
  title: string;
  description: string;
  evidence: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  estimated_savings: number | null;
  recommendation: string;
  page_reference: string | null;
}

interface AnalysisResults {
  id: string;
  document_id: string;
  status: string;
  findings: Finding[];
  summary: string | null;
  total_estimated_savings: number | null;
  risk_score: number | null;
  category_breakdown: Record<string, number>;
  risk_breakdown: Record<string, number>;
}

interface Issue {
  id: string;
  analysis_id: string;
  document_id: string;
  finding_id: string;
  category: string;
  title: string;
  description: string;
  evidence: string;
  risk_level: string;
  estimated_savings: number | null;
  recommendation: string;
  page_reference: string | null;
  status: 'open' | 'in_review' | 'confirmed' | 'resolved' | 'dismissed';
  kanban_column: 'identified' | 'under_review' | 'confirmed' | 'remediation' | 'closed';
  priority: number;
  assigned_to: string | null;
  comments: IssueComment[];
  created_at: string;
  updated_at: string;
}

interface IssueComment {
  id: string;
  content: string;
  author: string;
  created_at: string;
}

interface IssueFilters {
  analysis_id?: string;
  status?: string;
  risk_level?: string;
  category?: string;
  kanban_column?: string;
}

interface IssueUpdate {
  status?: string;
  kanban_column?: string;
  priority?: number;
  assigned_to?: string;
}

interface IssueStats {
  total_documents: number;
  total_analyses: number;
  total_issues: number;
  issues_by_status: Record<string, number>;
  issues_by_risk: Record<string, number>;
  issues_by_category: Record<string, number>;
}

interface ComparisonDifference {
  aspect: string;
  document1: string;
  document2: string;
  recommendation: string;
}

interface ComparisonResponse {
  key_differences: ComparisonDifference[];
  summary: string;
  recommendation: string;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  start_date: string;
  end_date: string;
  progress: number;
  assigned_to: string | null;
  parent_id: string | null;
  dependencies: string[];
  issue_id: string | null;
  analysis_id: string | null;
  color: string | null;
  created_at: string;
  updated_at: string;
}

interface TaskCreate {
  title: string;
  description?: string;
  status?: 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  start_date: string;
  end_date: string;
  progress?: number;
  assigned_to?: string;
  parent_id?: string;
  dependencies?: string[];
  issue_id?: string;
  analysis_id?: string;
  color?: string;
}

interface TaskUpdate {
  title?: string;
  description?: string;
  status?: 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  start_date?: string;
  end_date?: string;
  progress?: number;
  assigned_to?: string;
  parent_id?: string;
  dependencies?: string[];
  color?: string;
}

interface TaskFilters {
  status?: string;
  priority?: string;
  assigned_to?: string;
  analysis_id?: string;
  issue_id?: string;
}

interface TaskGanttView {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  progress: number;
  status: string;
  priority: string;
  dependencies: string[];
  parent_id: string | null;
  color: string | null;
  assigned_to: string | null;
}

// SOW Data Types
interface Employee {
  id: string;
  name: string;
  role: string;
  qualification: string | null;
  rate: number | null;
  hours_allocated: number | null;
  department: string | null;
}

interface Milestone {
  id: string;
  name: string;
  description: string | null;
  due_date: string | null;
  progress: number;
  status: string;
  deliverables: string[];
}

interface ProjectPhase {
  id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
  progress: number;
  budget: number | null;
  spent: number | null;
}

interface BudgetItem {
  id: string;
  category: string;
  description: string | null;
  planned_amount: number;
  actual_amount: number;
  variance: number;
}

interface SOWData {
  id: string;
  document_id: string;
  project_name: string | null;
  project_description: string | null;
  start_date: string | null;
  end_date: string | null;
  duration_days: number | null;
  total_budget: number | null;
  spent_to_date: number | null;
  remaining_budget: number | null;
  budget_items: BudgetItem[];
  employees: Employee[];
  total_fte: number | null;
  labor_cost: number | null;
  milestones: Milestone[];
  phases: ProjectPhase[];
  tasks: SOWTask[];
  overall_progress: number;
}

interface SOWTask {
  title: string;
  description: string;
  assigned_to: string | null;
  status: string;
  priority: string;
  start_date: string | null;
  end_date: string | null;
  progress: number;
}

interface DashboardSummary {
  total_projects: number;
  total_budget: number;
  total_spent: number;
  budget_remaining: number;
  total_employees: number;
  total_milestones: number;
  milestones_completed: number;
  total_tasks: number;
  tasks_completed: number;
  total_issues: number;
  critical_issues: number;
  employees: Employee[];
  recent_milestones: Milestone[];
  phases: ProjectPhase[];
}

// Dashboard API
export const dashboardApi = {
  getSummary: () => fetchApi<DashboardSummary>('/dashboard/summary'),

  listSOWData: () => fetchApi<SOWData[]>('/dashboard/sow-data'),

  getSOWData: (id: string) => fetchApi<SOWData>(`/dashboard/sow-data/${id}`),

  getSOWDataByDocument: (documentId: string) =>
    fetchApi<SOWData>(`/dashboard/sow-data/by-document/${documentId}`),

  getSOWDataByAnalysis: (analysisId: string) =>
    fetchApi<SOWData>(`/dashboard/sow-data/by-analysis/${analysisId}`),

  updateSOWData: (id: string, data: Partial<SOWData>) =>
    fetchApi<SOWData>(`/dashboard/sow-data/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  updateEmployee: (sowDataId: string, employeeId: string, data: Partial<Employee>) =>
    fetchApi(`/dashboard/sow-data/${sowDataId}/employee/${employeeId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  updateMilestone: (sowDataId: string, milestoneId: string, data: Partial<Milestone>) =>
    fetchApi(`/dashboard/sow-data/${sowDataId}/milestone/${milestoneId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  addEmployee: (sowDataId: string, employee: Partial<Employee>) =>
    fetchApi(`/dashboard/sow-data/${sowDataId}/employee`, {
      method: 'POST',
      body: JSON.stringify(employee),
    }),

  addMilestone: (sowDataId: string, milestone: Partial<Milestone>) =>
    fetchApi(`/dashboard/sow-data/${sowDataId}/milestone`, {
      method: 'POST',
      body: JSON.stringify(milestone),
    }),

  deleteEmployee: (sowDataId: string, employeeId: string) =>
    fetchApi(`/dashboard/sow-data/${sowDataId}/employee/${employeeId}`, {
      method: 'DELETE',
    }),

  deleteMilestone: (sowDataId: string, milestoneId: string) =>
    fetchApi(`/dashboard/sow-data/${sowDataId}/milestone/${milestoneId}`, {
      method: 'DELETE',
    }),
};
