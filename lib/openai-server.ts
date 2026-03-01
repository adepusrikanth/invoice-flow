/**
 * Server-only OpenAI client. NEVER import this from client components.
 * API key: process.env.OPENAI_API_KEY first, then admin-configured key from DB.
 */

import OpenAI from 'openai';
import { getOpenAIKey } from './admin';

let cachedKey: string | null | undefined = undefined;

async function getOpenAIClient(): Promise<OpenAI | null> {
  if (cachedKey === undefined) {
    cachedKey = await getOpenAIKey();
  }
  if (!cachedKey) return null;
  return new OpenAI({ apiKey: cachedKey });
}

/** Invalidate key cache (e.g. after admin updates key). */
export function clearOpenAIKeyCache(): void {
  cachedKey = undefined;
}

export async function getOpenAI(): Promise<OpenAI | null> {
  return getOpenAIClient();
}

export type ExtractedInvoice = {
  vendorName: string | null;
  amount: number | null;
  currency: string | null;
  dueDate: string | null;
  lineItems: Array<{ description: string; quantity?: number; unitPrice?: number; total?: number }>;
};

export async function extractInvoiceFromText(text: string): Promise<ExtractedInvoice> {
  const openai = await getOpenAIClient();
  if (!openai) {
    return { vendorName: null, amount: null, currency: null, dueDate: null, lineItems: [] };
  }

  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are an invoice data extractor. Given raw invoice text, return a JSON object with: vendorName (string), amount (number, total), currency (string), dueDate (string YYYY-MM-DD if present), lineItems (array of { description, quantity?, unitPrice?, total? }). Use only the keys listed. If a field is not found use null for top-level or empty array for lineItems.`,
      },
      { role: 'user', content: text.slice(0, 12000) },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1,
  });

  const raw = res.choices[0]?.message?.content;
  if (!raw) return { vendorName: null, amount: null, currency: null, dueDate: null, lineItems: [] };

  try {
    const parsed = JSON.parse(raw) as ExtractedInvoice;
    return {
      vendorName: parsed.vendorName ?? null,
      amount: typeof parsed.amount === 'number' ? parsed.amount : null,
      currency: parsed.currency ?? null,
      dueDate: parsed.dueDate ?? null,
      lineItems: Array.isArray(parsed.lineItems) ? parsed.lineItems : [],
    };
  } catch {
    return { vendorName: null, amount: null, currency: null, dueDate: null, lineItems: [] };
  }
}

/** RAG: answer user question about invoice data. Context includes precise totals so answers are accurate. */
export async function answerInvoiceQuestion(context: string, userMessage: string): Promise<string> {
  const openai = await getOpenAIClient();
  if (!openai) {
    return 'AI is not configured. Set OPENAI_API_KEY or OPEN_AI_API_KEY in .env (no quotes needed) or in Admin to enable invoice Q&A.';
  }
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a finance assistant. You answer ONLY from the invoice data provided below.

RULES:
- Use ONLY the exact numbers and facts from the data. Do not infer, estimate, or invent any figures.
- All amounts are in Indian Rupees (INR). Always show amounts with the ₹ symbol (e.g. ₹1,50,000.00).
- The data includes a "PRECISE TOTALS" section at the top: use those exact numbers when answering about totals, revenue, or outstanding.
- When asked about a client, use only the line for that client from "By client" or from the invoice list.
- If the data does not contain the answer, say exactly: "The data does not contain that information."
- Be concise. One short paragraph is enough.`,
      },
      {
        role: 'user',
        content: `Invoice data:\n\n${context.slice(0, 14000)}\n\nQuestion: ${userMessage}`,
      },
    ],
    temperature: 0.1,
    max_tokens: 400,
  });
  const text = res.choices[0]?.message?.content?.trim();
  return text ?? 'I could not generate an answer. Please try rephrasing your question.';
}
