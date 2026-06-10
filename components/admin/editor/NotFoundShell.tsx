import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { NotFoundContent } from '@/components/404/NotFoundContent';

export function NotFoundShell() {
  return (
    <NotFoundContent
      title="Survey not found"
      description="The survey you're looking for doesn't exist."
      showNav={false}
      noTagline
    >
      <div className="flex items-center gap-3">
        <Link href="/admin" className="btn-primary">
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
      </div>
    </NotFoundContent>
  );
}
