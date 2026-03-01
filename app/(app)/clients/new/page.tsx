import Link from 'next/link';
import { ClientForm } from '@/components/clients/ClientForm';

export default function NewClientPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/clients" className="text-neutral-500 hover:text-neutral-900 text-sm">← Clients</Link>
      </div>
      <h1 className="text-2xl font-bold text-neutral-900">Add Client</h1>
      <ClientForm />
    </div>
  );
}
