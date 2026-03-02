import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { buildInvoiceContext, filterRelevantInvoices } from '@/lib/rag';
import { answerInvoiceQuestion } from '@/lib/openai-server';
import { z } from 'zod';

const bodySchema = z.object({ message: z.string().min(1).max(2000) });

/**
 * POST /api/chat
 * RAG-powered Q&A over the user's invoice data. Returns answer in INR.
 */
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
  if (!parsed.success) {
    return NextResponse.json({ error: 'message is required (1–2000 chars)' }, { status: 400 });
  }
  const { message } = parsed.data;
  const trimmed = message.trim().toLowerCase();
  const isGreeting = /^(hi|hello|hey|hiya|howdy|greetings?|good\s*(morning|afternoon|evening))[\s!.]*$/i.test(trimmed) || trimmed === 'hi' || trimmed === 'hello' || trimmed === 'hey';
  const isAck = /^(ok|okay|thanks?|thank\s+you|got\s*it|alright|sure|cool|great)[\s!.]*$/i.test(trimmed);
  if (isGreeting) {
    return NextResponse.json({
      answer: `Hello! 👋 I'm your invoice assistant. You can ask me about your invoices, totals, outstanding amounts, or revenue by client — all in INR. What would you like to know?`,
      suggestions: ['What is my total outstanding?', 'How many invoices do I have?', 'Revenue from my clients?'],
    });
  }
  if (isAck) {
    return NextResponse.json({
      answer: `Is there anything you'd like to know about your invoices? Try asking about totals, outstanding amount, or revenue by client.`,
      suggestions: ['What is my total outstanding?', 'Which clients have unpaid invoices?', 'What is my total revenue?'],
    });
  }
  try {
    const invoices = await prisma.invoice.findMany({
      where: { userId: session.id },
      include: { client: true, items: true },
      orderBy: { issueDate: 'desc' },
    });
    const relevant = filterRelevantInvoices(invoices, message, 50);
    const context = buildInvoiceContext(relevant);
    const answer = await answerInvoiceQuestion(context, message);
    const needsKey = answer.includes("isn't set up yet") || answer.includes('OPENAI_API_KEY');
    return NextResponse.json({
      answer,
      suggestions: ['What is total revenue?', 'Outstanding amount?', 'Revenue by client?'],
      ...(needsKey && { needsOpenAIKey: true }),
    });
  } catch (e) {
    console.error('Chat API error:', e);
    return NextResponse.json(
      { error: 'Failed to process question. Please try again.' },
      { status: 500 }
    );
  }
}
