'use client';

import Link from 'next/link';
import { BarChart3, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function EmptyAnalytics({ formId }: { formId: string }) {
  return (
    <div className="mt-6 flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/30 px-6 py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <BarChart3 className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-lg font-semibold">No responses yet</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Share the form to start collecting responses. Analytics will appear here as they come in.
      </p>
      <Button asChild size="sm" className="mt-5 rounded-full">
        <Link href={`/forms/${formId}`} target="_blank" rel="noopener noreferrer" title="Open form">
          Open form <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
        </Link>
      </Button>
    </div>
  );
}
