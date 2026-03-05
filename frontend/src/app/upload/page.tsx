'use client';

import { Header } from '@/components/layout/header';
import { Dropzone } from '@/components/upload/dropzone';

export default function UploadPage() {
  return (
    <div className="flex flex-col">
      <Header title="Upload Document" />
      <div className="flex-1 p-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <h2 className="text-2xl font-bold">Upload SOW for Analysis</h2>
            <p className="mt-2 text-gray-600">
              Upload a Statement of Work document to analyze it for potential vendor
              abuses, risks, and cost-saving opportunities.
            </p>
          </div>
          <Dropzone />
        </div>
      </div>
    </div>
  );
}
