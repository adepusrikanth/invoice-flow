import { notFound } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { InvoiceForm } from '@/components/invoices/InvoiceForm';

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return null;
  const { id } = await params;
  const invoice = await prisma.invoice.findFirst({
    where: { id, userId: session.id },
    include: { client: true, template: true, items: true },
  });
  if (!invoice) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/invoices/${id}`} className="text-neutral-500 hover:text-neutral-900 text-sm">← Invoice</Link>
      </div>
      <h1 className="text-2xl font-bold text-neutral-900">Edit {invoice.invoiceNumber}</h1>
      <InvoiceForm invoice={invoice} />
    </div>
  );
}
