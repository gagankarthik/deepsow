'use client';

import { useAnalysisStatus } from '@/hooks/use-analysis';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Loader2, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProcessingStatusProps {
  analysisId: string;
  onComplete?: () => void;
}

const steps = [
  { label: 'Uploading document', key: 'upload' },
  { label: 'Extracting text', key: 'extract' },
  { label: 'Analyzing with AI', key: 'analyze' },
  { label: 'Generating findings', key: 'findings' },
  { label: 'Complete', key: 'complete' },
];

function getStepIndex(currentStep: string): number {
  if (currentStep.includes('Initializing') || currentStep.includes('Queued')) return 0;
  if (currentStep.includes('Preparing')) return 1;
  if (currentStep.includes('Sending') || currentStep.includes('Analyzing')) return 2;
  if (currentStep.includes('Processing') || currentStep.includes('Generating')) return 3;
  if (currentStep.includes('complete') || currentStep.includes('Complete')) return 4;
  return 1;
}

export function ProcessingStatus({ analysisId, onComplete }: ProcessingStatusProps) {
  const { data: status, isLoading, error } = useAnalysisStatus(analysisId);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </CardContent>
      </Card>
    );
  }

  if (error || !status) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to load analysis status';
    const isConnectionError = errorMessage.toLowerCase().includes('connection');

    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <XCircle className="h-12 w-12 text-red-500" />
          <p className="mt-4 text-lg font-medium text-red-600">
            {isConnectionError ? 'Connection Error' : 'Analysis Failed'}
          </p>
          <p className="mt-2 text-sm text-gray-500 text-center max-w-md">
            {errorMessage}
          </p>
          {isConnectionError && (
            <p className="mt-2 text-xs text-gray-400 text-center">
              Make sure the backend server is running: cd backend && uvicorn main:app --reload
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  const currentStepIndex = getStepIndex(status.current_step);
  const isCompleted = status.status === 'completed';
  const isFailed = status.status === 'failed';

  if (isCompleted && onComplete) {
    onComplete();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isCompleted ? (
            <>
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Analysis Complete
            </>
          ) : isFailed ? (
            <>
              <XCircle className="h-5 w-5 text-red-600" />
              Analysis Failed
            </>
          ) : (
            <>
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              Analyzing Document
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-gray-600">{status.current_step}</span>
            <span className="font-medium">{status.progress}%</span>
          </div>
          <Progress value={status.progress} className="h-2" />
        </div>

        <div className="space-y-3">
          {steps.map((step, index) => {
            const isActive = index === currentStepIndex;
            const isDone = index < currentStepIndex || isCompleted;

            return (
              <div
                key={step.key}
                className={cn(
                  'flex items-center gap-3 rounded-lg p-3 transition-colors',
                  isActive && 'bg-blue-50',
                  isDone && 'text-green-700'
                )}
              >
                {isDone ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : isActive ? (
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                ) : (
                  <Clock className="h-5 w-5 text-gray-400" />
                )}
                <span
                  className={cn(
                    'font-medium',
                    !isDone && !isActive && 'text-gray-400'
                  )}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {isFailed && status.error_message && (
          <div className="rounded-lg bg-red-50 p-4">
            <p className="text-sm text-red-700">{status.error_message}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
