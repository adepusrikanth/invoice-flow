import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { createSession } from '@/lib/auth';

const bodySchema = z.object({ email: z.string().email(), password: z.string().min(1) });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = bodySchema.parse(body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    await createSession(user.id, user.email, user.name);
    return NextResponse.json({ ok: true, user: { id: user.id, email: user.email, name: user.name } });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    if ((e as { code?: string })?.code === 'P1001' || (e instanceof Error && e.message?.includes('Prisma')))
      return NextResponse.json({ error: 'Database unavailable. Please try again later.' }, { status: 503 });
    console.error('Login error:', e);
    return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 500 });
  }
}
