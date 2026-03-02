'use client';

type Item = { description: string; quantity: number; unitPrice: number; amount: number };

type TemplateInfo = {
  businessName: string;
  businessPhone?: string | null;
  businessEmail?: string | null;
  businessAddress?: string | null;
  logoUrl?: string | null;
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
  const hasLogo = !!template?.logoUrl;

  return (
    <div className="bg-white rounded-card border-2 border-neutral-200 shadow-lg overflow-hidden" style={{ maxWidth: '21cm' }}>
      {/* Top bar: INVOICE title + logo (design-aligned) */}
      <div className="px-6 py-4 border-b border-neutral-200 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">INVOICE</h1>
          <div className="mt-2 text-sm text-neutral-600 space-y-0.5">
            <p><span className="text-neutral-500 font-medium">Invoice number:</span> {invoiceNumber}</p>
            <p><span className="text-neutral-500 font-medium">Issue date:</span> {issueDate || '—'}</p>
            <p><span className="text-neutral-500 font-medium">Due date:</span> {dueDate || '—'}</p>
          </div>
        </div>
        {hasLogo ? (
          <div className="shrink-0">
            <img src={template!.logoUrl!} alt="" className="h-16 w-auto max-w-[160px] object-contain" />
          </div>
        ) : (
          <div className="h-16 w-32 border border-neutral-200 rounded flex items-center justify-center text-neutral-400 text-xs text-center px-2">Company logo</div>
        )}
      </div>

      {/* Business details + Bill to row */}
      <div className="px-6 py-4 border-b border-neutral-200 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">From</p>
          <p className="font-semibold text-neutral-900">{bizName}</p>
          {template?.businessAddress && <p className="text-sm text-neutral-600 mt-0.5">{template.businessAddress}</p>}
          {(template?.businessPhone || template?.businessEmail) && (
            <p className="text-sm text-neutral-600">{[template.businessPhone, template.businessEmail].filter(Boolean).join(' · ')}</p>
          )}
          {!template?.businessAddress && !template?.businessPhone && !template?.businessEmail && <p className="text-sm text-neutral-500">{bizSub}</p>}
        </div>
        <div>
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Bill to</p>
          <p className="font-semibold text-neutral-900">{clientName || '—'}</p>
          {clientEmail && <p className="text-sm text-neutral-600 mt-0.5">{clientEmail}</p>}
        </div>
      </div>

      {/* Line items */}
      <div className="px-6 py-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-neutral-200 text-left bg-neutral-50">
              <th className="pb-3 pt-2 font-semibold text-neutral-700">Description</th>
              <th className="pb-3 pt-2 font-semibold text-neutral-700 w-16 text-center">Qty</th>
              <th className="pb-3 pt-2 font-semibold text-neutral-700 w-24 text-right">Rate</th>
              <th className="pb-3 pt-2 font-semibold text-neutral-700 w-28 text-right" style={{ backgroundColor: accent, color: 'white' }}>Amount</th>
            </tr>
          </thead>
          <tbody className="text-neutral-900">
            {displayItems.map((item, i) => (
              <tr key={i} className={`border-b border-neutral-100 ${i % 2 === 1 ? 'bg-neutral-50/50' : ''}`}>
                <td className="py-2.5">{item.description || '—'}</td>
                <td className="py-2.5 text-center font-mono">{item.quantity}</td>
                <td className="py-2.5 text-right font-mono">{symbol}{item.unitPrice.toFixed(2)}</td>
                <td className="py-2.5 text-right font-mono font-medium">{symbol}{item.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Notes/Terms + Totals row */}
      <div className="px-6 py-4 border-b border-neutral-200 flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          {notes && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Notes</p>
              <p className="text-sm text-neutral-700">{notes}</p>
            </div>
          )}
          {terms && (
            <div>
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">Terms</p>
              <p className="text-sm text-neutral-700">{terms}</p>
            </div>
          )}
        </div>
        <div className="w-full md:max-w-xs md:ml-auto space-y-1">
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
          <div className="flex justify-between text-base font-semibold pt-2 border-t-2 border-neutral-200 mt-2">
            <span className="text-neutral-900">Total</span>
            <span className="font-mono" style={{ color: accent }}>{symbol}{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment due + Thank you */}
      <div className="px-6 py-4 border-b border-neutral-200 text-center">
        <p className="text-sm text-neutral-600">Payment due by: <strong className="text-neutral-900">{dueDate || '—'}</strong></p>
        <p className="text-lg font-medium text-neutral-800 mt-2 italic">Thank you for your business!</p>
      </div>

      {/* Footer: company name + contact */}
      <div className="px-6 py-4 bg-neutral-50 flex flex-wrap justify-between items-center gap-4 text-sm text-neutral-600">
        <p className="font-semibold text-neutral-900" style={{ color: accent }}>{bizName}</p>
        <div className="text-right">
          {template?.businessAddress && <p>{template.businessAddress}</p>}
          {(template?.businessPhone || template?.businessEmail) && (
            <p>{[template.businessPhone, template.businessEmail].filter(Boolean).join(' · ')}</p>
          )}
        </div>
      </div>
    </div>
  );
}
