import { verifyAdminSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AdminDecorations } from '@/components/admin/AdminDecorations';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isAuthenticated = await verifyAdminSession();

  if (!isAuthenticated) {
    redirect('/login');
  }

  return <AdminDecorations>{children}</AdminDecorations>;
}
