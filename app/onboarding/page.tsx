import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import Link from 'next/link';

export default async function OnboardingPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-lg">
        <h1 className="text-2xl font-bold text-neutral-900 mb-6">Welcome! Set up your business</h1>
        <div className="rounded-card bg-white border border-neutral-200 p-6 shadow-sm space-y-4">
          <p className="text-neutral-600">Business name, logo, address, default currency and tax rate.</p>
          <input type="text" placeholder="Business name" className="w-full px-3 py-2 rounded-input border border-neutral-200" />
          <input type="text" placeholder="Default currency (e.g. USD)" className="w-full px-3 py-2 rounded-input border border-neutral-200" />
          <Link href="/dashboard" className="block w-full py-2.5 rounded-button bg-brand-primary text-white text-center font-medium hover:bg-brand-primary/90">Continue to dashboard</Link>
        </div>
      </div>
    </div>
  );
}
