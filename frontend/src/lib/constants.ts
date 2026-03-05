export const ABUSE_CATEGORIES = {
  intentional_scope_creep: {
    label: 'Intentional Scope Creep',
    description: 'Vague deliverables, undefined boundaries',
    color: 'bg-orange-500',
  },
  fabrication_of_documentation: {
    label: 'Fabrication of Documentation',
    description: 'Inconsistent timelines, contradictions',
    color: 'bg-red-500',
  },
  false_standards_compliance: {
    label: 'False Standards Compliance',
    description: 'Unverifiable compliance claims',
    color: 'bg-yellow-500',
  },
  gaming_the_audit: {
    label: 'Gaming the Audit',
    description: 'Restricted access clauses',
    color: 'bg-purple-500',
  },
  lack_of_independence: {
    label: 'Lack of Independence',
    description: 'Conflicts of interest',
    color: 'bg-pink-500',
  },
  inflated_staffing: {
    label: 'Inflated Staffing',
    description: 'Excessive team sizes',
    color: 'bg-blue-500',
  },
  unqualified_staff: {
    label: 'Unqualified Staff',
    description: 'Missing qualifications',
    color: 'bg-indigo-500',
  },
  omitted_critical_areas: {
    label: 'Omitted Critical Areas',
    description: 'Missing risk/security sections',
    color: 'bg-gray-500',
  },
} as const;

export const RISK_LEVELS = {
  low: {
    label: 'Low',
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-100',
  },
  medium: {
    label: 'Medium',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
  },
  high: {
    label: 'High',
    color: 'bg-orange-500',
    textColor: 'text-orange-700',
    bgColor: 'bg-orange-100',
  },
  critical: {
    label: 'Critical',
    color: 'bg-red-500',
    textColor: 'text-red-700',
    bgColor: 'bg-red-100',
  },
} as const;

export const ISSUE_STATUSES = {
  open: { label: 'Open', color: 'bg-blue-500' },
  in_review: { label: 'In Review', color: 'bg-yellow-500' },
  confirmed: { label: 'Confirmed', color: 'bg-orange-500' },
  resolved: { label: 'Resolved', color: 'bg-green-500' },
  dismissed: { label: 'Dismissed', color: 'bg-gray-500' },
} as const;

export const KANBAN_COLUMNS = [
  { id: 'identified', label: 'Identified', color: 'bg-blue-100' },
  { id: 'under_review', label: 'Under Review', color: 'bg-yellow-100' },
  { id: 'confirmed', label: 'Confirmed', color: 'bg-orange-100' },
  { id: 'remediation', label: 'Remediation', color: 'bg-purple-100' },
  { id: 'closed', label: 'Closed', color: 'bg-green-100' },
] as const;

export const RISK_COLORS = {
  low: '#22c55e',
  medium: '#eab308',
  high: '#f97316',
  critical: '#ef4444',
} as const;

export const CATEGORY_COLORS = [
  '#f97316', // orange
  '#ef4444', // red
  '#eab308', // yellow
  '#a855f7', // purple
  '#ec4899', // pink
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#6b7280', // gray
];
