import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function InvoicesPage() {
  const session = await getSession();
  if (!session) return null;

  let invoices: Awaited<ReturnType<typeof prisma.invoice.findMany<{ include: { client: true } }>>> = [];
  let loadError = false;
  try {
    invoices = await prisma.invoice.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: 'desc' },
      include: { client: true },
    });
  } catch (e) {
    console.error('Invoices page error:', e);
    loadError = true;
  }

  const safeTotal = (inv: { total?: number | null }) => (inv.total != null ? Number(inv.total) : 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-neutral-900">Invoices</h1>
        <Link href="/invoices/new" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-button bg-brand-primary text-white font-medium hover:bg-brand-primary/90">
          <Plus className="w-4 h-4" /> New Invoice
        </Link>
      </div>
      {loadError && (
        <div className="rounded-card bg-error-bg border border-error-dark/20 p-4 text-error-dark text-sm">
          Unable to load invoices. Check your database connection and try again.
        </div>
      )}
      <div className="rounded-card bg-white border border-neutral-200 shadow-sm overflow-hidden">
        {/* Mobile: card list */}
        <div className="md:hidden divide-y divide-neutral-100">
          {invoices.map((inv) => (
            <Link key={inv.id} href={`/invoices/${inv.id}`} className="block p-4 hover:bg-neutral-50 active:bg-neutral-100">
              <div className="flex justify-between items-start">
                <span className="font-mono font-medium text-neutral-900">{inv.invoiceNumber}</span>
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                  inv.status === 'paid' ? 'bg-success-bg text-success-dark' :
                  inv.status === 'overdue' ? 'bg-error-bg text-error-dark' :
                  inv.status === 'sent' ? 'bg-info-bg text-info-dark' : 'bg-neutral-100 text-neutral-600'
                }`}>{inv.status}</span>
              </div>
              <p className="text-sm text-neutral-600 mt-1">{inv.client?.name ?? '—'}</p>
              <p className="text-sm font-mono text-neutral-900 mt-1">{inv.currency} {safeTotal(inv).toFixed(2)}</p>
              <p className="text-xs text-neutral-500 mt-1">{inv.issueDate} → {inv.dueDate}</p>
              <div className="flex gap-3 mt-3">
                <span className="text-brand-primary text-sm font-medium">View</span>
                <Link href={`/invoices/${inv.id}/edit`} onClick={(e) => e.stopPropagation()} className="text-neutral-500 text-sm">Edit</Link>
              </div>
            </Link>
          ))}
        </div>
        {/* Desktop: table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-left text-neutral-500 border-b border-neutral-200 bg-neutral-50">
                <th className="p-3 font-medium">Invoice #</th>
                <th className="p-3 font-medium">Client</th>
                <th className="p-3 font-medium text-right">Amount</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Issue Date</th>
                <th className="p-3 font-medium">Due Date</th>
                <th className="p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                  <td className="p-3 font-mono text-neutral-900">{inv.invoiceNumber}</td>
                  <td className="p-3 text-neutral-600">{inv.client?.name ?? '—'}</td>
                  <td className="p-3 text-right font-mono text-neutral-900">{inv.currency} {safeTotal(inv).toFixed(2)}</td>
                  <td className="p-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      inv.status === 'paid' ? 'bg-success-bg text-success-dark' :
                      inv.status === 'overdue' ? 'bg-error-bg text-error-dark' :
                      inv.status === 'sent' ? 'bg-info-bg text-info-dark' : 'bg-neutral-100 text-neutral-600'
                    }`}>{inv.status}</span>
                  </td>
                  <td className="p-3 text-neutral-500">{inv.issueDate}</td>
                  <td className="p-3 text-neutral-500">{inv.dueDate}</td>
                  <td className="p-3">
                    <Link href={`/invoices/${inv.id}`} className="text-brand-primary hover:underline mr-2">View</Link>
                    <Link href={`/invoices/${inv.id}/edit`} className="text-neutral-500 hover:underline">Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {invoices.length === 0 && (
          <div className="p-12 text-center text-neutral-500">
            <p className="mb-4">No invoices yet.</p>
            <Link href="/invoices/new" className="text-brand-primary font-medium hover:underline">Create your first invoice</Link>
          </div>
        )}
      </div>
    </div>
  );
}
