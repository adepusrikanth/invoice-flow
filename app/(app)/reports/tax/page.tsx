import Link from 'next/link';

export default function TaxReportPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/reports" className="text-neutral-500 hover:text-neutral-900 text-sm">← Reports</Link>
      </div>
      <h1 className="text-2xl font-bold text-neutral-900">Tax Report</h1>
      <div className="rounded-card bg-white border border-neutral-200 p-8 shadow-sm">
        <p className="text-neutral-500">GST/VAT report for the selected period.</p>
      </div>
    </div>
  );
}
