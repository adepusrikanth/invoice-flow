import { notFound } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { TemplateForm } from '@/components/templates/TemplateForm';

export default async function EditTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return null;
  const { id } = await params;
  const template = await prisma.invoiceTemplate.findFirst({
    where: { id, userId: session.id },
  });
  if (!template) notFound();
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/settings/templates" className="text-neutral-500 hover:text-neutral-900 text-sm">← Templates</Link>
      </div>
      <h1 className="text-2xl font-bold text-neutral-900">Edit template: {template.name}</h1>
      <TemplateForm template={template} />
    </div>
  );
}
