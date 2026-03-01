'use client';

/** Dummy data for landing page invoice template previews */
const DUMMY = {
  business: {
    name: 'Acme Solutions',
    address: '42 Innovation Park, Bangalore 560001',
    phone: '+91 80 4123 4567',
    email: 'billing@acmesolutions.in',
  },
  client: {
    name: 'TechStart India Pvt Ltd',
    address: '123 Business Avenue, Suite 400, Mumbai 400001',
    email: 'accounts@techstart.in',
    phone: '+91 22 6789 0123',
  },
  invoiceNumber: 'INV-2024-0847',
  issueDate: '15 Jan 2025',
  dueDate: '14 Feb 2025',
  currency: 'INR',
  symbol: '₹',
  items: [
    { description: 'Consulting — Phase 1 Discovery', quantity: 40, unitPrice: 2500, amount: 100000 },
    { description: 'Software Development — API Integration', quantity: 1, unitPrice: 85000, amount: 85000 },
    { description: 'UI/UX Design — Dashboard', quantity: 1, unitPrice: 45000, amount: 45000 },
    { description: 'Support & Maintenance (3 months)', quantity: 1, unitPrice: 18000, amount: 18000 },
  ],
  subtotal: 248000,
  taxAmount: 44640,
  total: 292640,
  notes: 'Payment terms: 50% advance, 50% on delivery. Bank details shared separately.',
  terms: 'Net 30. Late payment may attract 1.5% monthly interest.',
};

type TemplateVariant = 'professional' | 'classic' | 'modern' | 'corporate';

