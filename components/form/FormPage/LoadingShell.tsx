import { FormShell } from '@/components/form/FormShell';
import { Skeleton } from '@/components/ui/skeleton';

export function LoadingShell() {
  return (
    <FormShell>
      <div className="mx-auto w-full max-w-3xl px-5 pt-24">
        <Skeleton className="h-2 w-full rounded-full" />
        <div className="mt-16 space-y-4">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="mt-12 space-y-3">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
      </div>
    </FormShell>
  );
}
