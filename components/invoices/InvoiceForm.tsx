'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { InvoiceTemplatePreview } from './InvoiceTemplatePreview';
import { usePreviewPdf } from './usePreviewPdf';
import { Download, Printer, Loader2 } from 'lucide-react';

type Client = { id: string; name: string; email: string };
type Item = { description: string; quantity: number; unitPrice: number; amount: number };
type Template = {
  id: string;
  name: string;
  businessName: string;
  businessPhone: string | null;
  businessEmail: string | null;
  businessAddress: string | null;
  logoUrl?: string | null;
  accentColor: string;
};
type InvoiceWithRelations = {
  id: string;
  invoiceNumber: string;
  clientId: string | null;
  templateId: string | null;
  issueDate: string;
  dueDate: string;
  currency: string;
  taxRate?: number | null;
  discountType?: string | null;
  discountValue?: number | null;
  notes: string | null;
  terms: string | null;
  client: { id: string; name: string; email: string } | null;
  template?: Template | null;
  items: { id?: string; description: string; quantity: number; unitPrice: number; amount: number }[];
};

const CURRENCIES = [
  { code: 'USD', label: 'US Dollar (USD)', symbol: '$' },
  { code: 'EUR', label: 'Euro (EUR)', symbol: '€' },
  { code: 'GBP', label: 'British Pound (GBP)', symbol: '£' },
  { code: 'INR', label: 'Indian Rupee (INR)', symbol: '₹' },
  { code: 'JPY', label: 'Japanese Yen (JPY)', symbol: '¥' },
  { code: 'CAD', label: 'Canadian Dollar (CAD)', symbol: 'C$' },
  { code: 'AUD', label: 'Australian Dollar (AUD)', symbol: 'A$' },
  { code: 'CHF', label: 'Swiss Franc (CHF)', symbol: 'CHF' },
  { code: 'SGD', label: 'Singapore Dollar (SGD)', symbol: 'S$' },
];

