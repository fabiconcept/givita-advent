'use client';

import Link from 'next/link';
import { FileText, ChevronRight, Star, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Form } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function SurveyCard({
  form,
  onDelete,
}: {
  form: Form;
  onDelete: (form: Form) => void;
}) {
  return (
    <Card
      className={cn(
        'group relative flex flex-col rounded-3xl border bg-card/50 p-0 transition-all duration-200 hover:border-primary/50 hover:bg-card/80 hover:shadow-[0_10px_30px_-15px_rgba(81,46,248,0.4)]',
        form.isFeatured
          ? 'border-amber-400/60 dark:border-amber-500/40 shadow-[0_0_20px_-8px_rgba(251,191,36,0.5)]'
          : 'border-border'
      )}
    >
      <CardContent className="flex flex-1 flex-col p-5">
        <Link href={`/admin/${form.id}`} className="flex flex-1 flex-col">
          <div className="flex items-center justify-between">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
              {form.isFeatured && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] text-amber-950 shadow-sm">
                  <Star className="h-3 w-3 fill-current" />
                </span>
              )}
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
          </div>
          <h3 className="mt-4 line-clamp-2 text-base font-semibold">{form.title}</h3>
          {form.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {form.description}
            </p>
          )}
          <div className="mt-auto flex flex-wrap items-center gap-3 pt-5 text-xs text-muted-foreground">
            <span className="rounded-full border border-border bg-background/60 px-2 py-0.5">
              {form.questions.length} questions
            </span>
            <span>·</span>
            <span>{new Date(form.createdAt).toLocaleDateString()}</span>
            {form.isFeatured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                <Star className="h-2.5 w-2.5 fill-current" /> Featured
              </span>
            )}
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider',
                form.isPublished
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {form.isPublished ? 'Live' : 'Draft'}
            </span>
          </div>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(form)}
          className="absolute right-3 top-3 h-7 rounded-full border border-border bg-background/70 px-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground opacity-0 backdrop-blur hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
          aria-label={`Delete ${form.title}`}
          title={`Delete ${form.title}`}
        >
          <Trash2 className="mr-1 h-3 w-3" /> Delete
        </Button>
      </CardContent>
    </Card>
  );
}
