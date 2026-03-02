'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Template = {
  id: string;
  name: string;
  businessName: string;
  businessPhone: string | null;
  businessEmail: string | null;
  businessAddress: string | null;
  logoUrl: string | null;
  accentColor: string;
};

const PRESET_COLORS = ['#6367FF', '#DC2626', '#059669', '#D97706', '#2563EB', '#7C3AED', '#0D9488', '#4B5563'];

export function TemplateForm({ template }: { template?: Template }) {
  const router = useRouter();
  const [name, setName] = useState(template?.name ?? '');
  const [businessName, setBusinessName] = useState(template?.businessName ?? '');
  const [businessPhone, setBusinessPhone] = useState(template?.businessPhone ?? '');
  const [businessEmail, setBusinessEmail] = useState(template?.businessEmail ?? '');
  const [businessAddress, setBusinessAddress] = useState(template?.businessAddress ?? '');
  const [logoUrl, setLogoUrl] = useState(template?.logoUrl ?? '');
  const [accentColor, setAccentColor] = useState(template?.accentColor ?? '#6367FF');
  const [saving, setSaving] = useState(false);

  function handleLogoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (dataUrl.length > 500000) {
        alert('Image too large. Use a smaller image (under ~200KB).');
        return;
      }
      setLogoUrl(dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = template ? `/api/templates/${template.id}` : '/api/templates';
      const method = template ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          businessName,
          businessPhone: businessPhone || null,
          businessEmail: businessEmail || null,
          businessAddress: businessAddress || null,
          logoUrl: logoUrl || null,
          accentColor,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Failed to save');
        return;
      }
      router.push('/settings/templates');
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-card bg-white border border-neutral-200 shadow-sm p-6 max-w-xl space-y-6">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">Template name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g. Default, Tax Invoice"
          className="w-full px-3 py-2.5 rounded-input border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
        />
      </div>
      <div className="border-t border-neutral-200 pt-6">
        <h3 className="font-medium text-neutral-900 mb-3">Business details (printed on invoice header)</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Company logo</label>
            <p className="text-xs text-neutral-500 mb-2">Shown on the top-right of your invoice. Use a square or horizontal image (under ~200KB).</p>
            <div className="flex items-start gap-4">
              {logoUrl ? (
                <div className="flex items-center gap-3">
                  <img src={logoUrl} alt="Logo preview" className="h-16 w-auto max-w-[120px] object-contain border border-neutral-200 rounded" />
                  <button type="button" onClick={() => setLogoUrl('')} className="text-sm text-neutral-500 hover:text-error-dark">Remove logo</button>
                </div>
              ) : null}
              <label className="cursor-pointer">
                <span className="inline-block px-3 py-2 rounded-button bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-medium">{logoUrl ? 'Change logo' : 'Upload logo'}</span>
                <input type="file" accept="image/*" onChange={handleLogoFile} className="sr-only" />
              </label>
            </div>
            <div className="mt-2">
              <input type="url" value={typeof logoUrl === 'string' && logoUrl.startsWith('http') ? logoUrl : ''} onChange={(e) => setLogoUrl(e.target.value)} placeholder="Or paste logo image URL" className="w-full px-3 py-2 rounded-input border border-neutral-300 text-sm text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/30" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Business name *</label>
            <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} required className="w-full px-3 py-2.5 rounded-input border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/30" placeholder="Your business name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Phone number</label>
            <input type="tel" value={businessPhone} onChange={(e) => setBusinessPhone(e.target.value)} className="w-full px-3 py-2.5 rounded-input border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/30" placeholder="Phone no." />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Email ID</label>
            <input type="email" value={businessEmail} onChange={(e) => setBusinessEmail(e.target.value)} className="w-full px-3 py-2.5 rounded-input border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/30" placeholder="email@business.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Address</label>
            <textarea value={businessAddress} onChange={(e) => setBusinessAddress(e.target.value)} rows={2} className="w-full px-3 py-2.5 rounded-input border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/30" placeholder="Full address" />
          </div>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">Invoice theme color</label>
        <div className="flex flex-wrap gap-2 items-center">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setAccentColor(c)}
              className={`w-8 h-8 rounded-full border-2 transition ${accentColor === c ? 'border-neutral-900 scale-110' : 'border-neutral-200 hover:border-neutral-400'}`}
              style={{ backgroundColor: c }}
              title={c}
            />
          ))}
          <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0" />
          <span className="text-sm text-neutral-500 font-mono ml-1">{accentColor}</span>
        </div>
      </div>
      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="px-4 py-2.5 rounded-button bg-brand-primary text-white font-medium hover:bg-brand-primary/90 disabled:opacity-50">{saving ? 'Saving…' : 'Save template'}</button>
        <button type="button" onClick={() => router.back()} className="px-4 py-2.5 rounded-button bg-neutral-100 text-neutral-700 hover:bg-neutral-200">Cancel</button>
      </div>
    </form>
  );
}