export function InvoiceForm({ invoice }: { invoice?: InvoiceWithRelations }) {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [clientId, setClientId] = useState(invoice?.clientId ?? '');
  const [templateId, setTemplateId] = useState(invoice?.templateId ?? '');
  const [issueDate, setIssueDate] = useState(invoice?.issueDate ?? new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(invoice?.dueDate ?? '');
  const [currency, setCurrency] = useState(invoice?.currency ?? 'USD');
  const [taxRate, setTaxRate] = useState(invoice?.taxRate ?? 18);
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>(invoice?.discountType === 'fixed' ? 'fixed' : 'percent');
  const [discountValue, setDiscountValue] = useState(invoice?.discountValue ?? 0);
  const [notes, setNotes] = useState(invoice?.notes ?? '');
  const [terms, setTerms] = useState(invoice?.terms ?? '');
  const [items, setItems] = useState<Item[]>(
    invoice?.items?.length ? invoice.items.map((i) => ({ description: i.description, quantity: i.quantity, unitPrice: i.unitPrice, amount: i.amount })) : [{ description: '', quantity: 1, unitPrice: 0, amount: 0 }]
  );
  const [saving, setSaving] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const previewRef = useRef<HTMLDivElement>(null);
  const { downloadPdf, printPreview, downloading, printing } = usePreviewPdf();

  useEffect(() => {
    fetch('/api/templates')
      .then((r) => r.json())
      .then((data) => data.templates && setTemplates(data.templates))
      .catch(() => {});
  }, []);
  useEffect(() => {
    fetch('/api/clients')
      .then((r) => r.json())
      .then((data) => data.clients && setClients(data.clients))
      .catch(() => {});
  }, []);

  const selectedTemplate = templateId ? templates.find((t) => t.id === templateId) ?? (invoice?.template ?? null) : null;

  function addItem() {
    setItems((prev) => [...prev, { description: '', quantity: 1, unitPrice: 0, amount: 0 }]);
  }
  function updateItem(i: number, field: keyof Item, value: string | number) {
    setItems((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      if (field === 'quantity' || field === 'unitPrice') next[i].amount = next[i].quantity * next[i].unitPrice;
      return next;
    });
  }
  const subtotal = items.reduce((s, i) => s + i.amount, 0);
  let afterDiscount = subtotal;
  if (discountType === 'percent' && discountValue > 0) afterDiscount = subtotal * (1 - discountValue / 100);
  else if (discountType === 'fixed' && discountValue > 0) afterDiscount = Math.max(0, subtotal - discountValue);
  const discountAmount = subtotal - afterDiscount;
  const taxAmount = afterDiscount * (taxRate / 100);
  const total = afterDiscount + taxAmount;
  const selectedClient = invoice?.client ?? (clientId ? clients.find((c) => c.id === clientId) : null);
  const clientName = selectedClient?.name ?? '—';
  const clientEmail = selectedClient?.email ?? '';
  const invoiceNumber = invoice?.invoiceNumber ?? 'INV-0001';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const filteredItems = items.filter((i) => i.description.trim() || i.amount > 0);
      const rawItems = filteredItems.length >= 1 ? filteredItems : [{ description: 'Item', quantity: 1, unitPrice: 0, amount: 0 }];
      const itemsToSend = rawItems.map((i) => ({
        description: String(i.description),
        quantity: Number(i.quantity) || 0,
        unitPrice: Number(i.unitPrice) || 0,
        amount: Number(i.amount) || 0,
      }));
      const payload = {
        clientId: clientId || null,
        templateId: templateId || null,
        issueDate,
        dueDate,
        currency,
        taxRate: taxRate || 0,
        discountType: discountType || null,
        discountValue: discountValue || 0,
        notes: notes || null,
        terms: terms || null,
        items: itemsToSend,
      };
      const url = invoice ? `/api/invoices/${invoice.id}` : '/api/invoices';
      const method = invoice ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Failed to save');
        return;
      }
      const data = await res.json();
      router.push(data.invoice?.id ? `/invoices/${data.invoice.id}` : '/invoices');
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-[1fr,400px] xl:grid-cols-[1fr,420px] gap-8 items-start">
      <form onSubmit={handleSubmit} className="rounded-card bg-white border border-neutral-200 shadow-sm p-6 space-y-6">
        <div className="space-y-4">
          <div className="flex flex-wrap items-end gap-2">
            <div className="min-w-[200px]">
              <label className="block text-sm font-medium text-neutral-700 mb-1">Template</label>
              <select
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-input border border-neutral-300 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
              >
                <option value="">Default</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <Link href="/settings/templates" className="text-sm text-brand-primary hover:underline">Edit templates</Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Client</label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-input border border-neutral-300 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
              >
                <option value="">— Select client —</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {clients.length === 0 && <p className="text-xs text-neutral-500 mt-1">Create a client first in Clients.</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2.5 rounded-input border border-neutral-300 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Issue date</label>
              <input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} required className="w-full px-3 py-2.5 rounded-input border border-neutral-300 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Due date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required className="w-full px-3 py-2.5 rounded-input border border-neutral-300 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/30" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">GST / Tax (%)</label>
              <input type="number" min={0} max={100} step={0.5} value={taxRate} onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2.5 rounded-input border border-neutral-300 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Discount type</label>
              <select value={discountType} onChange={(e) => setDiscountType(e.target.value as 'percent' | 'fixed')} className="w-full px-3 py-2.5 rounded-input border border-neutral-300 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/30">
                <option value="percent">Percent (%)</option>
                <option value="fixed">Fixed amount</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Discount value</label>
              <input type="number" min={0} step={discountType === 'percent' ? 1 : 0.01} value={discountValue} onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2.5 rounded-input border border-neutral-300 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/30" placeholder={discountType === 'percent' ? 'e.g. 10' : 'e.g. 100'} />
            </div>
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-neutral-700">Line items</label>
            <button type="button" onClick={addItem} className="text-sm text-brand-primary font-medium hover:underline">+ Add item</button>
          </div>
          <div className="border border-neutral-200 rounded-input overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 text-left text-neutral-600">
                  <th className="p-2">Description</th>
                  <th className="p-2 w-20">Qty</th>
                  <th className="p-2 w-24">Rate</th>
                  <th className="p-2 w-24">Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i} className="border-t border-neutral-100">
                    <td className="p-2"><input type="text" value={item.description} onChange={(e) => updateItem(i, 'description', e.target.value)} placeholder="Item" className="w-full px-2 py-1 border-0 focus:ring-0 bg-transparent text-neutral-900 placeholder:text-neutral-400" /></td>
                    <td className="p-2"><input type="number" min={0} step={1} value={item.quantity} onChange={(e) => updateItem(i, 'quantity', parseFloat(e.target.value) || 0)} className="w-full px-2 py-1 font-mono border-0 focus:ring-0 bg-transparent text-neutral-900" /></td>
                    <td className="p-2"><input type="number" min={0} step={0.01} value={item.unitPrice || ''} onChange={(e) => updateItem(i, 'unitPrice', parseFloat(e.target.value) || 0)} className="w-full px-2 py-1 font-mono border-0 focus:ring-0 bg-transparent text-neutral-900" /></td>
                    <td className="p-2 font-mono text-neutral-900">{item.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex flex-wrap justify-end gap-x-6 gap-y-2 text-sm text-neutral-600">
          <span>Subtotal: <span className="font-mono text-neutral-900">{CURRENCIES.find((c) => c.code === currency)?.symbol ?? currency} {subtotal.toFixed(2)}</span></span>
          {discountAmount > 0 && <span>Discount: <span className="font-mono text-neutral-900">−{CURRENCIES.find((c) => c.code === currency)?.symbol ?? currency} {discountAmount.toFixed(2)}</span></span>}
          <span>GST ({taxRate}%): <span className="font-mono text-neutral-900">{CURRENCIES.find((c) => c.code === currency)?.symbol ?? currency} {taxAmount.toFixed(2)}</span></span>
          <span className="font-semibold text-neutral-900">Total: <span className="font-mono text-brand-primary">{CURRENCIES.find((c) => c.code === currency)?.symbol ?? currency} {total.toFixed(2)}</span></span>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full px-3 py-2 rounded-input border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/30" placeholder="Optional notes" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Terms</label>
            <textarea value={terms} onChange={(e) => setTerms(e.target.value)} rows={2} className="w-full px-3 py-2 rounded-input border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/30" placeholder="Payment terms" />
          </div>
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="px-4 py-2.5 rounded-button bg-brand-primary text-white font-medium hover:bg-brand-primary/90 disabled:opacity-50">{saving ? 'Saving…' : 'Save draft'}</button>
          <button type="button" onClick={() => router.back()} className="px-4 py-2.5 rounded-button bg-neutral-100 text-neutral-700 hover:bg-neutral-200">Cancel</button>
        </div>
      </form>
      {/* Live invoice template preview */}
      <div className="lg:sticky lg:top-24">
        <div className="flex items-center justify-between gap-2 mb-3">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Live preview</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => downloadPdf(previewRef.current, `invoice-${invoiceNumber}`)}
              disabled={downloading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-button bg-brand-primary text-white hover:bg-brand-primary/90 text-sm font-medium disabled:opacity-60"
              aria-label="Download preview as PDF"
            >
              {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {downloading ? 'Generating…' : 'Download PDF'}
            </button>
            <button
              type="button"
              onClick={() => printPreview(async () => {
                const payload = {
                  invoiceNumber,
                  clientName,
                  clientEmail,
                  issueDate,
                  dueDate,
                  currency,
                  items,
                  subtotal,
                  taxAmount,
                  total,
                  notes: notes || undefined,
                  terms: terms || undefined,
                  template: selectedTemplate ? { businessName: selectedTemplate.businessName, businessPhone: selectedTemplate.businessPhone, businessEmail: selectedTemplate.businessEmail, businessAddress: selectedTemplate.businessAddress, logoUrl: selectedTemplate.logoUrl ?? null, accentColor: selectedTemplate.accentColor } : null,
                };
                const res = await fetch('/api/invoices/preview-print', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                if (!res.ok) throw new Error('Failed to load preview');
                return res.text();
              })}
              disabled={printing}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-button bg-neutral-100 text-neutral-700 hover:bg-neutral-200 text-sm font-medium disabled:opacity-60"
              aria-label="Print preview"
            >
              {printing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
              Print
            </button>
          </div>
        </div>
        <div className="overflow-auto max-h-[calc(100vh-8rem)] rounded-card border border-neutral-200 bg-neutral-50/50 p-4">
          <div
            ref={previewRef}
            className="bg-white rounded-card border border-neutral-200 shadow-sm inline-block min-w-0"
          >
            <InvoiceTemplatePreview
            invoiceNumber={invoiceNumber}
            clientName={clientName}
            clientEmail={clientEmail}
            issueDate={issueDate}
            dueDate={dueDate}
            currency={currency}
            items={items}
            subtotal={subtotal}
            discountAmount={discountAmount}
            taxRate={taxRate}
            taxAmount={taxAmount}
            total={total}
            notes={notes}
            terms={terms}
            template={selectedTemplate ? { businessName: selectedTemplate.businessName, businessPhone: selectedTemplate.businessPhone, businessEmail: selectedTemplate.businessEmail, businessAddress: selectedTemplate.businessAddress, logoUrl: selectedTemplate.logoUrl ?? null, accentColor: selectedTemplate.accentColor } : null}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
