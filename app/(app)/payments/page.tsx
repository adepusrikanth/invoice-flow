import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export default async function PaymentsPage() {
  const session = await getSession();
  if (!session) return null;
  const payments = await prisma.payment.findMany({
    where: { invoice: { userId: session.id } },
    orderBy: { createdAt: 'desc' },
    include: { invoice: { include: { client: true } } },
  });
  const totalReceived = payments.filter((p) => p.status === 'completed').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900">Payments</h1>
      <div className="rounded-card bg-white border border-neutral-200 p-4 shadow-sm">
        <p className="text-sm text-neutral-500">Total received</p>
        <p className="text-2xl font-bold text-success-dark font-mono">${totalReceived.toFixed(2)}</p>
      </div>
      <div className="rounded-card bg-white border border-neutral-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-neutral-500 border-b border-neutral-200 bg-neutral-50">
              <th className="p-3 font-medium">Date</th>
              <th className="p-3 font-medium">Invoice</th>
              <th className="p-3 font-medium">Client</th>
              <th className="p-3 font-medium text-right">Amount</th>
              <th className="p-3 font-medium">Method</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b border-neutral-100">
                <td className="p-3 text-neutral-600">{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : new Date(p.createdAt).toLocaleDateString()}</td>
                <td className="p-3 font-mono">{p.invoice.invoiceNumber}</td>
                <td className="p-3 text-neutral-600">{p.invoice.client?.name ?? '—'}</td>
                <td className="p-3 text-right font-mono text-neutral-900">{p.currency} {p.amount.toFixed(2)}</td>
                <td className="p-3 text-neutral-600">{p.method}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {payments.length === 0 && <div className="p-8 text-center text-neutral-500">No payments yet.</div>}
      </div>
    </div>
  );
}
