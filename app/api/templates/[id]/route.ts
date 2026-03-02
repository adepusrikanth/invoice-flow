import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  businessName: z.string().min(1).optional(),
  businessPhone: z.string().optional().nullable(),
  businessEmail: z.string().optional().nullable(),
  businessAddress: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  accentColor: z.string().optional(),
});

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const template = await prisma.invoiceTemplate.findFirst({
    where: { id, userId: session.id },
  });
  if (!template) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ template });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const template = await prisma.invoiceTemplate.findFirst({
    where: { id, userId: session.id },
  });
  if (!template) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  try {
    const body = await req.json();
    const data = updateSchema.parse(body);
    const updated = await prisma.invoiceTemplate.update({
      where: { id },
      data: {
        ...(data.name != null && { name: data.name }),
        ...(data.businessName != null && { businessName: data.businessName }),
        ...(data.businessPhone !== undefined && { businessPhone: data.businessPhone }),
        ...(data.businessEmail !== undefined && { businessEmail: data.businessEmail }),
        ...(data.businessAddress !== undefined && { businessAddress: data.businessAddress }),
        ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl }),
        ...(data.accentColor != null && { accentColor: data.accentColor }),
      },
    });
    return NextResponse.json({ template: updated });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.message }, { status: 400 });
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const template = await prisma.invoiceTemplate.findFirst({
    where: { id, userId: session.id },
  });
  if (!template) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await prisma.invoiceTemplate.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
