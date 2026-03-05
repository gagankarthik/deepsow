export interface DocumentMetadata {
  vendor_name: string;
  contract_value: number | null;
  contract_date: string | null;
  description: string | null;
}

export interface Document {
  id: string;
  filename: string;
  original_filename: string;
  file_size: number;
  file_type: string;
  metadata: DocumentMetadata;
  uploaded_at: string;
  has_text_content: boolean;
  analysis_id: string | null;
}

export interface AnalysisResponse {
  id: string;
  document_id: string;
  status: AnalysisStatus;
  progress: number;
  current_step: string;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
}

export type AnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Finding {
  id: string;
  category: string;
  title: string;
  description: string;
  evidence: string;
  risk_level: RiskLevel;
  estimated_savings: number | null;
  recommendation: string;
  page_reference: string | null;
}

export interface AnalysisResults {
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

export type IssueStatus = 'open' | 'in_review' | 'confirmed' | 'resolved' | 'dismissed';

export type KanbanColumn = 'identified' | 'under_review' | 'confirmed' | 'remediation' | 'closed';

export interface IssueComment {
  id: string;
  content: string;
  author: string;
  created_at: string;
}

export interface Issue {
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
  status: IssueStatus;
  kanban_column: KanbanColumn;
  priority: number;
  assigned_to: string | null;
  comments: IssueComment[];
  created_at: string;
  updated_at: string;
}

export interface IssueFilters {
  analysis_id?: string;
  status?: string;
  risk_level?: string;
  category?: string;
  kanban_column?: string;
}

export interface IssueUpdate {
  status?: IssueStatus;
  kanban_column?: KanbanColumn;
  priority?: number;
  assigned_to?: string;
}

export interface IssueStats {
  total_documents: number;
  total_analyses: number;
  total_issues: number;
  issues_by_status: Record<string, number>;
  issues_by_risk: Record<string, number>;
  issues_by_category: Record<string, number>;
}

export interface ComparisonDifference {
  aspect: string;
  document1: string;
  document2: string;
  recommendation: string;
}

export interface ComparisonResponse {
  key_differences: ComparisonDifference[];
  summary: string;
  recommendation: string;
}

// Task types
export type TaskStatus = 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';

export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
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

export interface TaskCreate {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
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

export interface TaskUpdate {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  start_date?: string;
  end_date?: string;
  progress?: number;
  assigned_to?: string;
  parent_id?: string;
  dependencies?: string[];
  color?: string;
}

export interface TaskFilters {
  status?: string;
  priority?: string;
  assigned_to?: string;
  analysis_id?: string;
  issue_id?: string;
}

export interface TaskGanttView {
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
