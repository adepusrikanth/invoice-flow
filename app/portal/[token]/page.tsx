import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';

export default async function ClientPortalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { viewToken: token },
    include: { client: true, items: true },
  });
  if (!invoice) notFound();

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="rounded-card bg-white border border-neutral-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-neutral-200">
            <h1 className="text-xl font-bold text-neutral-900 font-mono">{invoice.invoiceNumber}</h1>
            <p className="text-neutral-500 text-sm mt-1">Due: {invoice.dueDate}</p>
          </div>
          <div className="p-6">
            <p className="text-sm text-neutral-500 mb-1">Bill to</p>
            <p className="font-medium text-neutral-900">{invoice.client?.name ?? '—'}</p>
          </div>
          <div className="px-6 pb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-neutral-500 border-b border-neutral-200">
                  <th className="pb-2 pr-4">Description</th>
                  <th className="pb-2 pr-4">Qty</th>
                  <th className="pb-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item) => (
                  <tr key={item.id} className="border-b border-neutral-100">
                    <td className="py-2 pr-4">{item.description}</td>
                    <td className="py-2 pr-4 font-mono">{item.quantity}</td>
                    <td className="py-2 text-right font-mono">{invoice.currency} {item.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 pt-4 border-t border-neutral-200 text-right">
              <p className="font-semibold text-neutral-900">Total: {invoice.currency} {invoice.total.toFixed(2)}</p>
            </div>
          </div>
          <div className="p-6 bg-neutral-50 border-t border-neutral-200">
            <button type="button" className="w-full py-3 rounded-button bg-success text-white font-medium hover:bg-success-dark">Pay Now</button>
          </div>
        </div>
      </div>
    </div>
  );
}
