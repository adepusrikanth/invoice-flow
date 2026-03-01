import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { FileText, TrendingUp, AlertCircle, DollarSign, Users } from 'lucide-react';
import { convertToINR, formatINRShort } from '@/lib/currency';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const [allInvoices, recentInvoices, clientCount, clientSummaries] = await Promise.all([
    prisma.invoice.findMany({ where: { userId: session.id }, include: { client: true } }),
    prisma.invoice.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { client: true },
    }),
    prisma.client.count({ where: { userId: session.id } }),
    prisma.client.findMany({
      where: { userId: session.id },
      include: { invoices: true },
      take: 20,
    }),
  ]);
  const totalRevenue = allInvoices.filter((i) => i.status === 'paid').reduce((s, i) => s + convertToINR(i.total, i.currency), 0);
  const outstanding = allInvoices.filter((i) => i.status !== 'paid' && i.status !== 'cancelled').reduce((s, i) => s + convertToINR(i.amountDue, i.currency), 0);
  const overdue = allInvoices.filter((i) => i.status === 'overdue').reduce((s, i) => s + convertToINR(i.amountDue, i.currency), 0);
  const invoicesThisMonth = allInvoices.filter((i) => i.issueDate >= startOfMonth).length;
  const totalInvoices = allInvoices.length;
  const topClients = clientSummaries
    .map((c) => ({
      name: c.name,
      totalBilled: c.invoices.reduce((s, inv) => s + convertToINR(inv.total, inv.currency), 0),
      invoiceCount: c.invoices.length,
    }))
    .filter((c) => c.totalBilled > 0)
    .sort((a, b) => b.totalBilled - a.totalBilled)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Good morning, {session.name || 'there'}!</h1>
        <p className="text-neutral-500 mt-1">Here’s your billing overview in INR.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue (paid)" value={formatINRShort(totalRevenue)} icon={DollarSign} variant="success" />
        <StatCard title="Outstanding" value={formatINRShort(outstanding)} icon={TrendingUp} variant="warning" />
        <StatCard title="Overdue" value={formatINRShort(overdue)} icon={AlertCircle} variant="error" />
        <StatCard title="Total Invoices" value={String(totalInvoices)} icon={FileText} variant="info" />
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-card bg-white border border-neutral-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-neutral-200">
            <h2 className="font-semibold text-neutral-900">Recent Invoices</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-neutral-500 border-b border-neutral-200 bg-neutral-50">
                  <th className="p-3 font-medium">Invoice #</th>
                  <th className="p-3 font-medium">Client</th>
                  <th className="p-3 font-medium text-right">Amount</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium">Due</th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.slice(0, 5).map((inv) => (
                  <tr key={inv.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="p-3 font-mono text-neutral-900">{inv.invoiceNumber}</td>
                    <td className="p-3 text-neutral-600">{inv.client?.name ?? '—'}</td>
                    <td className="p-3 text-right font-mono text-neutral-900">₹{convertToINR(inv.total, inv.currency).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="p-3"><StatusBadge status={inv.status} /></td>
                    <td className="p-3 text-neutral-500">{inv.dueDate}</td>
                    <td className="p-3">
                      <Link href={`/invoices/${inv.id}`} className="text-brand-primary hover:underline">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {recentInvoices.length === 0 && (
            <div className="p-8 text-center text-neutral-500">No invoices yet. Create your first invoice.</div>
          )}
        </div>
        <div className="space-y-4">
          <div className="rounded-card bg-white border border-neutral-200 p-4 shadow-sm">
            <h2 className="font-semibold text-neutral-900 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-brand-tertiary/30 flex items-center justify-center text-brand-primary">✨</span>
              AI Insights
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-neutral-600">
              <li>• {overdue > 0 ? `${allInvoices.filter((i) => i.status === 'overdue').length} overdue invoice(s) — follow up.` : 'No overdue invoices.'}</li>
              <li>• You have {clientCount} client(s).</li>
              <li>• Total outstanding: {formatINRShort(outstanding)}</li>
            </ul>
          </div>
          {topClients.length > 0 && (
            <div className="rounded-card bg-white border border-neutral-200 p-4 shadow-sm">
              <h2 className="font-semibold text-neutral-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-brand-primary" />
                Client summary (top by revenue)
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-neutral-600">
                {topClients.map((c) => (
                  <li key={c.name} className="flex justify-between">
                    <span>{c.name}</span>
                    <span className="font-mono">{formatINRShort(c.totalBilled)} ({c.invoiceCount} inv.)</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-3">
        <Link href="/invoices/new" className="px-4 py-2.5 rounded-button bg-brand-primary text-white font-medium hover:bg-brand-primary/90">+ New Invoice</Link>
        <Link href="/clients/new" className="px-4 py-2.5 rounded-button bg-neutral-100 text-brand-primary font-medium hover:bg-neutral-200">+ New Client</Link>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, variant }: { title: string; value: string; icon: React.ElementType; variant: 'success' | 'warning' | 'error' | 'info' }) {
  const colors = { success: 'text-success bg-success-bg', warning: 'text-warning-dark bg-warning-bg', error: 'text-error-dark bg-error-bg', info: 'text-info-dark bg-info-bg' };
  return (
    <div className="rounded-card bg-white border border-neutral-200 p-4 shadow-sm">
      <div className={`w-10 h-10 rounded-button ${colors[variant]} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-neutral-900 font-mono">{value}</p>
      <p className="text-sm text-neutral-500 mt-1">{title}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    draft: 'bg-neutral-100 text-neutral-600',
    sent: 'bg-info-bg text-info-dark',
    viewed: 'bg-brand-tertiary/30 text-brand-primary',
    paid: 'bg-success-bg text-success-dark',
    overdue: 'bg-error-bg text-error-dark',
    cancelled: 'bg-neutral-100 text-neutral-500',
  };
  return <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${map[status] || map.draft}`}>{status.toUpperCase()}</span>;
}
