'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Login failed'); return; }
      router.push('/dashboard');
      router.refresh();
    } catch { setError('Network error'); } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="text-lg font-bold text-brand-primary">InvoiceFlow</Link>
        <h1 className="text-2xl font-bold text-neutral-900 mt-8 mb-6">Sign in</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2.5 rounded-input border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-3 py-2.5 rounded-input border border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary" placeholder="Enter password" />
          </div>
          {error && <p className="text-sm text-error-dark">{error}</p>}
          <button type="submit" disabled={loading} className="w-full py-2.5 rounded-button bg-brand-primary text-white font-medium hover:bg-brand-primary/90 disabled:opacity-50">{loading ? 'Signing in…' : 'Sign in'}</button>
        </form>
        <p className="mt-6 text-center text-neutral-500 text-sm">
          No account? <Link href="/register" className="text-brand-primary hover:underline">Sign up</Link> · <Link href="/forgot-password" className="text-brand-primary hover:underline">Forgot password</Link>
        </p>
      </div>
    </div>
  );
}
