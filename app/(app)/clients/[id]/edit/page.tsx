import { notFound } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { ClientForm } from '@/components/clients/ClientForm';

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return null;
  const { id } = await params;
  const client = await prisma.client.findFirst({ where: { id, userId: session.id } });
  if (!client) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/clients/${id}`} className="text-neutral-500 hover:text-neutral-900 text-sm">← Client</Link>
      </div>
      <h1 className="text-2xl font-bold text-neutral-900">Edit {client.name}</h1>
      <ClientForm client={client} />
    </div>
  );
}
