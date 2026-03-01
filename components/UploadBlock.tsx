'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function UploadBlock() {
  const router = useRouter();
  const [mode, setMode] = useState<'paste' | 'file'>('paste');
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handlePaste() {
    if (!text.trim()) return;
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/invoices/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Extraction failed');
        return;
      }
      setText('');
      router.refresh();
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  async function handleFile() {
    if (!file) return;
    setError('');
    setLoading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/invoices/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Upload failed');
        return;
      }
      setFile(null);
      router.refresh();
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl bg-slate-900/80 border border-slate-700 p-6">
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setMode('paste')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${mode === 'paste' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
        >
          Paste text
        </button>
        <button
          type="button"
          onClick={() => setMode('file')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${mode === 'file' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
        >
          Upload .txt / .json
        </button>
      </div>
      {mode === 'paste' ? (
        <div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste invoice text here…"
            rows={6}
            className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          />
          <button
            type="button"
            onClick={handlePaste}
            disabled={loading || !text.trim()}
            className="mt-3 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 disabled:opacity-50 transition"
          >
            {loading ? 'Extracting…' : 'Extract with AI'}
          </button>
        </div>
      ) : (
        <div>
          <input
            type="file"
            accept=".txt,.json"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-slate-700 file:text-white"
          />
          <p className="mt-2 text-xs text-slate-500">Upload a .txt or .json file containing invoice text.</p>
          <button
            type="button"
            onClick={handleFile}
            disabled={loading || !file}
            className="mt-3 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 disabled:opacity-50 transition"
          >
            {loading ? 'Processing…' : 'Upload & extract'}
          </button>
        </div>
      )}
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
    </div>
  );
}
