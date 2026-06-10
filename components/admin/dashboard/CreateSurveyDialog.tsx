'use client';

import { useState } from 'react';
import { Form } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);
}

export function CreateSurveyDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (form: Form) => Promise<void> | void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slug = slugify(title) || `form-${Date.now()}`;

  function reset() {
    setTitle('');
    setDescription('');
    setError(null);
    setIsSubmitting(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: slug,
          title: title.trim(),
          description: description.trim(),
          questions: [
            {
              id: 'q1',
              title: 'What would you like us to know?',
              type: 'textarea',
              required: false,
              order: 1,
            },
          ],
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to create form');
      }
      const form = (await res.json()) as Form;
      reset();
      await onCreated(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create form');
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="rounded-3xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New survey</DialogTitle>
          <DialogDescription>Start with a title; you can edit questions next.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground" htmlFor="title">
              Title
            </label>
            <Input
              id="title"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Community Fundraising Survey"
              className="mt-1 rounded-xl"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">id: {slug}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground" htmlFor="desc">
              Description
            </label>
            <Textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What is this survey for?"
              className="mt-1 resize-none rounded-xl"
            />
          </div>
          {error && (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          )}
          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-full" title="Cancel">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="rounded-full" title={isSubmitting ? 'Creating…' : 'Create survey'}>
              {isSubmitting ? 'Creating…' : 'Create survey'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
