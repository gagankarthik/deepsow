'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUploadDocument } from '@/hooks/use-documents';
import { useStartAnalysis } from '@/hooks/use-analysis';
import { useRouter } from 'next/navigation';

interface UploadFormData {
  vendorName: string;
  contractValue: string;
  contractDate: string;
  description: string;
}

export function Dropzone() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<UploadFormData>({
    vendorName: '',
    contractValue: '',
    contractDate: '',
    description: '',
  });
  const [step, setStep] = useState<'upload' | 'metadata' | 'processing'>('upload');

  const uploadMutation = useUploadDocument();
  const startAnalysisMutation = useStartAnalysis();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setStep('metadata');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/json': ['.json'],
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setStep('processing');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', file);
      formDataToSend.append('vendor_name', formData.vendorName);
      if (formData.contractValue) {
        formDataToSend.append('contract_value', formData.contractValue);
      }
      if (formData.contractDate) {
        formDataToSend.append('contract_date', formData.contractDate);
      }
      if (formData.description) {
        formDataToSend.append('description', formData.description);
      }

      const document = await uploadMutation.mutateAsync(formDataToSend);

      // Start analysis
      const analysis = await startAnalysisMutation.mutateAsync(document.id);

      // Redirect to analysis page
      router.push(`/analysis/${analysis.id}`);
    } catch (error) {
      console.error('Upload failed:', error);
      setStep('metadata');
    }
  };

  const removeFile = () => {
    setFile(null);
    setStep('upload');
  };

  if (step === 'processing') {
    return (
      <Card className="mx-auto max-w-xl">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <h3 className="mt-4 text-lg font-semibold">Processing Document</h3>
          <p className="mt-2 text-sm text-gray-500">
            Uploading and starting analysis...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (step === 'metadata' && file) {
    return (
      <Card className="mx-auto max-w-xl">
        <CardHeader>
          <CardTitle>Document Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex items-center justify-between rounded-lg bg-gray-50 p-4">
            <div className="flex items-center gap-3">
              <File className="h-8 w-8 text-blue-600" />
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={removeFile}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="vendorName">Vendor Name *</Label>
              <Input
                id="vendorName"
                value={formData.vendorName}
                onChange={(e) =>
                  setFormData({ ...formData, vendorName: e.target.value })
                }
                placeholder="Enter vendor name"
                required
              />
            </div>

            <div>
              <Label htmlFor="contractValue">Contract Value ($)</Label>
              <Input
                id="contractValue"
                type="number"
                value={formData.contractValue}
                onChange={(e) =>
                  setFormData({ ...formData, contractValue: e.target.value })
                }
                placeholder="Enter contract value"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <Label htmlFor="contractDate">Contract Date</Label>
              <Input
                id="contractDate"
                type="date"
                value={formData.contractDate}
                onChange={(e) =>
                  setFormData({ ...formData, contractDate: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brief description of the SOW"
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={removeFile}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={!formData.vendorName || uploadMutation.isPending}
              >
                {uploadMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload & Analyze'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-xl">
      <CardHeader>
        <CardTitle>Upload SOW Document</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors',
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          )}
        >
          <input {...getInputProps()} />
          <Upload
            className={cn(
              'h-12 w-12',
              isDragActive ? 'text-blue-500' : 'text-gray-400'
            )}
          />
          <p className="mt-4 text-center font-medium">
            {isDragActive
              ? 'Drop the file here'
              : 'Drag & drop a SOW document here'}
          </p>
          <p className="mt-2 text-center text-sm text-gray-500">
            or click to browse
          </p>
          <p className="mt-4 text-center text-xs text-gray-400">
            Supports PDF, DOCX, Excel, JSON, and CSV files up to 10MB
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
