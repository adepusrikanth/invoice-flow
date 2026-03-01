import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { TemplatesList } from '@/components/templates/TemplatesList';

export const dynamic = 'force-dynamic';

export default async function TemplatesPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Invoice templates</h1>
          <p className="text-neutral-500 mt-1">Create and edit templates. Choose which template to use when creating an invoice.</p>
        </div>
      </div>
      <TemplatesList />
    </div>
  );
}
