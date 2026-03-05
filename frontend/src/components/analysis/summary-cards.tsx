'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, DollarSign, Shield, FileSearch } from 'lucide-react';
import type { AnalysisResults } from '@/types';

interface SummaryCardsProps {
  results: AnalysisResults;
}

export function SummaryCards({ results }: SummaryCardsProps) {
  const totalIssues = results.findings.length;
  const criticalCount = results.risk_breakdown['critical'] || 0;
  const highCount = results.risk_breakdown['high'] || 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Total Issues
          </CardTitle>
          <FileSearch className="h-4 w-4 text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalIssues}</div>
          <p className="text-xs text-gray-500">findings identified</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Risk Score
          </CardTitle>
          <Shield className="h-4 w-4 text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {results.risk_score ?? 'N/A'}
            <span className="text-sm font-normal text-gray-500">/100</span>
          </div>
          <p className="text-xs text-gray-500">overall risk assessment</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Critical/High
          </CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {criticalCount + highCount}
          </div>
          <p className="text-xs text-gray-500">
            {criticalCount} critical, {highCount} high
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Est. Savings
          </CardTitle>
          <DollarSign className="h-4 w-4 text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {results.total_estimated_savings
              ? `$${results.total_estimated_savings.toLocaleString()}`
              : 'N/A'}
          </div>
          <p className="text-xs text-gray-500">potential cost savings</p>
        </CardContent>
      </Card>
    </div>
  );
}
