import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { convertToINR, formatINR } from '@/lib/currency';

/**
 * GET /api/invoices/[id]/export?format=csv
 * Returns invoice data as CSV (amounts also in INR for reporting).
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const invoice = await prisma.invoice.findFirst({
    where: { id, userId: session.id },
    include: { client: true, items: true },
  });
  if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const searchParams = new URL(req.url).searchParams;
  const format = searchParams.get('format') || 'csv';
  if (format !== 'csv') {
    return NextResponse.json({ error: 'Only format=csv is supported' }, { status: 400 });
  }

  const clientName = invoice.client?.name ?? '';
  const clientEmail = invoice.client?.email ?? '';
  const rows: string[][] = [
    ['Field', 'Value'],
    ['Invoice Number', invoice.invoiceNumber],
    ['Status', invoice.status],
    ['Issue Date', invoice.issueDate],
    ['Due Date', invoice.dueDate],
    ['Client', clientName],
    ['Client Email', clientEmail],
    ['Currency (original)', invoice.currency],
    ['Subtotal (original)', String(invoice.subtotal)],
    ['Tax', String(invoice.taxAmount)],
    ['Total (original)', String(invoice.total)],
    ['Amount Paid', String(invoice.amountPaid)],
    ['Amount Due', String(invoice.amountDue)],
    ['Total in INR', formatINR(convertToINR(invoice.total, invoice.currency))],
    [],
    ['Line Items'],
    ['Description', 'Quantity', 'Unit Price', 'Amount', 'Amount (INR)'],
  ];
  for (const item of invoice.items) {
    const inr = convertToINR(item.amount, invoice.currency);
    rows.push([
      item.description,
      String(item.quantity),
      String(item.unitPrice),
      String(item.amount),
      formatINR(inr),
    ]);
  }
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\r\n');
  const filename = `invoice-${invoice.invoiceNumber.replace(/\s/g, '-')}.csv`;
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
