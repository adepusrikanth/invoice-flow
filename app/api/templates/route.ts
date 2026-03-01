import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const createSchema = z.object({
  name: z.string().min(1),
  businessName: z.string().min(1),
  businessPhone: z.string().optional(),
  businessEmail: z.string().optional(),
  businessAddress: z.string().optional(),
  accentColor: z.string().optional(),
});

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const templates = await prisma.invoiceTemplate.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ templates });
  } catch {
    return NextResponse.json({ templates: [] });
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const data = createSchema.parse(body);
    const template = await prisma.invoiceTemplate.create({
      data: {
        userId: session.id,
        name: data.name,
        businessName: data.businessName,
        businessPhone: data.businessPhone ?? null,
        businessEmail: data.businessEmail ?? null,
        businessAddress: data.businessAddress ?? null,
        accentColor: data.accentColor ?? '#6367FF',
      },
    });
    return NextResponse.json({ template });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.message }, { status: 400 });
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}