function LogoPlaceholder({ className = '' }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center rounded-lg bg-white/20 text-white/90 text-xs font-medium ${className}`}
      style={{ minWidth: 48, minHeight: 48 }}
    >
      Logo
    </div>
  );
}

function TemplateCard({
  variant,
  accent,
  title,
}: {
  variant: TemplateVariant;
  accent: string;
  title: string;
}) {
  const d = DUMMY;
  const fontClass =
    variant === 'classic' ? 'font-serif' : variant === 'modern' ? 'font-display' : 'font-sans';

  const isClassic = variant === 'classic';
  const isCorporate = variant === 'corporate';

  return (
    <div
      className={`bg-white rounded-xl border-2 border-neutral-200 shadow-xl overflow-hidden flex-shrink-0 w-[320px] sm:w-[360px] print:w-full ${fontClass}`}
      style={{ maxWidth: '21cm' }}
    >
      {/* Header: Classic = minimal with left accent bar; Corporate = split; others = full */}
      {isClassic ? (
        <div className="flex border-l-4 px-5 py-4" style={{ borderLeftColor: accent }}>
          <LogoPlaceholder className="shrink-0 !bg-neutral-200 !text-neutral-600" />
          <div className="ml-3 min-w-0">
            <h3 className="font-bold text-neutral-900 text-lg">{d.business.name}</h3>
            <p className="text-neutral-600 text-xs mt-0.5">{d.business.address}</p>
            <p className="text-neutral-500 text-xs">{d.business.phone} · {d.business.email}</p>
          </div>
        </div>
      ) : isCorporate ? (
        <div className="px-5 py-4 flex items-center justify-between gap-4" style={{ backgroundColor: accent }}>
          <LogoPlaceholder className="shrink-0" />
          <div className="text-white text-right min-w-0">
            <h3 className="font-bold text-lg">{d.business.name}</h3>
            <p className="text-white/90 text-xs">{d.business.email}</p>
          </div>
        </div>
      ) : (
        <div
          className="px-5 py-4 text-white flex items-start gap-3"
          style={{ backgroundColor: accent }}
        >
          <LogoPlaceholder className="shrink-0" />
          <div className="min-w-0">
            <h3 className="font-bold truncate text-lg">{d.business.name}</h3>
            <p className="text-white/90 text-xs mt-0.5">{d.business.address}</p>
            <p className="text-white/90 text-xs">{d.business.phone} · {d.business.email}</p>
          </div>
        </div>
      )}

      {/* Invoice # and dates */}
      <div className="px-5 py-3 border-b border-neutral-100 flex justify-between items-center">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium">Invoice</p>
          <p className={`font-mono font-semibold text-neutral-900 ${isClassic ? 'text-base' : 'text-sm'}`}>{d.invoiceNumber}</p>
        </div>
        <div className="text-right text-xs text-neutral-600">
          <p>Issue: {d.issueDate}</p>
          <p>Due: {d.dueDate}</p>
        </div>
      </div>

      {/* Bill to - full client details */}
      <div className="px-5 py-3 bg-neutral-50/80 border-b border-neutral-100">
        <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium mb-1.5">Bill to</p>
        <p className="font-semibold text-neutral-900 text-sm">{d.client.name}</p>
        <p className="text-xs text-neutral-600 mt-0.5">{d.client.address}</p>
        <p className="text-xs text-neutral-600">{d.client.email}</p>
        <p className="text-xs text-neutral-500">{d.client.phone}</p>
      </div>

      {/* Line items */}
      <div className="px-5 py-3">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b-2 border-neutral-200 text-left text-neutral-600">
              <th className="pb-2 font-semibold">Description</th>
              <th className="pb-2 font-semibold w-12 text-center">Qty</th>
              <th className="pb-2 font-semibold w-16 text-right">Rate</th>
              <th className="pb-2 font-semibold w-18 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="text-neutral-900">
            {d.items.map((row, i) => (
              <tr key={i} className="border-b border-neutral-100">
                <td className="py-2">{row.description}</td>
                <td className="py-2 text-center font-mono">{row.quantity}</td>
                <td className="py-2 text-right font-mono">{d.symbol}{row.unitPrice.toLocaleString('en-IN')}</td>
                <td className="py-2 text-right font-mono font-medium">{d.symbol}{row.amount.toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="px-5 py-3 bg-neutral-50/80 border-t border-neutral-100">
        <div className="max-w-[200px] ml-auto space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-neutral-600">Subtotal</span>
            <span className="font-mono">{d.symbol}{d.subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-600">GST (18%)</span>
            <span className="font-mono">{d.symbol}{d.taxAmount.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between font-semibold pt-2 mt-2 border-t border-neutral-200" style={{ color: accent }}>
            <span className="text-neutral-900">Total</span>
            <span className="font-mono">{d.symbol}{d.total.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Notes & Terms */}
      <div className="px-5 py-2 border-t border-neutral-100 text-[10px] text-neutral-600 space-y-1">
        <p><span className="font-medium text-neutral-700">Notes:</span> {d.notes}</p>
        <p><span className="font-medium text-neutral-700">Terms:</span> {d.terms}</p>
      </div>
      <div className="px-5 py-2 bg-neutral-100 text-center text-[10px] text-neutral-500">
        Thank you for your business
      </div>

      {/* Template label */}
      <div className="px-5 py-2 border-t border-neutral-200 bg-neutral-50 text-center">
        <span className="text-xs font-semibold text-neutral-600" style={{ color: accent }}>{title}</span>
      </div>
    </div>
  );
}

const TEMPLATES: { variant: TemplateVariant; accent: string; title: string }[] = [
  { variant: 'professional', accent: '#6367FF', title: 'Professional' },
  { variant: 'classic', accent: '#0F766E', title: 'Classic' },
  { variant: 'modern', accent: '#14B8A6', title: 'Modern' },
  { variant: 'corporate', accent: '#7C3AED', title: 'Corporate' },
];

export function LandingInvoiceTemplates() {
  return (
    <section id="templates" className="py-16 bg-gradient-to-b from-neutral-50 to-white">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-center text-sm font-semibold text-brand-primary uppercase tracking-wider mb-2 opacity-0 animate-fade-in-up">
          Invoice templates
        </h2>
        <p className="text-center text-2xl md:text-3xl font-bold text-neutral-900 mb-4 opacity-0 animate-fade-in-up delay-100">
          Full templates with client details, products & pricing
        </p>
        <p className="text-center text-neutral-600 text-sm mb-10 max-w-xl mx-auto opacity-0 animate-fade-in-up delay-200">
          Each template includes your logo, business & client info, line items, and totals. Choose a style that fits your brand.
        </p>
        <div className="flex gap-6 overflow-x-auto pb-4 px-2 justify-center flex-wrap md:flex-nowrap md:justify-center md:overflow-visible">
          {TEMPLATES.map((t, i) => (
            <div
              key={t.title}
              className="opacity-0 animate-fade-in-up flex justify-center"
              style={{ animationDelay: `${200 + i * 100}ms` }}
            >
              <TemplateCard variant={t.variant} accent={t.accent} title={t.title} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
