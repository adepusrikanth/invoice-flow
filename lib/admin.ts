/**
 * Admin-only helpers. Admin is determined by ADMIN_EMAIL env (your email).
 * No UI link to admin; only you can open /admin by URL.
 */

import type { SessionUser } from './auth';
import { prisma } from './db';

const OPENAI_KEY_SETTING = 'openai_api_key';

export function isAdmin(session: SessionUser | null): boolean {
  if (!session?.email) return false;
  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  if (!adminEmail) return false;
  return session.email.toLowerCase() === adminEmail.toLowerCase();
}

/** Get OpenAI API key: env OPENAI_API_KEY or OPEN_AI_API_KEY (no quotes needed in .env), then DB. */
export async function getOpenAIKey(): Promise<string | null> {
  const envKey = (process.env.OPENAI_API_KEY ?? process.env.OPEN_AI_API_KEY)?.trim();
  if (envKey) return envKey;
  try {
    const row = await prisma.appSetting.findUnique({
      where: { key: OPENAI_KEY_SETTING },
    });
    const v = row?.value?.trim();
    return v || null;
  } catch {
    return null;
  }
}

export async function setOpenAIKey(value: string): Promise<void> {
  await prisma.appSetting.upsert({
    where: { key: OPENAI_KEY_SETTING },
    create: { key: OPENAI_KEY_SETTING, value: value.trim() },
    update: { value: value.trim() },
  });
}

export async function hasOpenAIKeyConfigured(): Promise<boolean> {
  const key = await getOpenAIKey();
  return !!key;
}
