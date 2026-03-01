'use client';

type Item = { description: string; quantity: number; unitPrice: number; amount: number };

type TemplateInfo = {
  businessName: string;
  businessPhone?: string | null;
  businessEmail?: string | null;
  businessAddress?: string | null;
  accentColor?: string;
};

type InvoiceTemplatePreviewProps = {
  invoiceNumber?: string;
  clientName?: string;
  clientEmail?: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  items: Item[];
  subtotal: number;
  discountAmount?: number;
  taxRate?: number;
  taxAmount: number;
  total: number;
  notes?: string;
  terms?: string;
  template?: TemplateInfo | null;
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', INR: '₹', JPY: '¥', CAD: 'C$', AUD: 'A$', CHF: 'CHF', SGD: 'S$',
};

function getCurrencyDisplay(currency: string): string {
  return CURRENCY_SYMBOLS[currency] || currency + ' ';
}

export function InvoiceTemplatePreview({
  invoiceNumber = 'INV-0001',
  clientName = 'Client Name',
  clientEmail = '',
  issueDate,
  dueDate,
  currency,
  items,
  subtotal,
  discountAmount = 0,
  taxRate,
  taxAmount,
  total,
  notes = '',
  terms = '',
  template,
}: InvoiceTemplatePreviewProps) {
  const filtered = items.filter((i) => i.description.trim() || i.amount > 0);
  const displayItems = filtered.length > 0 ? filtered : [{ description: '—', quantity: 0, unitPrice: 0, amount: 0 }];
  const symbol = getCurrencyDisplay(currency);
  const accent = template?.accentColor ?? '#6367FF';
  const bizName = template?.businessName ?? 'InvoiceFlow';
  const bizSub = template?.businessEmail ?? 'Professional Invoicing';

  return (
    <div className="bg-white rounded-card border-2 border-neutral-200 shadow-lg overflow-hidden" style={{ maxWidth: '21cm' }}>
      {/* Header - uses template business details and accent color */}
      <div className="px-6 py-5 text-white" style={{ backgroundColor: accent }}>
        <h1 className="text-xl font-bold tracking-tight">{bizName}</h1>
        <div className="text-white/90 text-sm mt-1 space-y-0.5">
          {template?.businessAddress && <p>{template.businessAddress}</p>}
          {(template?.businessPhone || template?.businessEmail) && (
            <p>{[template.businessPhone, template.businessEmail].filter(Boolean).join(' · ')}</p>
          )}
          {!template?.businessAddress && !template?.businessPhone && !template?.businessEmail && <p>{bizSub}</p>}
        </div>
      </div>
      <div className="px-6 py-4 border-b border-neutral-200">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Invoice</p>
            <p className="text-lg font-bold text-neutral-900 font-mono mt-1">{invoiceNumber}</p>
          </div>
          <div className="text-right text-sm text-neutral-600">
            <p><span className="text-neutral-500">Issue date:</span> {issueDate || '—'}</p>
            <p><span className="text-neutral-500">Due date:</span> {dueDate || '—'}</p>
          </div>
        </div>
      </div>
      {/* Bill to */}
      <div className="px-6 py-4 bg-neutral-50/50 border-b border-neutral-200">
        <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">Bill to</p>
        <p className="font-semibold text-neutral-900">{clientName || '—'}</p>
        {clientEmail && <p className="text-sm text-neutral-600 mt-0.5">{clientEmail}</p>}
      </div>
      {/* Line items */}
      <div className="px-6 py-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-neutral-200 text-left">
              <th className="pb-3 font-semibold text-neutral-700">Description</th>
              <th className="pb-3 font-semibold text-neutral-700 w-16 text-center">Qty</th>
              <th className="pb-3 font-semibold text-neutral-700 w-24 text-right">Rate</th>
              <th className="pb-3 font-semibold text-neutral-700 w-28 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="text-neutral-900">
            {displayItems.map((item, i) => (
              <tr key={i} className="border-b border-neutral-100">
                <td className="py-2.5">{item.description || '—'}</td>
                <td className="py-2.5 text-center font-mono">{item.quantity}</td>
                <td className="py-2.5 text-right font-mono">{symbol}{item.unitPrice.toFixed(2)}</td>
                <td className="py-2.5 text-right font-mono font-medium">{symbol}{item.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Totals */}
      <div className="px-6 py-4 bg-neutral-50/50 border-t border-neutral-200">
        <div className="max-w-xs ml-auto space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Subtotal</span>
            <span className="font-mono text-neutral-900">{symbol}{subtotal.toFixed(2)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">Discount</span>
              <span className="font-mono text-neutral-900">−{symbol}{discountAmount.toFixed(2)}</span>
            </div>
          )}
          {taxAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-neutral-600">{taxRate != null ? `GST (${taxRate}%)` : 'Tax'}</span>
              <span className="font-mono text-neutral-900">{symbol}{taxAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-semibold pt-2 border-t border-neutral-200 mt-2">
            <span className="text-neutral-900">Total</span>
            <span className="font-mono" style={{ color: accent }}>{symbol}{total.toFixed(2)}</span>
          </div>
        </div>
      </div>
      {(notes || terms) && (
        <div className="px-6 py-4 border-t border-neutral-200 text-sm text-neutral-600 space-y-2">
          {notes && <p><span className="font-medium text-neutral-700">Notes:</span> {notes}</p>}
          {terms && <p><span className="font-medium text-neutral-700">Terms:</span> {terms}</p>}
        </div>
      )}
      <div className="px-6 py-3 bg-neutral-100 text-center text-xs text-neutral-500">
        Thank you for your business
      </div>
    </div>
  );
}
