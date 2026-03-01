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
const updateSchema = z.object({
  clientId: z.string().optional().nullable(),
  templateId: z.string().optional().nullable(),
  issueDate: z.string().optional(),
  dueDate: z.string().optional(),
  currency: z.string().optional(),
  taxRate: z.number().min(0).max(100).optional().nullable(),
  discountType: z.enum(['percent', 'fixed']).optional().nullable(),
  discountValue: z.number().min(0).optional().nullable(),
  notes: z.string().optional().nullable(),
  terms: z.string().optional().nullable(),
  items: z.array(itemSchema).optional(),
});

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const invoice = await prisma.invoice.findFirst({
    where: { id, userId: session.id },
    include: { client: true, template: true, items: true, payments: true },
  });
  if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ invoice });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const invoice = await prisma.invoice.findFirst({
    where: { id, userId: session.id },
  });
  if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (invoice.status !== 'draft') return NextResponse.json({ error: 'Only draft invoices can be edited' }, { status: 400 });
  try {
    const body = await req.json();
    const data = updateSchema.parse(body);
    const updates: Record<string, unknown> = {};
    if (data.clientId !== undefined) updates.clientId = data.clientId;
    if (data.templateId !== undefined) updates.templateId = data.templateId;
    if (data.issueDate) updates.issueDate = data.issueDate;
    if (data.dueDate) updates.dueDate = data.dueDate;
    if (data.currency) updates.currency = data.currency;
    if (data.notes !== undefined) updates.notes = data.notes;
    if (data.terms !== undefined) updates.terms = data.terms;
    if (data.taxRate !== undefined) updates.taxRate = data.taxRate;
    if (data.discountType !== undefined) updates.discountType = data.discountType;
    if (data.discountValue !== undefined) updates.discountValue = data.discountValue;
    if (data.items?.length) {
      const subtotal = data.items.reduce((s, i) => s + i.amount, 0);
      const taxRate = data.taxRate ?? invoice.taxRate ?? 0;
      const discountType = data.discountType ?? invoice.discountType ?? null;
      const discountValue = data.discountValue ?? invoice.discountValue ?? 0;
      let afterDiscount = subtotal;
      if (discountType === 'percent' && discountValue > 0) afterDiscount = subtotal * (1 - discountValue / 100);
      else if (discountType === 'fixed' && discountValue > 0) afterDiscount = Math.max(0, subtotal - discountValue);
      const taxAmount = afterDiscount * (taxRate / 100);
      const total = afterDiscount + taxAmount;
      updates.subtotal = subtotal;
      updates.taxRate = taxRate || null;
      updates.discountType = discountType;
      updates.discountValue = discountValue || null;
      updates.taxAmount = taxAmount;
      updates.total = total;
      updates.amountDue = total - invoice.amountPaid;
      await prisma.invoiceItem.deleteMany({ where: { invoiceId: id } });
      await prisma.invoiceItem.createMany({
        data: data.items.map((item, i) => ({
          invoiceId: id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.amount,
          sortOrder: i,
        })),
      });
    } else if (data.taxRate !== undefined || data.discountType !== undefined || data.discountValue !== undefined) {
      const subtotal = invoice.subtotal;
      const taxRate = (data.taxRate ?? invoice.taxRate) ?? 0;
      const discountType = data.discountType ?? invoice.discountType ?? null;
      const discountValue = data.discountValue ?? invoice.discountValue ?? 0;
      let afterDiscount = subtotal;
      if (discountType === 'percent' && discountValue > 0) afterDiscount = subtotal * (1 - discountValue / 100);
      else if (discountType === 'fixed' && discountValue > 0) afterDiscount = Math.max(0, subtotal - discountValue);
      const newTaxAmount = afterDiscount * (taxRate / 100);
      const newTotal = afterDiscount + newTaxAmount;
      updates.taxAmount = newTaxAmount;
      updates.total = newTotal;
      updates.amountDue = newTotal - invoice.amountPaid;
    }
    const updated = await prisma.invoice.update({
      where: { id },
      data: updates,
      include: { client: true, template: true, items: true },
    });
    return NextResponse.json({ invoice: updated });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.message }, { status: 400 });
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
