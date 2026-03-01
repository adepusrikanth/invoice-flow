import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { convertToINR, formatINR } from '@/lib/currency';

/** GET /api/reports/outstanding?format=csv optional. Returns outstanding invoices in INR. */
export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    invoiceNumber: inv.invoiceNumber,
    clientName: inv.client?.name ?? '—',
    dueDate: inv.dueDate,
    status: inv.status,
    amountDueInr: convertToINR(inv.amountDue, inv.currency),
    amountDueFormatted: formatINR(convertToINR(inv.amountDue, inv.currency)),
  }));
  const totalInr = rows.reduce((s, r) => s + r.amountDueInr, 0);

  const format = new URL(req.url).searchParams.get('format');
  if (format === 'csv') {
    const csvRows = [
      ['Invoice #', 'Client', 'Due Date', 'Status', 'Amount Due (INR)'],
      ...rows.map((r) => [r.invoiceNumber, r.clientName, r.dueDate, r.status, r.amountDueFormatted]),
      [],
      ['Total Outstanding', '', '', '', formatINR(totalInr)],
    ];
    const csv = csvRows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="outstanding-invoices.csv"',
      },
    });
  }
  return NextResponse.json({ data: rows, totalInr, totalFormatted: formatINR(totalInr) });
}
