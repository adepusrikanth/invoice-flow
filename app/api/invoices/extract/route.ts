import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { extractInvoiceFromText } from '@/lib/openai-server';

const bodySchema = z.object({ text: z.string().min(1).max(100000) });

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input: text required' }, { status: 400 });

  const extracted = await extractInvoiceFromText(parsed.data.text);
  const today = new Date().toISOString().slice(0, 10);
  const dueDate = extracted.dueDate ?? today;
  const issueDate = today;
  const currency = extracted.currency ?? 'USD';
  const total = extracted.amount ?? 0;
  const lineItems = extracted.lineItems?.length ? extracted.lineItems : [{ description: 'Item', quantity: 1, unitPrice: total, total: total }];

  let clientId: string | null = null;
  if (extracted.vendorName) {
    const existing = await prisma.client.findFirst({
      where: { userId: session.id, name: { contains: extracted.vendorName } },
    });
    if (existing) clientId = existing.id;
    else {
      const client = await prisma.client.create({
        data: {
          userId: session.id,
          name: extracted.vendorName,
          email: `contact@${extracted.vendorName.toLowerCase().replace(/\s+/g, '')}.local`,
        },
      });
      clientId = client.id;
    }
  }

  const count = await prisma.invoice.count({ where: { userId: session.id } });
  const invoiceNumber = `INV-${String(count + 1).padStart(4, '0')}`;
  const invoice = await prisma.invoice.create({
    data: {
      userId: session.id,
      clientId,
      invoiceNumber,
      status: 'draft',
      issueDate,
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
    include: { client: true, items: true },
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
