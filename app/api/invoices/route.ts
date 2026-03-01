import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const itemSchema = z.object({
  description: z.string(),
  quantity: z.coerce.number(),
  unitPrice: z.coerce.number(),
  amount: z.coerce.number(),
});
const createSchema = z.object({
  clientId: z.string().optional().nullable(),
  templateId: z.string().optional().nullable(),
  issueDate: z.string(),
  dueDate: z.string(),
  currency: z.string().default('USD'),
  taxRate: z.number().min(0).max(100).optional(),
  discountType: z.enum(['percent', 'fixed']).optional().nullable(),
  discountValue: z.number().min(0).optional().nullable(),
  notes: z.string().optional().nullable(),
  terms: z.string().optional().nullable(),
  items: z.array(itemSchema).min(1),
});

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const invoices = await prisma.invoice.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: 'desc' },
    include: { client: true },
  });
  return NextResponse.json({ invoices });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const data = createSchema.parse(body);
    const count = await prisma.invoice.count({ where: { userId: session.id } });
    const invoiceNumber = `INV-${String(count + 1).padStart(4, '0')}`;
    const subtotal = data.items.reduce((s, i) => s + i.amount, 0);
    const taxRate = data.taxRate ?? 0;
    const discountType = data.discountType ?? null;
    const discountValue = data.discountValue ?? 0;
    let afterDiscount = subtotal;
    if (discountType === 'percent' && discountValue > 0) afterDiscount = subtotal * (1 - discountValue / 100);
    else if (discountType === 'fixed' && discountValue > 0) afterDiscount = Math.max(0, subtotal - discountValue);
    const taxAmount = afterDiscount * (taxRate / 100);
    const total = afterDiscount + taxAmount;
    const invoice = await prisma.invoice.create({
      data: {
        userId: session.id,
        clientId: data.clientId || null,
        templateId: data.templateId || null,
        invoiceNumber,
        status: 'draft',
        issueDate: data.issueDate,
        dueDate: data.dueDate,
        currency: data.currency,
        taxRate: taxRate || null,
        discountType,
        discountValue: discountValue || null,
        notes: data.notes ?? null,
        terms: data.terms ?? null,
        subtotal,
        taxAmount,
        total,
        amountDue: total,
        viewToken: `v_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        items: {
          create: data.items.map((item, i) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.amount,
            sortOrder: i,
          })),
        },
      },
      include: { client: true, template: true, items: true },
    });
    return NextResponse.json({ invoice });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.message }, { status: 400 });
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
}
