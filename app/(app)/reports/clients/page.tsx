import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { convertToINR, formatINRShort } from '@/lib/currency';
import { ReportExportActions } from '@/components/reports/ReportExportActions';

export default async function ClientSummaryReportPage() {
  const session = await getSession();
  if (!session) return null;
  const clients = await prisma.client.findMany({
    where: { userId: session.id },
    include: { invoices: true },
  });
  const rows = clients.map((c) => {
    const totalBilledInr = c.invoices.reduce((s, inv) => s + convertToINR(inv.total, inv.currency), 0);
    const totalPaidInr = c.invoices.reduce((s, inv) => s + convertToINR(inv.amountPaid, inv.currency), 0);
    const outstandingInr = c.invoices.reduce((s, inv) => s + convertToINR(inv.amountDue, inv.currency), 0);
    return {
      name: c.name,
      email: c.email,
      invoiceCount: c.invoices.length,
      totalBilledInr,
      totalPaidInr,
      outstandingInr,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 flex-wrap">
        <Link href="/reports" className="text-neutral-500 hover:text-neutral-900 text-sm">← Reports</Link>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-neutral-900">Client-wise Summary (INR)</h1>
        <ReportExportActions reportType="clients" />
      </div>
      <div className="rounded-card bg-white border border-neutral-200 shadow-sm overflow-hidden print:border print:shadow-none" id="clients-report-content">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="Client summary report">
            <thead>
              <tr className="text-left text-neutral-500 border-b border-neutral-200 bg-neutral-50">
                <th className="p-3 font-medium">Client</th>
                <th className="p-3 font-medium">Email</th>
                <th className="p-3 font-medium text-center">Invoices</th>
                <th className="p-3 font-medium text-right">Total Billed</th>
                <th className="p-3 font-medium text-right">Total Paid</th>
                <th className="p-3 font-medium text-right">Outstanding</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-neutral-500">No clients yet.</td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.name} className="border-b border-neutral-100">
                    <td className="p-3 font-medium text-neutral-900">{row.name}</td>
                    <td className="p-3 text-neutral-600">{row.email}</td>
                    <td className="p-3 text-center">{row.invoiceCount}</td>
                    <td className="p-3 text-right font-mono">{formatINRShort(row.totalBilledInr)}</td>
                    <td className="p-3 text-right font-mono text-success-dark">{formatINRShort(row.totalPaidInr)}</td>
                    <td className="p-3 text-right font-mono text-warning-dark">{formatINRShort(row.outstandingInr)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
