import { Skeleton } from '@/components/ui/skeleton';

export function LoadingShell() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <Skeleton className="h-6 w-32 rounded-full" />
        <Skeleton className="mt-4 h-10 w-72" />
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-24 rounded-3xl" />
          <Skeleton className="h-24 rounded-3xl" />
          <Skeleton className="h-24 rounded-3xl" />
        </div>
        <div className="mt-8 space-y-4">
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-32 rounded-3xl" />
        </div>
      </div>
    </div>
  );
}
