import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { isAdmin } from '@/lib/admin';
import { prisma } from '@/lib/db';
import { AdminSettingsForm } from '@/components/admin/AdminSettingsForm';

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  if (!isAdmin(session)) redirect('/dashboard');

  let users: Array<{
    id: string;
    email: string;
    name: string | null;
    role: string;
    isActive: boolean;
    createdAt: Date;
    lastLoginAt: Date | null;
    invoiceCount: number;
    clientCount: number;
  }> = [];
  try {
    const list = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
        _count: { select: { invoices: true, clients: true } },
      },
    });
    users = list.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      isActive: u.isActive,
      createdAt: u.createdAt,
      lastLoginAt: u.lastLoginAt,
      invoiceCount: u._count.invoices,
      clientCount: u._count.clients,
    }));
  } catch {
    // ignore
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Admin</h1>
        <p className="text-neutral-500 text-sm mt-1">Configure API keys and view signup details. This page is only visible to you.</p>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-neutral-900 mb-3">Overall signup details</h2>
        <p className="text-sm text-neutral-500 mb-4">All registered users (accounts).</p>
        <div className="rounded-card bg-white border border-neutral-200 overflow-hidden">
          {users.length === 0 ? (
            <div className="p-8 text-center text-neutral-500 text-sm">No users yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-neutral-500 border-b border-neutral-200 bg-neutral-50">
                    <th className="p-3 font-medium">Email</th>
                    <th className="p-3 font-medium">Name</th>
                    <th className="p-3 font-medium">Role</th>
                    <th className="p-3 font-medium text-center">Invoices</th>
                    <th className="p-3 font-medium text-center">Clients</th>
                    <th className="p-3 font-medium">Signed up</th>
                    <th className="p-3 font-medium">Last login</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="p-3 text-neutral-900">{u.email}</td>
                      <td className="p-3 text-neutral-600">{u.name ?? '—'}</td>
                      <td className="p-3 text-neutral-600">{u.role}</td>
                      <td className="p-3 text-center font-mono text-neutral-700">{u.invoiceCount}</td>
                      <td className="p-3 text-center font-mono text-neutral-700">{u.clientCount}</td>
                      <td className="p-3 text-neutral-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="p-3 text-neutral-500">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-neutral-900 mb-3">OpenAI API key</h2>
        <AdminSettingsForm />
      </section>
    </div>
  );
}
