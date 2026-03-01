'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Pencil, Plus, Trash2, Loader2 } from 'lucide-react';

type Template = {
  id: string;
  name: string;
  businessName: string;
  businessEmail: string | null;
  accentColor: string;
};

export function TemplatesList() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/templates')
      .then((res) => res.json())
      .then((data) => {
        setTemplates(Array.isArray(data.templates) ? data.templates : []);
      })
      .catch(() => setTemplates([]))
      .finally(() => setLoading(false));
  }, []);

  async function deleteTemplate(id: string) {
    if (!confirm('Delete this template?')) return;
    const res = await fetch(`/api/templates/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    }
  }

  return (
    <div className="space-y-4">
      <Link
        href="/settings/templates/new"
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-button bg-brand-primary text-white font-medium hover:bg-brand-primary/90"
      >
        <Plus className="w-4 h-4" /> Create template
      </Link>
      {loading ? (
        <div className="rounded-card bg-white border border-neutral-200 p-8 flex items-center justify-center gap-2 text-neutral-500">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading templates…
        </div>
      ) : (
      <div className="rounded-card bg-white border border-neutral-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-neutral-500 border-b border-neutral-200 bg-neutral-50">
              <th className="p-3 font-medium">Template name</th>
              <th className="p-3 font-medium">Business</th>
              <th className="p-3 font-medium">Theme</th>
              <th className="p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {templates.map((t) => (
              <tr key={t.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                <td className="p-3 font-medium text-neutral-900">{t.name}</td>
                <td className="p-3 text-neutral-600">{t.businessName}</td>
                <td className="p-3">
                  <span className="inline-block w-6 h-6 rounded border border-neutral-200" style={{ backgroundColor: t.accentColor }} title={t.accentColor} />
                </td>
                <td className="p-3 flex items-center gap-2">
                  <Link href={`/settings/templates/${t.id}/edit`} className="inline-flex items-center gap-1 text-brand-primary hover:underline">
                    <Pencil className="w-4 h-4" /> Edit
                  </Link>
                  <button type="button" onClick={() => deleteTemplate(t.id)} className="inline-flex items-center gap-1 text-error-dark hover:underline">
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {templates.length === 0 && (
          <div className="p-8 text-center text-neutral-500">
            <p className="mb-2">No templates yet.</p>
            <Link href="/settings/templates/new" className="text-brand-primary font-medium hover:underline">Create your first template</Link>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
