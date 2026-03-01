'use client';

import { useState, useEffect } from 'react';
import { KeyRound, Loader2 } from 'lucide-react';

export function AdminSettingsForm() {
  const [openaiKey, setOpenaiKey] = useState('');
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((data) => setConfigured(!!data.openaiApiKeySet))
      .catch(() => setConfigured(false));
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!openaiKey.trim()) return;
    setSaving(true);
    setMessage(null);
    fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ openaiApiKey: openaiKey.trim() }),
    })
      .then(async (r) => {
        const data = await r.json();
        if (r.ok) {
          setMessage({ type: 'ok', text: 'OpenAI API key saved. Invoice extract and AI chat will use it.' });
          setOpenaiKey('');
          setConfigured(true);
        } else {
          setMessage({ type: 'err', text: data.error || 'Failed to save' });
        }
      })
      .catch(() => setMessage({ type: 'err', text: 'Request failed' }))
      .finally(() => setSaving(false));
  }

  return (
    <div className="rounded-card bg-white border border-neutral-200 shadow-sm p-6">
      <h2 className="font-semibold text-neutral-900 flex items-center gap-2 mb-4">
        <KeyRound className="w-5 h-5 text-brand-primary" />
        OpenAI API key
      </h2>
      {configured !== null && (
        <p className="text-sm text-neutral-500 mb-4">
          {configured ? 'A key is configured. Enter a new key below to replace it.' : 'No key set. Add your key to enable invoice extraction and AI chat.'}
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="openai-key" className="block text-sm font-medium text-neutral-700 mb-1">
            API key
          </label>
          <input
            id="openai-key"
            type="password"
            value={openaiKey}
            onChange={(e) => setOpenaiKey(e.target.value)}
            placeholder="sk-..."
            className="w-full px-3 py-2.5 rounded-input border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
            autoComplete="off"
          />
        </div>
        {message && (
          <p className={`text-sm ${message.type === 'ok' ? 'text-success-dark' : 'text-error'}`}>
            {message.text}
          </p>
        )}
        <button
          type="submit"
          disabled={saving || !openaiKey.trim()}
          className="px-4 py-2.5 rounded-button bg-brand-primary text-white font-medium hover:bg-brand-primary/90 disabled:opacity-50 inline-flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Save key
        </button>
      </form>
    </div>
  );
}
