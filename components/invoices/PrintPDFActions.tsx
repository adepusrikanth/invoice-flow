'use client';

import { useRouter } from 'next/navigation';
import { Printer, FileDown } from 'lucide-react';

export function PrintPDFActions() {
  const router = useRouter();
  function handlePrint() {
    window.print();
  }
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-card bg-white border border-neutral-200 p-4 shadow-sm">
      <p className="text-sm text-neutral-600">Use your browser&apos;s print dialog to save this invoice as PDF.</p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-button bg-brand-primary text-white font-medium hover:bg-brand-primary/90"
        >
          <Printer className="w-4 h-4" /> Print / Save as PDF
        </button>
        <button
          type="button"
          onClick={() => window.close()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-button bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
        >
          Close
        </button>
      </div>
    </div>
  );
}
