import { notFound } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Pencil, Send, Download } from 'lucide-react';
import { InvoiceTemplatePreview } from '@/components/invoices/InvoiceTemplatePreview';

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return null;
  const { id } = await params;
  const invoice = await prisma.invoice.findFirst({
    where: { id, userId: session.id },
    include: { client: true, template: true, items: true, payments: true },
  });
  if (!invoice) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/invoices" className="text-neutral-500 hover:text-neutral-900 text-sm">← Invoices</Link>
          <h1 className="text-2xl font-bold text-neutral-900 font-mono">{invoice.invoiceNumber}</h1>
          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
            invoice.status === 'paid' ? 'bg-success-bg text-success-dark' :
            invoice.status === 'overdue' ? 'bg-error-bg text-error-dark' : 'bg-neutral-100 text-neutral-600'
          }`}>{invoice.status}</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/invoices/${id}/edit`} className="inline-flex items-center gap-2 px-3 py-2 rounded-button bg-neutral-100 text-neutral-700 hover:bg-neutral-200">
            <Pencil className="w-4 h-4" /> Edit
          </Link>
          <button type="button" className="inline-flex items-center gap-2 px-3 py-2 rounded-button bg-brand-primary text-white hover:bg-brand-primary/90">
            <Send className="w-4 h-4" /> Send
          </button>
          <a href={`/invoices/${id}/print`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-2 rounded-button bg-neutral-100 text-neutral-700 hover:bg-neutral-200">
            <Download className="w-4 h-4" /> Download PDF
          </a>
          <a href={`/api/invoices/${id}/export?format=csv`} className="inline-flex items-center gap-2 px-3 py-2 rounded-button bg-neutral-100 text-neutral-700 hover:bg-neutral-200" aria-label="Download invoice as CSV">
            <Download className="w-4 h-4" /> Download CSV
          </a>
        </div>
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <InvoiceTemplatePreview
            invoiceNumber={invoice.invoiceNumber}
            clientName={invoice.client?.name ?? '—'}
            clientEmail={invoice.client?.email ?? ''}
            issueDate={invoice.issueDate}
            dueDate={invoice.dueDate}
            currency={invoice.currency}
            items={invoice.items.map((i) => ({ description: i.description, quantity: Number(i.quantity), unitPrice: Number(i.unitPrice), amount: Number(i.amount) }))}
            subtotal={invoice.subtotal}
            discountAmount={invoice.discountType && invoice.discountValue != null && invoice.discountValue > 0 ? invoice.subtotal - (invoice.discountType === 'percent' ? invoice.subtotal * (1 - invoice.discountValue / 100) : Math.max(0, invoice.subtotal - invoice.discountValue)) : 0}
            taxRate={invoice.taxRate ?? undefined}
            taxAmount={invoice.taxAmount}
            total={invoice.total}
            notes={invoice.notes ?? ''}
            terms={invoice.terms ?? ''}
            template={invoice.template ? { businessName: invoice.template.businessName, businessPhone: invoice.template.businessPhone, businessEmail: invoice.template.businessEmail, businessAddress: invoice.template.businessAddress, logoUrl: invoice.template.logoUrl ?? null, accentColor: invoice.template.accentColor } : null}
          />
        </div>
        <div className="space-y-4">
          <div className="rounded-card bg-white border border-neutral-200 p-4 shadow-sm">
            <h3 className="font-medium text-neutral-900 mb-3">Payments</h3>
            {invoice.payments.length === 0 ? (
              <p className="text-sm text-neutral-500">No payments recorded.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {invoice.payments.map((p) => (
                  <li key={p.id} className="flex justify-between">
                    <span>{p.method} · {p.paidAt ? new Date(p.paidAt).toLocaleDateString() : '—'}</span>
                    <span className="font-mono">{p.currency} {p.amount.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
