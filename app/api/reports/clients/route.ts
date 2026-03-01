import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { convertToINR, formatINR } from '@/lib/currency';

/** GET /api/reports/clients?format=csv optional. Returns client-wise invoice summary in INR. */
export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const clients = await prisma.client.findMany({
    where: { userId: session.id },
    include: { invoices: true },
  });
  const rows = clients.map((c) => {
    const totalBilledInr = c.invoices.reduce((s, inv) => s + convertToINR(inv.total, inv.currency), 0);
    const totalPaidInr = c.invoices.reduce((s, inv) => s + convertToINR(inv.amountPaid, inv.currency), 0);
    const outstandingInr = c.invoices.reduce((s, inv) => s + convertToINR(inv.amountDue, inv.currency), 0);
    return {
      clientName: c.name,
      email: c.email,
      invoiceCount: c.invoices.length,
      totalBilledInr,
      totalPaidInr,
      outstandingInr,
      totalBilledFormatted: formatINR(totalBilledInr),
      totalPaidFormatted: formatINR(totalPaidInr),
      outstandingFormatted: formatINR(outstandingInr),
    };
  });

  const format = new URL(req.url).searchParams.get('format');
  if (format === 'csv') {
    const csvRows = [
      ['Client', 'Email', 'Invoices', 'Total Billed (INR)', 'Total Paid (INR)', 'Outstanding (INR)'],
      ...rows.map((r) => [r.clientName, r.email, r.invoiceCount, r.totalBilledFormatted, r.totalPaidFormatted, r.outstandingFormatted]),
    ];
    const csv = csvRows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="client-summary.csv"',
      },
    });
  }
  return NextResponse.json({ data: rows });
}
