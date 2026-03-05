'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { ProcessingStatus } from '@/components/analysis/processing-status';
import { SummaryCards } from '@/components/analysis/summary-cards';
import { RiskChart } from '@/components/analysis/risk-chart';
import { FindingsList } from '@/components/analysis/findings-list';
import { useAnalysisStatus, useAnalysisResults } from '@/hooks/use-analysis';
import { useDocument } from '@/hooks/use-documents';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, FileText, ArrowLeft } from 'lucide-react';
import { exportApi } from '@/lib/api';
import Link from 'next/link';

interface AnalysisPageProps {
  params: Promise<{ id: string }>;
}

export default function AnalysisPage({ params }: AnalysisPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [showResults, setShowResults] = useState(false);

  const { data: status, isLoading: statusLoading } = useAnalysisStatus(id);
  const { data: results, isLoading: resultsLoading } = useAnalysisResults(
    id,
    status?.status === 'completed'
  );
  const { data: documentData } = useDocument(status?.document_id || '');

  useEffect(() => {
    if (status?.status === 'completed') {
      setShowResults(true);
    }
  }, [status?.status]);

  const handleExportPdf = async () => {
    try {
      const blob = await exportApi.pdf(id);
      const url = window.URL.createObjectURL(blob);
      const a = globalThis.document.createElement('a');
      a.href = url;
      a.download = `sow_analysis_${id.slice(0, 8)}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleExportExcel = async () => {
    try {
      const blob = await exportApi.excel(id);
      const url = window.URL.createObjectURL(blob);
      const a = globalThis.document.createElement('a');
      a.href = url;
      a.download = `sow_analysis_${id.slice(0, 8)}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (statusLoading) {
    return (
      <div className="flex flex-col">
        <Header title="Analysis" />
        <div className="flex-1 p-6">
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <Header title="Analysis Results" />
      <div className="flex-1 p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
            {documentData && (
              <div className="flex items-center gap-2 text-gray-600">
                <FileText className="h-4 w-4" />
                <span>{documentData.original_filename}</span>
                <span className="text-gray-400">|</span>
                <span>{documentData.metadata.vendor_name}</span>
              </div>
            )}
          </div>
          {showResults && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportPdf}>
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
              <Button variant="outline" onClick={handleExportExcel}>
                <Download className="mr-2 h-4 w-4" />
                Export Excel
              </Button>
            </div>
          )}
        </div>

        {!showResults && <ProcessingStatus analysisId={id} />}

        {showResults && results && (
          <div className="space-y-6">
            {results.summary && (
              <Card>
                <CardHeader>
                  <CardTitle>Executive Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{results.summary}</p>
                </CardContent>
              </Card>
            )}

            <SummaryCards results={results} />

            <div className="grid gap-6 lg:grid-cols-2">
              <RiskChart results={results} />
              <FindingsList findings={results.findings} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
