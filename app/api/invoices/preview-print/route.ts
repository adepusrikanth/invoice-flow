import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

const itemSchema = z.object({
  description: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  amount: z.number(),
});
const bodySchema = z.object({
  invoiceNumber: z.string().optional(),
  clientName: z.string().optional(),
  clientEmail: z.string().optional(),
  issueDate: z.string(),
  dueDate: z.string(),
  currency: z.string(),
  items: z.array(itemSchema),
  subtotal: z.number(),
  taxAmount: z.number(),
  total: z.number(),
  notes: z.string().optional(),
  terms: z.string().optional(),
  template: z
    .object({
      businessName: z.string().optional(),
      businessPhone: z.string().optional().nullable(),
      businessEmail: z.string().optional().nullable(),
      businessAddress: z.string().optional().nullable(),
      logoUrl: z.string().optional().nullable(),
      accentColor: z.string().optional(),
    })
    .optional()
    .nullable(),
});

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', INR: '₹', JPY: '¥', CAD: 'C$', AUD: 'A$', CHF: 'CHF', SGD: 'S$',
};

function symbol(c: string) {
  return CURRENCY_SYMBOLS[c] ?? c + ' ';
}

/** POST: returns HTML for invoice preview (for print/PDF). Session required. */
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
    return NextResponse.json({ error: 'Invalid preview data' }, { status: 400 });
  }
  const d = parsed.data;
  const sym = symbol(d.currency);
  const accent = d.template?.accentColor ?? '#6367FF';
  const bizName = d.template?.businessName ?? 'InvoiceFlow';
  const items = d.items.filter((i) => i.description.trim() || i.amount > 0);
  const displayItems = items.length ? items : [{ description: '—', quantity: 0, unitPrice: 0, amount: 0 }];

  const rows = displayItems
    .map(
      (i) => `
    <tr>
      <td class="py-2">${escapeHtml(i.description)}</td>
      <td class="py-2 text-center">${i.quantity}</td>
      <td class="py-2 text-right">${sym}${i.unitPrice.toFixed(2)}</td>
      <td class="py-2 text-right">${sym}${i.amount.toFixed(2)}</td>
    </tr>`
    )
    .join('');

  const logoHtml = d.template?.logoUrl
    ? `<img src="${d.template.logoUrl.replace(/"/g, '&quot;')}" alt="" style="height: 64px; width: auto; max-width: 160px; object-fit: contain;" />`
    : '<div style="height: 64px; width: 128px; border: 1px solid #ddd; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 11px; color: #999;">Company logo</div>';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Invoice ${escapeHtml(d.invoiceNumber ?? 'Preview')}</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #f5f5f5; margin: 0; padding: 16px; color: #0F0F1A; }
    .invoice { max-width: 21cm; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden; }
    .top-bar { padding: 16px 24px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: flex-start; }
    .from-bill { padding: 16px 24px; border-bottom: 1px solid #eee; display: grid; grid-template-columns: 1fr 1fr; gap: 24px; background: #fafafa; }
    .meta { padding: 16px 24px; border-bottom: 1px solid #eee; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th { text-align: left; padding: 12px 24px; border-bottom: 2px solid #eee; background: #f5f5f5; color: #444; }
    th.text-right { text-align: right; }
    th.text-center { text-align: center; }
    td { padding: 10px 24px; border-bottom: 1px solid #eee; }
    tr:nth-child(even) td { background: #fafafa; }
    .totals { padding: 16px 24px; border-top: 1px solid #eee; }
    .totals-inner { max-width: 240px; margin-left: auto; }
    .totals-row { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 14px; }
    .totals-total { font-weight: 600; font-size: 16px; padding-top: 8px; margin-top: 8px; border-top: 2px solid #eee; }
    .notes { padding: 16px 24px; border-top: 1px solid #eee; font-size: 13px; color: #444; }
    .thank-you { padding: 16px 24px; border-bottom: 1px solid #eee; text-align: center; }
    .footer { padding: 12px 24px; background: #f5f5f5; display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #666; }
    .no-print { margin-bottom: 16px; padding: 12px 24px; background: #6367FF; color: #fff; border-radius: 8px; display: flex; align-items: center; justify-content: space-between; }
    .no-print button { padding: 8px 16px; background: #fff; color: #6367FF; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; }
    .no-print button:hover { opacity: 0.9; }
    @media print { .no-print { display: none !important; } body { background: #fff; padding: 0; } .invoice { box-shadow: none; } }
  </style>
</head>
<body>
  <div class="no-print">
    <span>Save as PDF: use the button below or your browser&apos;s print dialog.</span>
    <button type="button" onclick="window.print()">Print / Save as PDF</button>
  </div>
  <div class="invoice">
    <div class="top-bar">
      <div>
        <h1 style="margin:0; font-size: 24px; font-weight: 700;">INVOICE</h1>
        <p style="margin: 8px 0 0; font-size: 13px; color: #444;">Invoice number: ${escapeHtml(d.invoiceNumber ?? 'INV-0001')}</p>
        <p style="margin: 4px 0 0; font-size: 13px; color: #444;">Issue date: ${escapeHtml(d.issueDate)}</p>
        <p style="margin: 4px 0 0; font-size: 13px; color: #444;">Due date: ${escapeHtml(d.dueDate)}</p>
      </div>
      <div>${logoHtml}</div>
    </div>
    <div class="from-bill">
      <div>
        <p style="margin:0; font-size: 11px; text-transform: uppercase; color: #666; font-weight: 600;">From</p>
        <p style="margin: 4px 0 0; font-weight: 600;">${escapeHtml(bizName)}</p>
        ${d.template?.businessAddress ? `<p style="margin: 4px 0 0; font-size: 13px; color: #444;">${escapeHtml(d.template.businessAddress)}</p>` : ''}
        ${(d.template?.businessPhone || d.template?.businessEmail) ? `<p style="margin: 4px 0 0; font-size: 13px; color: #444;">${escapeHtml([d.template.businessPhone, d.template.businessEmail].filter(Boolean).join(' · '))}</p>` : ''}
      </div>
      <div>
        <p style="margin:0; font-size: 11px; text-transform: uppercase; color: #666; font-weight: 600;">Bill to</p>
        <p style="margin: 4px 0 0; font-weight: 600;">${escapeHtml(d.clientName ?? '—')}</p>
        ${d.clientEmail ? `<p style="margin: 4px 0 0; font-size: 13px; color: #444;">${escapeHtml(d.clientEmail)}</p>` : ''}
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th class="text-center" style="width: 60px;">Qty</th>
          <th class="text-right" style="width: 80px;">Rate</th>
          <th class="text-right" style="width: 100px;">Amount</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="totals">
      <div class="totals-inner">
        <div class="totals-row"><span>Subtotal</span><span>${sym}${d.subtotal.toFixed(2)}</span></div>
        ${d.taxAmount > 0 ? `<div class="totals-row"><span>Tax</span><span>${sym}${d.taxAmount.toFixed(2)}</span></div>` : ''}
        <div class="totals-row totals-total" style="color: ${accent}"><span>Total</span><span>${sym}${d.total.toFixed(2)}</span></div>
      </div>
    </div>
    ${(d.notes || d.terms) ? `<div class="notes">${d.notes ? `<p style="margin:0 0 8px;"><strong>Notes:</strong> ${escapeHtml(d.notes)}</p>` : ''}${d.terms ? `<p style="margin:0;"><strong>Terms:</strong> ${escapeHtml(d.terms)}</p>` : ''}</div>` : ''}
    <div class="thank-you"><p style="margin:0; font-size: 13px; color: #444;">Payment due by: <strong>${escapeHtml(d.dueDate)}</strong></p><p style="margin: 8px 0 0; font-size: 16px; font-style: italic;">Thank you for your business!</p></div>
    <div class="footer"><span style="font-weight: 600; color: ${accent};">${escapeHtml(bizName)}</span><span>${d.template?.businessAddress ? escapeHtml(d.template.businessAddress) : ''} ${(d.template?.businessPhone || d.template?.businessEmail) ? ' · ' + escapeHtml([d.template.businessPhone, d.template.businessEmail].filter(Boolean).join(' ')) : ''}</span></div>
  </div>
  <script>window.onload = function() { try { window.print(); } catch (e) {} }</script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
