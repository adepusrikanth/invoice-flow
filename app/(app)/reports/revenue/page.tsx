import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { convertToINR, formatINRShort } from '@/lib/currency';
import { RevenueReportActions } from '@/components/reports/RevenueReportActions';

export default async function RevenueReportPage() {
  const session = await getSession();
  if (!session) return null;
  const invoices = await prisma.invoice.findMany({
    where: { userId: session.id, status: 'paid' },
    select: { issueDate: true, total: true, currency: true },
  });
  const byMonth: Record<string, number> = {};
  for (const inv of invoices) {
    const month = inv.issueDate.slice(0, 7);
    byMonth[month] = (byMonth[month] ?? 0) + convertToINR(inv.total, inv.currency);
  }
  const months = Object.keys(byMonth).sort();
  const data = months.map((month) => ({ month, revenueInr: byMonth[month] }));
  const totalInr = data.reduce((s, r) => s + r.revenueInr, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 flex-wrap">
        <Link href="/reports" className="text-neutral-500 hover:text-neutral-900 text-sm">← Reports</Link>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-neutral-900">Monthly Revenue (INR)</h1>
        <RevenueReportActions />
      </div>
      <div className="rounded-card bg-white border border-neutral-200 shadow-sm overflow-hidden print:border print:shadow-none" id="revenue-report-content">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" aria-label="Monthly revenue report">
            <thead>
              <tr className="text-left text-neutral-500 border-b border-neutral-200 bg-neutral-50">
                <th className="p-3 font-medium">Month</th>
                <th className="p-3 font-medium text-right">Revenue (INR)</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={2} className="p-8 text-center text-neutral-500">No paid invoices yet.</td>
                </tr>
              ) : (
                data.map((row) => (
                  <tr key={row.month} className="border-b border-neutral-100">
                    <td className="p-3 font-medium text-neutral-900">{row.month}</td>
                    <td className="p-3 text-right font-mono">{formatINRShort(row.revenueInr)}</td>
                  </tr>
                ))
              )}
            </tbody>
            {data.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-neutral-200 bg-neutral-50 font-semibold">
                  <td className="p-3 text-neutral-900">Total</td>
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
