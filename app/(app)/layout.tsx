import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { AppLayoutClient } from '@/components/layout/AppLayoutClient';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');
  return <AppLayoutClient user={session}>{children}</AppLayoutClient>;
}
