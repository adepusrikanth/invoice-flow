'use client';

import { useRouter } from 'next/navigation';

type User = { email: string; name: string | null };

export function DashboardNav({ user }: { user: User }) {
  const router = useRouter();
  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }
  return (
    <div className="flex items-center gap-4">
      <span className="text-slate-400 text-sm">{user.name || user.email}</span>
      <button
        onClick={logout}
        className="text-sm text-slate-400 hover:text-white transition"
      >
        Sign out
      </button>
    </div>
  );
}
