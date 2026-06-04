'use client';

import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Upload, FileJson, FileSpreadsheet, X } from 'lucide-react';
import { parseJSONImport, parseCSVImport, expandRepeatRows, importRowsToQuestions, type ImportRow } from '@/types/dto';
import type { FormQuestion } from '@/types';

type Tab = 'json' | 'csv';

export function ImportQuestionsDialog({
  onImport,
}: {
  onImport: (questions: FormQuestion[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('json');
  const [text, setText] = useState('');
  const [preview, setPreview] = useState<ImportRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleParse() {
    setError(null);
    setPreview(null);
    if (!text.trim()) { setError('Paste JSON or CSV content first'); return; }
    const result = tab === 'json' ? parseJSONImport(text) : parseCSVImport(text);
    if (!result.valid) {
      setError(result.line ? `Line ${result.line}: ${result.error}` : result.error);
      return;
    }
    const expanded = expandRepeatRows(result.questions);
    setPreview(expanded);
  }

  function handleConfirm() {
    if (!preview) return;
    onImport(importRowsToQuestions(preview));
    setOpen(false);
    reset();
  }

  function reset() {
    setText('');
    setPreview(null);
    setError(null);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-12 rounded-3xl border-dashed text-sm font-medium"
        >
          <Upload className="mr-2 h-4 w-4" /> Import JSON / CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] w-[95vw] max-w-2xl overflow-y-auto sm:w-full">
        <DialogHeader>
          <DialogTitle>Import questions</DialogTitle>
        </DialogHeader>

        <div className="flex gap-1 rounded-full border border-border bg-muted/30 p-1 text-sm">
          <TabButton active={tab === 'json'} onClick={() => setTab('json')}>
            <FileJson className="mr-1.5 h-3.5 w-3.5" /> JSON
          </TabButton>
          <TabButton active={tab === 'csv'} onClick={() => setTab('csv')}>
            <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5" /> CSV
          </TabButton>
        </div>

        <div className="space-y-1">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              tab === 'json'
                ? '[\n  { "title": "Your name", "type": "text", "required": true },\n  { "title": "Rating", "type": "rating", "maxScore": 5 }\n]'
                : 'title, type, required, options\n"Your name", text, true\n"Rating", rating, false, , , 5'
            }
            rows={8}
            className="rounded-xl font-mono text-xs"
          />
          {tab === 'csv' && (
            <p className="text-[11px] text-muted-foreground">
              Pipe-separated options: <code className="rounded bg-muted px-1">option1|option2|option3</code>.<br />
              Add <code className="rounded bg-muted px-1">repeat</code> column to auto-repeat a question N times.
            </p>
          )}
          {tab === 'json' && (
            <p className="text-[11px] text-muted-foreground">
              Add <code className="rounded bg-muted px-1">&quot;repeat&quot;: N</code> to auto-repeat a question N times with numbered titles.
            </p>
          )}
        </div>

        {error && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        )}

        {preview && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Preview: {preview.length} question{preview.length !== 1 ? 's' : ''}
            </p>
            <div className="max-h-48 space-y-1 overflow-y-auto rounded-xl border border-border bg-muted/20 p-3">
              {preview.map((q, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-[10px] text-primary">
                    {i + 1}
                  </span>
                  <span className="font-medium">{q.title}</span>
                  <Badge variant="secondary" className="rounded-full border-0 px-1.5 py-0 text-[10px]">
                    {q.type}
                  </Badge>
                  {q.required && <span className="text-[10px] text-destructive">*required</span>}
                  {q.options && (
                    <span className="truncate text-muted-foreground">
                      ({q.options.length} opt)
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2">
          {!preview ? (
            <Button onClick={handleParse} className="rounded-full" size="sm">
              <Upload className="mr-1.5 h-3.5 w-3.5" /> Parse
            </Button>
          ) : (
            <>
              <Button variant="ghost" onClick={reset} className="rounded-full" size="sm">
                <X className="mr-1.5 h-3.5 w-3.5" /> Clear
              </Button>
              <Button onClick={handleConfirm} className="rounded-full" size="sm">
                Add {preview.length} question{preview.length !== 1 ? 's' : ''}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex flex-1 items-center justify-center rounded-full px-4 py-1.5 text-sm font-medium transition-all',
        active ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
      )}
    >
      {children}
    </button>
  );
}
