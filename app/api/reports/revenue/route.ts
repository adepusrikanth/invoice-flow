import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { convertToINR, formatINR } from '@/lib/currency';

/** GET /api/reports/revenue?format=csv optional. Returns monthly revenue in INR. */
export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
  const data = months.map((month) => ({ month, revenueInr: byMonth[month], revenueFormatted: formatINR(byMonth[month]) }));
  const totalInr = data.reduce((s, r) => s + r.revenueInr, 0);

  const format = new URL(req.url).searchParams.get('format');
  if (format === 'csv') {
    const rows = [['Month', 'Revenue (INR)'], ...data.map((d) => [d.month, d.revenueFormatted]), [], ['Total', formatINR(totalInr)]];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="revenue-report.csv"',
      },
    });
  }
  return NextResponse.json({ data, totalInr, totalFormatted: formatINR(totalInr) });
}
