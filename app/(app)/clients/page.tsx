import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default async function ClientsPage() {
  const session = await getSession();
  if (!session) return null;
  const clients = await prisma.client.findMany({
    where: { userId: session.id },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-neutral-900">Clients</h1>
        <Link href="/clients/new" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-button bg-brand-primary text-white font-medium hover:bg-brand-primary/90">
          <Plus className="w-4 h-4" /> Add Client
        </Link>
      </div>
      <div className="rounded-card bg-white border border-neutral-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-neutral-500 border-b border-neutral-200 bg-neutral-50">
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">Email</th>
              <th className="p-3 font-medium">Phone</th>
              <th className="p-3 font-medium text-right">Total Billed</th>
              <th className="p-3 font-medium text-right">Total Paid</th>
              <th className="p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                <td className="p-3 font-medium text-neutral-900">{c.name}</td>
                <td className="p-3 text-neutral-600">{c.email}</td>
                <td className="p-3 text-neutral-600">{c.phone ?? '—'}</td>
                <td className="p-3 text-right font-mono text-neutral-900">{c.currency || 'USD'} {c.totalBilled.toFixed(2)}</td>
                <td className="p-3 text-right font-mono text-success-dark">{c.totalPaid.toFixed(2)}</td>
                <td className="p-3">
                  <Link href={`/clients/${c.id}`} className="text-brand-primary hover:underline">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {clients.length === 0 && (
          <div className="p-12 text-center text-neutral-500">
            <p className="mb-4">No clients yet.</p>
            <Link href="/clients/new" className="text-brand-primary font-medium hover:underline">Add your first client</Link>
          </div>
        )}
      </div>
    </div>
  );
}
