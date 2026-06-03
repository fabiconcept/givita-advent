import { verifyAdminSession } from '@/lib/adminAuth';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isAuthenticated = await verifyAdminSession();

  if (!isAuthenticated) {
    redirect('/login');
  }

  return children;
}
