import { notFound } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { InvoiceTemplatePreview } from '@/components/invoices/InvoiceTemplatePreview';
import { PrintPDFActions } from '@/components/invoices/PrintPDFActions';

export default async function InvoicePrintPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return null;
  const { id } = await params;
  const invoice = await prisma.invoice.findFirst({
    where: { id, userId: session.id },
    include: { client: true, template: true, items: true },
  });
  if (!invoice) notFound();

  return (
    <div className="min-h-screen bg-neutral-100 py-8 px-4 print:bg-white print:py-0 print:px-0">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 print:hidden">
          <PrintPDFActions />
        </div>
        <div className="print:shadow-none">
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
            template={invoice.template ? { businessName: invoice.template.businessName, businessPhone: invoice.template.businessPhone, businessEmail: invoice.template.businessEmail, businessAddress: invoice.template.businessAddress, accentColor: invoice.template.accentColor } : null}
          />
        </div>
      </div>
    </div>
  );
}
