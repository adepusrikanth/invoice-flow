import Link from 'next/link';
import { TemplateForm } from '@/components/templates/TemplateForm';

export default function NewTemplatePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/settings/templates" className="text-neutral-500 hover:text-neutral-900 text-sm">← Templates</Link>
      </div>
      <h1 className="text-2xl font-bold text-neutral-900">Create template</h1>
      <TemplateForm />
    </div>
  );
}
