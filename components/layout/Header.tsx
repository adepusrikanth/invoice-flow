'use client';

import { Search, Bell, MessageSquareMore, Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';

type HeaderProps = {
  user: { name: string | null; email: string };
  onMenuClick?: () => void;
};

export function Header({ user, onMenuClick }: HeaderProps) {
  const router = useRouter();
  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }
  return (
    <header className="h-14 md:h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-20">
      <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0 max-w-xl">
        <button
          type="button"
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 rounded-button text-neutral-600 hover:bg-neutral-100"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 shrink-0" />
          <input
            type="search"
            placeholder="Search invoices, clients..."
            className="w-full pl-9 md:pl-10 pr-3 md:pr-4 py-2 rounded-input border border-neutral-200 text-neutral-600 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-sm"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="p-2 rounded-button text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
        </button>
        <button
          type="button"
          className="p-2 rounded-button text-neutral-500 hover:bg-brand-tertiary/20 hover:text-brand-primary"
          aria-label="AI Chat"
        >
          <MessageSquareMore className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 pl-2 border-l border-neutral-200">
          <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary font-medium text-sm">
            {(user.name || user.email).charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block text-left min-w-0">
            <p className="text-sm font-medium text-neutral-900">{user.name || 'User'}</p>
            <p className="text-xs text-neutral-500">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="text-sm text-neutral-500 hover:text-neutral-900 px-2 py-1 rounded hover:bg-neutral-100"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
