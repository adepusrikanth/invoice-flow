import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { createSession } from '@/lib/auth';

const bodySchema = z.object({ email: z.string().email(), password: z.string().min(8), name: z.string().optional() });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name } = bodySchema.parse(body);
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, password: hashed, name: name || null } });
    await createSession(user.id, user.email, user.name);
    return NextResponse.json({ ok: true, user: { id: user.id, email: user.email, name: user.name } });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: 'Invalid input. Email and password (min 8 characters) required.' }, { status: 400 });
    const code = (e as { code?: string })?.code;
    if (code === 'P1001' || code === 'P1002' || (e instanceof Error && (e.message?.includes('Prisma') || e.message?.includes('connect'))))
      return NextResponse.json({ error: 'Database unavailable. Please try again in a moment.' }, { status: 503 });
    if (e instanceof Error && e.message?.includes('Unique constraint'))
      return NextResponse.json({ error: 'Email already registered.' }, { status: 400 });
    console.error('Register error:', e);
    return NextResponse.json({ error: 'Something went wrong. Please check your details and try again.' }, { status: 500 });
  }
}
