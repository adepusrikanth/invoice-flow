'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Users,
  CreditCard,
  BarChart3,
  Receipt,
  RefreshCw,
  MessageSquareMore,
  Settings,
  HelpCircle,
  FileStack,
} from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/invoices', label: 'Invoices', icon: FileText },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/payments', label: 'Payments', icon: CreditCard },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/expenses', label: 'Expenses', icon: Receipt },
  { href: '/recurring', label: 'Recurring', icon: RefreshCw },
  { href: '/settings/profile', label: 'Settings', icon: Settings },
  { href: '/settings/templates', label: 'Templates', icon: FileStack },
  { href: '/help', label: 'Help', icon: HelpCircle },
];

type SidebarProps = { open?: boolean; onClose?: () => void };

export function Sidebar({ open = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  return (
    <aside
      className={clsx(
        'w-sidebar min-h-screen bg-neutral-800 border-r border-neutral-700 flex flex-col fixed left-0 top-0 z-30 transition-transform duration-200 ease-out',
        'md:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <div className="p-4 border-b border-neutral-700">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-xl font-bold text-white">InvoiceFlow</span>
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-button text-sm font-medium transition',
                active
                  ? 'bg-brand-primary/15 text-brand-primary border-l-2 border-brand-primary'
                  : 'text-neutral-300 hover:bg-neutral-700 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5 shrink-0" strokeWidth={1.5} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-neutral-700">
        <Link
          href="/chat"
          className="flex items-center gap-3 px-3 py-2.5 rounded-button text-sm font-medium text-neutral-300 hover:bg-neutral-700 hover:text-brand-tertiary"
        >
          <MessageSquareMore className="w-5 h-5 shrink-0" strokeWidth={1.5} />
          AI Assistant
        </Link>
      </div>
    </aside>
  );
}
