'use client';

import { FileDown, Printer } from 'lucide-react';

export function RevenueReportActions() {
  return (
    <div className="flex flex-wrap gap-3 print:hidden">
      <a
        href="/api/reports/revenue?format=csv"
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-button bg-neutral-100 text-neutral-700 hover:bg-neutral-200 font-medium"
        aria-label="Download revenue report as CSV"
      >
        <FileDown className="w-4 h-4" /> Export CSV
      </a>
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-button bg-brand-primary text-white font-medium hover:bg-brand-primary/90"
        aria-label="Print or save as PDF"
      >
        <Printer className="w-4 h-4" /> Print / Save PDF
      </button>
    </div>
  );
}
