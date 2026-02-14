'use client';

import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, XCircle, Download, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface UploadResult {
  index: number;
  success: boolean;
  title: string;
  error?: string;
  id?: string;
}

export default function BulkUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<UploadResult[] | null>(null);
  const [summary, setSummary] = useState<{ total: number; success: number; failed: number } | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCsv = (text: string): any[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
    const rows: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
      const row: any = {};
      headers.forEach((header, index) => {
        if (values[index] && values[index] !== '') {
          row[header] = values[index];
        }
      });
      if (row.title && row.price) {
        rows.push(row);
      }
    }
    return rows;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    setError('');
    setFile(selected);
    setResults(null);
    setSummary(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const data = parseCsv(text);
      setParsedData(data);

      if (data.length === 0) {
        setError('No valid listings found in CSV. Ensure you have title and price columns.');
      }
    };
    reader.readAsText(selected);
  };

  const handleUpload = async () => {
    if (parsedData.length === 0) return;

    setUploading(true);
    setError('');
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/bulk-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ listings: parsedData }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Upload failed');
        return;
      }

      setResults(data.results);
      setSummary(data.summary);
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/bulk-upload/template', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      const csvContent = [data.headers.join(','), data.sampleRow.join(',')].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'menon-trucks-bulk-template.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // error
    }
  };

  return (
    <div className="bg-background-light min-h-screen">
      <div className="container-main py-8 max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard/listings" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-text-secondary" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
              <Upload className="w-6 h-6" /> Bulk Upload
            </h1>
            <p className="text-text-secondary text-sm mt-0.5">Import multiple listings via CSV</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <h3 className="font-medium text-blue-800 text-sm mb-2">How it works:</h3>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>Download the CSV template</li>
            <li>Fill in your listing details (title, price, categoryId are required)</li>
            <li>Upload the CSV file</li>
            <li>Review and confirm the import</li>
          </ol>
          <Button variant="outline" size="sm" className="mt-3 gap-2" onClick={downloadTemplate}>
            <Download className="w-3.5 h-3.5" /> Download Template
          </Button>
        </div>

        {/* Upload Area */}
        <div
          className="bg-white rounded-xl border-2 border-dashed border-border p-8 text-center cursor-pointer hover:border-accent/50 transition-colors mb-6"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <FileSpreadsheet className="w-12 h-12 text-text-secondary/30 mx-auto mb-3" />
          {file ? (
            <div>
              <p className="font-medium text-text-primary">{file.name}</p>
              <p className="text-sm text-text-secondary mt-1">{parsedData.length} listings found</p>
            </div>
          ) : (
            <div>
              <p className="font-medium text-text-primary">Click to select CSV file</p>
              <p className="text-sm text-text-secondary mt-1">Maximum 100 listings per upload</p>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Preview */}
        {parsedData.length > 0 && !results && (
          <div className="bg-white rounded-xl border border-border overflow-hidden mb-6">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-text-primary text-sm">Preview ({parsedData.length} listings)</h3>
              <Button
                variant="accent"
                size="sm"
                onClick={handleUpload}
                loading={uploading}
                className="gap-2"
              >
                <Upload className="w-3.5 h-3.5" /> Import All
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium text-text-secondary">#</th>
                    <th className="text-left px-3 py-2 font-medium text-text-secondary">Title</th>
                    <th className="text-left px-3 py-2 font-medium text-text-secondary">Price</th>
                    <th className="text-left px-3 py-2 font-medium text-text-secondary">Brand</th>
                    <th className="text-left px-3 py-2 font-medium text-text-secondary">Year</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {parsedData.slice(0, 10).map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-text-secondary">{i + 1}</td>
                      <td className="px-3 py-2 font-medium text-text-primary max-w-[200px] truncate">{row.title}</td>
                      <td className="px-3 py-2">{row.currency || 'EUR'} {row.price}</td>
                      <td className="px-3 py-2 text-text-secondary">{row.brand || '-'}</td>
                      <td className="px-3 py-2 text-text-secondary">{row.year || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedData.length > 10 && (
                <div className="px-3 py-2 text-xs text-text-secondary text-center border-t border-border">
                  ...and {parsedData.length - 10} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results */}
        {results && summary && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-border p-4 text-center">
                <p className="text-2xl font-bold text-text-primary">{summary.total}</p>
                <p className="text-xs text-text-secondary">Total</p>
              </div>
              <div className="bg-green-50 rounded-xl border border-green-200 p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{summary.success}</p>
                <p className="text-xs text-green-600">Imported</p>
              </div>
              <div className="bg-red-50 rounded-xl border border-red-200 p-4 text-center">
                <p className="text-2xl font-bold text-red-500">{summary.failed}</p>
                <p className="text-xs text-red-500">Failed</p>
              </div>
            </div>

            {/* Details */}
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-text-primary text-sm">Import Results</h3>
              </div>
              <div className="divide-y divide-border max-h-80 overflow-y-auto">
                {results.map((result) => (
                  <div key={result.index} className="px-4 py-2.5 flex items-center gap-3">
                    {result.success ? (
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                    )}
                    <span className="text-sm text-text-primary flex-1 truncate">{result.title}</span>
                    {result.error && (
                      <span className="text-xs text-red-500 shrink-0">{result.error}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => { setResults(null); setSummary(null); setFile(null); setParsedData([]); }}
              >
                Upload Another
              </Button>
              <Link href="/dashboard/listings">
                <Button variant="accent">View My Listings</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
