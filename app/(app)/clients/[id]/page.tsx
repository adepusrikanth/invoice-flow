import { notFound } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { convertToINR, formatINRShort } from '@/lib/currency';

export default async function ClientProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return null;
  const { id } = await params;
  const client = await prisma.client.findFirst({
    where: { id, userId: session.id },
    include: { invoices: { orderBy: { createdAt: 'desc' } } },
  });
  if (!client) notFound();

  const totalBilledInr = client.invoices.reduce((s, inv) => s + convertToINR(inv.total, inv.currency), 0);
  const totalPaidInr = client.invoices.reduce((s, inv) => s + convertToINR(inv.amountPaid, inv.currency), 0);
  const outstandingInr = client.invoices.reduce((s, inv) => s + convertToINR(inv.amountDue, inv.currency), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/clients" className="text-neutral-500 hover:text-neutral-900 text-sm">← Clients</Link>
      </div>
      <div className="rounded-card bg-white border border-neutral-200 shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">{client.name}</h1>
            <p className="text-neutral-600 mt-1">{client.email}</p>
            {client.company && <p className="text-neutral-500 text-sm">{client.company}</p>}
          </div>
          <Link href={`/clients/${id}/edit`} className="text-brand-primary hover:underline text-sm">Edit</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="p-3 rounded-button bg-neutral-50">
            <p className="text-xs text-neutral-500">Total Billed (INR)</p>
            <p className="font-mono font-semibold text-neutral-900">{formatINRShort(totalBilledInr)}</p>
          </div>
          <div className="p-3 rounded-button bg-success-bg">
            <p className="text-xs text-success-dark">Total Paid (INR)</p>
            <p className="font-mono font-semibold text-success-dark">{formatINRShort(totalPaidInr)}</p>
          </div>
          <div className="p-3 rounded-button bg-warning-bg">
            <p className="text-xs text-warning-dark">Outstanding (INR)</p>
            <p className="font-mono font-semibold text-warning-dark">{formatINRShort(outstandingInr)}</p>
          </div>
          <div className="p-3 rounded-button bg-neutral-50">
            <p className="text-xs text-neutral-500">Invoices</p>
            <p className="font-mono font-semibold text-neutral-900">{client.invoices.length}</p>
          </div>
        </div>
      </div>
      <div className="rounded-card bg-white border border-neutral-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-neutral-200">
          <h2 className="font-semibold text-neutral-900">Invoices</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-neutral-500 border-b border-neutral-200 bg-neutral-50">
                <th className="p-3 font-medium">Invoice #</th>
                <th className="p-3 font-medium text-right">Amount</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Due</th>
              </tr>
            </thead>
            <tbody>
              {client.invoices.slice(0, 15).map((inv) => (
                <tr key={inv.id} className="border-b border-neutral-100">
                  <td className="p-3"><Link href={`/invoices/${inv.id}`} className="font-mono text-brand-primary hover:underline">{inv.invoiceNumber}</Link></td>
                  <td className="p-3 text-right font-mono">{formatINRShort(convertToINR(inv.total, inv.currency))}</td>
                  <td className="p-3"><span className="text-neutral-600">{inv.status}</span></td>
                  <td className="p-3 text-neutral-500">{inv.dueDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {client.invoices.length === 0 && <div className="p-6 text-center text-neutral-500">No invoices for this client.</div>}
        {client.invoices.length > 15 && <div className="p-3 text-center text-sm text-neutral-500">Showing latest 15 of {client.invoices.length} invoices.</div>}
      </div>
    </div>
  );
}
