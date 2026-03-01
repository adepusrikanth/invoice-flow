import Link from 'next/link';
import { InvoiceForm } from '@/components/invoices/InvoiceForm';

export default function NewInvoicePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/invoices" className="text-neutral-500 hover:text-neutral-900 text-sm">← Invoices</Link>
      </div>
      <h1 className="text-2xl font-bold text-neutral-900">New Invoice</h1>
      <InvoiceForm />
    </div>
  );
}
