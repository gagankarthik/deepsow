'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { ComparisonResponse } from '@/types';

interface DiffViewerProps {
  comparison: ComparisonResponse;
  vendor1: string;
  vendor2: string;
}

export function DiffViewer({ comparison, vendor1, vendor2 }: DiffViewerProps) {
  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Comparison Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{comparison.summary}</p>
        </CardContent>
      </Card>

      {/* Recommendation */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <CheckCircle2 className="h-5 w-5" />
            Recommendation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-800">{comparison.recommendation}</p>
        </CardContent>
      </Card>

      {/* Key Differences */}
      <Card>
        <CardHeader>
          <CardTitle>Key Differences ({comparison.key_differences.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-6">
              {comparison.key_differences.map((diff, index) => (
                <div key={index} className="rounded-lg border p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <Badge variant="outline" className="text-sm">
                      {diff.aspect}
                    </Badge>
                    <span className="text-sm text-gray-400">#{index + 1}</span>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg bg-red-50 p-4">
                      <p className="mb-2 text-sm font-medium text-red-700">
                        {vendor1}
                      </p>
                      <p className="text-sm text-red-900">{diff.document1}</p>
                    </div>

                    <div className="rounded-lg bg-green-50 p-4">
                      <p className="mb-2 text-sm font-medium text-green-700">
                        {vendor2}
                      </p>
                      <p className="text-sm text-green-900">{diff.document2}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-start gap-2 rounded-lg bg-yellow-50 p-3">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <p className="text-sm text-yellow-800">
                      <strong>Recommendation:</strong> {diff.recommendation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
