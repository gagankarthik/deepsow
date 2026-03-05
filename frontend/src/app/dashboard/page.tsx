'use client';

import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FileText,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { useDocuments } from '@/hooks/use-documents';
import { useIssueStats, useIssues } from '@/hooks/use-issues';
import { useAnalyses } from '@/hooks/use-analysis';
import { formatDistanceToNow } from 'date-fns';
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
} from 'recharts';

const COLORS = ['#22c55e', '#eab308', '#f97316', '#ef4444'];

export default function DashboardPage() {
  const { data: documents, isLoading: docsLoading } = useDocuments();
  const { data: stats, isLoading: statsLoading } = useIssueStats();
  const { data: analyses, isLoading: analysesLoading } = useAnalyses();
  const { data: issues, isLoading: issuesLoading } = useIssues();

  const recentDocuments = documents?.slice(0, 5) || [];
  const recentIssues = issues?.slice(0, 5) || [];

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

  return (
    <div className="flex flex-col">
      <Header title="Dashboard" />
      <div className="flex-1 p-6">
        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Documents
              </CardTitle>
              <FileText className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              {docsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">
                  {stats?.total_documents || 0}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Analyses
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">
                  {stats?.total_analyses || 0}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Issues
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">
                  {stats?.total_issues || 0}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Critical Issues
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold text-red-600">
                  {stats?.issues_by_risk?.critical || 0}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Risk Distribution Chart */}
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

          {/* Issues by Status Chart */}
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

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Recent Documents */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Documents</CardTitle>
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
                          <p className="text-sm text-gray-500">
                            {doc.metadata.vendor_name}
                          </p>
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

          {/* Recent Issues */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Issues</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/issues">
                  View all
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {issuesLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : recentIssues.length > 0 ? (
                <div className="space-y-3">
                  {recentIssues.map((issue) => {
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
                  <p>No issues found yet</p>
                  <p className="mt-1 text-sm">
                    Upload and analyze documents to identify issues
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
