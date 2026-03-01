/**
 * RAG-lite: build text context from invoice data for LLM Q&A.
 * All amounts are converted to INR for consistent reporting.
 */

import { convertToINR } from './currency';

export type InvoiceForRag = {
  id: string;
  invoiceNumber: string;
  status: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  notes: string | null;
  client?: { name: string; email: string } | null;
  items?: Array<{ description: string; quantity: number; unitPrice: number; amount: number }>;
};

/** Pre-compute summary stats (INR) so RAG answers are accurate from exact numbers. */
export function buildSummaryStats(invoices: InvoiceForRag[]): string {
  const byClient: Record<string, { total: number; paid: number; due: number; count: number }> = {};
  let totalRevenue = 0;
  let totalOutstanding = 0;
  let totalPaid = 0;
  for (const inv of invoices) {
    const inrTotal = convertToINR(inv.total, inv.currency);
    const inrPaid = convertToINR(inv.amountPaid, inv.currency);
    const inrDue = convertToINR(inv.amountDue, inv.currency);
    const name = inv.client?.name ?? 'No client';
    if (!byClient[name]) byClient[name] = { total: 0, paid: 0, due: 0, count: 0 };
    byClient[name].total += inrTotal;
    byClient[name].paid += inrPaid;
    byClient[name].due += inrDue;
    byClient[name].count += 1;
    totalRevenue += inrTotal;
    totalPaid += inrPaid;
    if (inv.status !== 'paid' && inv.status !== 'cancelled') totalOutstanding += inrDue;
  }
  const lines: string[] = [
    '--- PRECISE TOTALS (use these exact numbers in answers) ---',
    `Total revenue (all invoices): INR ${totalRevenue.toFixed(2)}`,
    `Total paid: INR ${totalPaid.toFixed(2)}`,
    `Total outstanding (unpaid): INR ${totalOutstanding.toFixed(2)}`,
    `Number of invoices: ${invoices.length}`,
    '',
    'By client:',
  ];
  for (const [clientName, stats] of Object.entries(byClient)) {
    lines.push(`  ${clientName}: ${stats.count} invoice(s), total billed INR ${stats.total.toFixed(2)}, paid INR ${stats.paid.toFixed(2)}, outstanding INR ${stats.due.toFixed(2)}`);
  }
  lines.push('--- END TOTALS ---');
  return lines.join('\n');
}

/** Build a plain-text summary of invoices for LLM context. Includes precise totals for accurate answers. */
export function buildInvoiceContext(invoices: InvoiceForRag[]): string {
  const summary = buildSummaryStats(invoices);
  const lines: string[] = [
    summary,
    '',
    '=== INVOICE DATA (all amounts in INR) ===',
    '',
  ];
  for (const inv of invoices) {
    const inrTotal = convertToINR(inv.total, inv.currency);
    const inrDue = convertToINR(inv.amountDue, inv.currency);
    const clientName = inv.client?.name ?? 'No client';
    lines.push(`Invoice: ${inv.invoiceNumber} | Client: ${clientName} | Issue: ${inv.issueDate} | Due: ${inv.dueDate} | Status: ${inv.status} | Total (INR): ${inrTotal.toFixed(2)} | Amount Due (INR): ${inrDue.toFixed(2)}`);
    if (inv.items?.length) {
      for (const item of inv.items) {
        const amtInr = convertToINR(item.amount, inv.currency);
        lines.push(`  - ${item.description}: qty ${item.quantity} × ${inv.currency} ${item.unitPrice} = INR ${amtInr.toFixed(2)}`);
      }
    }
    lines.push('');
  }
  lines.push('=== END DATA ===');
  return lines.join('\n');
}

/** Filter invoices relevant to query: by client name, date range, or recent. */
export function filterRelevantInvoices(
  invoices: InvoiceForRag[],
  query: string,
  maxInvoices: number = 50
): InvoiceForRag[] {
  const q = query.toLowerCase();
  const hasClient = /client|from\s+\w+|revenue\s+from|billed\s+to/.test(q);
  const hasQuarter = /quarter|last\s+3\s+months|q[1-4]/.test(q);
  const hasMonth = /month|this\s+month|last\s+month/.test(q);
  let filtered = invoices;
  if (hasClient) {
    const clientMatch = q.match(/(?:client|from)\s+([a-z0-9\s]+?)(?:\s+in|\s+for|$)/i) ?? q.match(/([a-z]+)\s+(?:in|revenue|total)/i);
    const clientName = clientMatch?.[1]?.trim();
    if (clientName) {
      filtered = invoices.filter((inv) => inv.client?.name?.toLowerCase().includes(clientName.toLowerCase()));
    }
  }
  if (filtered.length === invoices.length && (hasQuarter || hasMonth)) {
    const now = new Date();
    if (hasQuarter) {
      const quarterStart = new Date(now);
      quarterStart.setMonth(quarterStart.getMonth() - 3);
      const start = quarterStart.toISOString().slice(0, 10);
      filtered = invoices.filter((i) => i.issueDate >= start);
    } else if (hasMonth) {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 0);
      const start = monthStart.toISOString().slice(0, 10);
      filtered = invoices.filter((i) => i.issueDate >= start);
    }
  }
  if (filtered.length === 0) filtered = invoices;
  return filtered
    .sort((a, b) => (b.issueDate > a.issueDate ? 1 : -1))
    .slice(0, maxInvoices);
}
