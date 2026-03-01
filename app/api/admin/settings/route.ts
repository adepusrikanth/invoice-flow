import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { isAdmin, hasOpenAIKeyConfigured, setOpenAIKey } from '@/lib/admin';
import { clearOpenAIKeyCache } from '@/lib/openai-server';
import { z } from 'zod';

const putSchema = z.object({ openaiApiKey: z.string().min(1).max(500) });

/** GET: admin only. Returns whether OpenAI key is configured (masked). */
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isAdmin(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const configured = await hasOpenAIKeyConfigured();
  return NextResponse.json({ openaiApiKeySet: configured });
}

/** PUT: admin only. Save OpenAI API key. */
export async function PUT(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!isAdmin(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const parsed = putSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'openaiApiKey is required' }, { status: 400 });
  }
  try {
    await setOpenAIKey(parsed.data.openaiApiKey);
    clearOpenAIKeyCache();
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Admin set OpenAI key:', e);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
