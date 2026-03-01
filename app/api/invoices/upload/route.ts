import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { extractInvoiceFromText } from '@/lib/openai-server';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

  let rawText = '';
  const contentType = file.type.toLowerCase();
  if (contentType === 'text/plain' || contentType === 'application/json') {
    rawText = await file.text();
  } else {
    return NextResponse.json({ error: 'Unsupported file type. Use .txt or .json.' }, { status: 400 });
  }
  if (!rawText.trim()) return NextResponse.json({ error: 'File is empty' }, { status: 400 });

  const extracted = await extractInvoiceFromText(rawText);
  const today = new Date().toISOString().slice(0, 10);
  const dueDate = extracted.dueDate ?? today;
  const currency = extracted.currency ?? 'USD';
  const total = extracted.amount ?? 0;
  const lineItems = extracted.lineItems?.length ? extracted.lineItems : [{ description: 'Item', quantity: 1, unitPrice: total, total }];

  let clientId: string | null = null;
  if (extracted.vendorName) {
    const client = await prisma.client.create({
      data: {
        userId: session.id,
        name: extracted.vendorName,
        email: `contact@${extracted.vendorName.toLowerCase().replace(/\s+/g, '')}.local`,
      },
    });
    clientId = client.id;
  }

  const count = await prisma.invoice.count({ where: { userId: session.id } });
  const invoiceNumber = `INV-${String(count + 1).padStart(4, '0')}`;
  const invoice = await prisma.invoice.create({
    data: {
      userId: session.id,
      clientId,
      invoiceNumber,
      status: 'draft',
      issueDate: today,
      dueDate,
      currency,
      subtotal: total,
      taxAmount: 0,
      total,
      amountDue: total,
      viewToken: `v_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      items: {
        create: lineItems.map((item, i) => ({
          description: item.description ?? 'Item',
          quantity: item.quantity ?? 1,
          unitPrice: item.unitPrice ?? item.total ?? 0,
          amount: (item.quantity ?? 1) * (item.unitPrice ?? item.total ?? 0),
          sortOrder: i,
        })),
      },
    },
    include: { client: true },
  });

  return NextResponse.json({
    invoice: {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      status: invoice.status,
      total: invoice.total,
      currency: invoice.currency,
      dueDate: invoice.dueDate,
      createdAt: invoice.createdAt,
    },
  });
}
