import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { isAdmin } from '@/lib/admin';
import { AdminSettingsForm } from '@/components/admin/AdminSettingsForm';

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  if (!isAdmin(session)) redirect('/dashboard');
  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Admin</h1>
        <p className="text-neutral-500 text-sm mt-1">Configure API keys. This page is only visible to you.</p>
      </div>
      <AdminSettingsForm />
    </div>
  );
}
