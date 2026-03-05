'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { DiffViewer } from '@/components/comparison/diff-viewer';
import { useDocuments } from '@/hooks/use-documents';
import { comparisonApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, GitCompare, FileText } from 'lucide-react';
import type { ComparisonResponse } from '@/types';

export default function ComparePage() {
  const { data: documents, isLoading: docsLoading } = useDocuments();
  const [doc1Id, setDoc1Id] = useState<string>('');
  const [doc2Id, setDoc2Id] = useState<string>('');
  const [comparison, setComparison] = useState<ComparisonResponse | null>(null);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzedDocs = documents?.filter((d) => d.has_text_content) || [];

  const doc1 = documents?.find((d) => d.id === doc1Id);
  const doc2 = documents?.find((d) => d.id === doc2Id);

  const handleCompare = async () => {
    if (!doc1Id || !doc2Id) return;

    setComparing(true);
    setError(null);
    setComparison(null);

    try {
      const result = await comparisonApi.compare(doc1Id, doc2Id);
      setComparison(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Comparison failed');
    } finally {
      setComparing(false);
    }
  };

  return (
    <div className="flex flex-col">
      <Header title="Compare SOW Documents" />
      <div className="flex-1 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">SOW Comparison</h2>
          <p className="mt-2 text-gray-600">
            Compare two Statement of Work documents to identify key differences
            and get recommendations.
          </p>
        </div>

        {/* Document Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Documents to Compare</CardTitle>
          </CardHeader>
          <CardContent>
            {docsLoading ? (
              <div className="grid gap-4 md:grid-cols-3">
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </div>
            ) : analyzedDocs.length < 2 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <FileText className="mb-2 h-12 w-12 text-gray-300" />
                <p>You need at least 2 analyzed documents to compare.</p>
                <p className="text-sm">
                  Currently have {analyzedDocs.length} analyzed document(s).
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Document 1
                  </label>
                  <Select value={doc1Id} onValueChange={setDoc1Id}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select first document" />
                    </SelectTrigger>
                    <SelectContent>
                      {analyzedDocs
                        .filter((d) => d.id !== doc2Id)
                        .map((doc) => (
                          <SelectItem key={doc.id} value={doc.id}>
                            {doc.original_filename} ({doc.metadata.vendor_name})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Document 2
                  </label>
                  <Select value={doc2Id} onValueChange={setDoc2Id}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select second document" />
                    </SelectTrigger>
                    <SelectContent>
                      {analyzedDocs
                        .filter((d) => d.id !== doc1Id)
                        .map((doc) => (
                          <SelectItem key={doc.id} value={doc.id}>
                            {doc.original_filename} ({doc.metadata.vendor_name})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    onClick={handleCompare}
                    disabled={!doc1Id || !doc2Id || comparing}
                    className="w-full"
                  >
                    {comparing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Comparing...
                      </>
                    ) : (
                      <>
                        <GitCompare className="mr-2 h-4 w-4" />
                        Compare Documents
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="py-4">
              <p className="text-red-700">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Comparison Results */}
        {comparison && doc1 && doc2 && (
          <DiffViewer
            comparison={comparison}
            vendor1={doc1.metadata.vendor_name}
            vendor2={doc2.metadata.vendor_name}
          />
        )}
      </div>
    </div>
  );
}
