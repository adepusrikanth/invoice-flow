import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { convertToINR, formatINRShort } from '@/lib/currency';
import { ReportExportActions } from '@/components/reports/ReportExportActions';

export default async function OutstandingReportPage() {
  const session = await getSession();
  if (!session) return null;
  const invoices = await prisma.invoice.findMany({
    where: {
      userId: session.id,
      status: { notIn: ['paid', 'cancelled'] },
      amountDue: { gt: 0 },
    },
    include: { client: true },
    orderBy: { dueDate: 'asc' },
  });
  const rows = invoices.map((inv) => ({
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    clientName: inv.client?.name ?? '—',
    dueDate: inv.dueDate,
    status: inv.status,
    amountDueInr: convertToINR(inv.amountDue, inv.currency),
  }));
  const totalInr = rows.reduce((s, r) => s + r.amountDueInr, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 flex-wrap">
        <Link href="/reports" className="text-neutral-500 hover:text-neutral-900 text-sm">← Reports</Link>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-neutral-900">Outstanding Invoices (INR)</h1>
        <ReportExportActions reportType="outstanding" />
      </div>
      <div className="rounded-card bg-white border border-neutral-200 shadow-sm overflow-hidden print:border print:shadow-none" id="outstanding-report-content">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="Outstanding invoices report">
            <thead>
              <tr className="text-left text-neutral-500 border-b border-neutral-200 bg-neutral-50">
                <th className="p-3 font-medium">Invoice #</th>
                <th className="p-3 font-medium">Client</th>
                <th className="p-3 font-medium">Due Date</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium text-right">Amount Due (INR)</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-neutral-500">No outstanding invoices.</td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="border-b border-neutral-100">
                    <td className="p-3 font-mono text-neutral-900">{row.invoiceNumber}</td>
                    <td className="p-3 text-neutral-600">{row.clientName}</td>
                    <td className="p-3 text-neutral-600">{row.dueDate}</td>
                    <td className="p-3">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-warning-bg text-warning-dark">{row.status}</span>
                    </td>
                    <td className="p-3 text-right font-mono">{formatINRShort(row.amountDueInr)}</td>
                  </tr>
                ))
              )}
            </tbody>
            {rows.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-neutral-200 bg-neutral-50 font-semibold">
                  <td className="p-3" colSpan={4}>Total Outstanding</td>
                  <td className="p-3 text-right font-mono text-neutral-900">{formatINRShort(totalInr)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
