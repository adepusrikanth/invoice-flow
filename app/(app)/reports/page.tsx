import Link from 'next/link';
import { BarChart3, FileText, Users, AlertCircle } from 'lucide-react';

export default function ReportsPage() {
  const reports = [
    { title: 'Monthly Revenue', desc: 'Revenue by month in INR', href: '/reports/revenue', icon: BarChart3 },
    { title: 'Outstanding Invoices', desc: 'Unpaid and overdue in INR', href: '/reports/outstanding', icon: AlertCircle },
    { title: 'Client-wise Summary', desc: 'Per-client billed, paid, outstanding', href: '/reports/clients', icon: Users },
    { title: 'Tax Report', desc: 'GST/VAT summary', href: '/reports/tax', icon: FileText },
  ];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900">Reports</h1>
      <p className="text-neutral-600">Generate financial reports and export to CSV or PDF.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((r) => (
          <Link key={r.href} href={r.href} className="rounded-card bg-white border border-neutral-200 p-6 shadow-sm hover:shadow-md hover:border-brand-primary/30 transition flex items-start gap-4">
            <div className="w-10 h-10 rounded-button bg-brand-tertiary/30 flex items-center justify-center text-brand-primary shrink-0">
              <r.icon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-neutral-900">{r.title}</h2>
              <p className="text-sm text-neutral-500 mt-1">{r.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
