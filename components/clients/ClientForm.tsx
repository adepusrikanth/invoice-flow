'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Client = { id: string; name: string; email: string; phone?: string | null; company?: string | null; address?: string | null; notes?: string | null };

export function ClientForm({ client }: { client?: Client }) {
  const router = useRouter();
  const [name, setName] = useState(client?.name ?? '');
  const [email, setEmail] = useState(client?.email ?? '');
  const [phone, setPhone] = useState(client?.phone ?? '');
  const [company, setCompany] = useState(client?.company ?? '');
  const [address, setAddress] = useState(client?.address ?? '');
  const [notes, setNotes] = useState(client?.notes ?? '');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = client ? `/api/clients/${client.id}` : '/api/clients';
      const method = client ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, company, address, notes }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Failed to save');
        return;
      }
      const data = await res.json();
      router.push(data.client?.id ? `/clients/${data.client.id}` : '/clients');
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-card bg-white border border-neutral-200 shadow-sm p-6 max-w-xl space-y-4">
      <div>
        <label className="block text-sm font-medium text-neutral-600 mb-1">Name *</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3 py-2 rounded-input border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20" />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-600 mb-1">Email *</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 rounded-input border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20" />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-600 mb-1">Phone</label>
        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 rounded-input border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20" />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-600 mb-1">Company</label>
        <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} className="w-full px-3 py-2 rounded-input border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20" />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-600 mb-1">Address</label>
        <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} className="w-full px-3 py-2 rounded-input border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20" />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-600 mb-1">Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full px-3 py-2 rounded-input border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-primary/20" />
      </div>
      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="px-4 py-2.5 rounded-button bg-brand-primary text-white font-medium hover:bg-brand-primary/90 disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
        <button type="button" onClick={() => router.back()} className="px-4 py-2.5 rounded-button bg-neutral-100 text-neutral-700 hover:bg-neutral-200">Cancel</button>
      </div>
    </form>
  );
}
