'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

type Props = {
  children: React.ReactNode;
  user: { id: string; email: string; name: string | null };
};

export function AppLayoutClient({ children, user }: Props) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isPrintPage = pathname?.includes('/print') ?? false;

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (isPrintPage) {
    return <>{children}</>;
  }
  return (
    <div className="min-h-screen bg-neutral-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className="md:pl-[260px] pl-0">
        <Header user={user} onMenuClick={() => setSidebarOpen((o) => !o)} />
        <main className="p-4 md:p-6 max-w-content mx-auto">{children}</main>
      </div>
    </div>
  );
}
