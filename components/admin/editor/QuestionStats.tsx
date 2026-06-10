'use client';

import { FormQuestion } from '@/types';
import { ResponseStats } from './questionTypes';
import { Type as TypeIcon, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function QuestionStats({
  question,
  qStats,
  totalResponses,
}: {
  question: FormQuestion;
  qStats: ResponseStats['stats'][string] | undefined;
  totalResponses: number;
}) {
  if (!qStats || qStats.count === 0) {
    return <p className="text-sm italic text-muted-foreground">No responses yet.</p>;
  }

  if (question.type === 'multiple-choice' || question.type === 'checkbox' || question.type === 'yes-no') {
    const dist = qStats.distribution || {};
    const entries = Object.entries(dist).sort((a, b) => b[1] - a[1]);
    const barColors = ['#512ef8', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#a855f7', '#f97316', '#84cc16', '#ec4899', '#14b8a6'];
    return (
      <div className="space-y-1.5">
        {entries.map(([option, count], i) => {
          const pct = totalResponses > 0 ? (count / totalResponses) * 100 : 0;
          return (
            <div key={option} className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="min-w-0 flex-1 truncate text-xs font-medium">{option}</span>
                <span className="shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
                  {count} · {pct.toFixed(0)}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted sm:h-1.5">
                <div
                  className="h-full rounded-full transition-[width] duration-700"
                  style={{ width: `${pct}%`, backgroundColor: barColors[i % barColors.length] }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (question.type === 'likert-scale' || question.type === 'rating') {
    const dist = qStats.distribution || {};
    const max = question.maxScore || 5;
    const values = qStats.values || [];
    return (
      <div>
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-3xl font-semibold tabular-nums text-primary">
            {qStats.average ?? '0.0'}
          </span>
          <span className="text-sm text-muted-foreground">/ {max} average</span>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground sm:ml-auto">
            <Star className="h-3 w-3" /> {values.length} ratings
          </span>
        </div>
        <div className="mt-4 space-y-2">
          {Array.from({ length: max }, (_, i) => i + 1).map((score) => {
            const count = dist[String(score)] || 0;
            const pct = values.length > 0 ? (count / values.length) * 100 : 0;
            return (
              <div key={score} className="flex items-center gap-3 text-sm">
                <span className="w-6 font-mono text-xs text-muted-foreground">{score}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-8 text-right font-mono text-xs tabular-nums text-muted-foreground">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (question.type === 'number') {
    const values = (qStats.responses as Array<number>) || [];
    const nums = values.filter((v) => typeof v === 'number');
    if (nums.length === 0) {
      return <p className="text-sm italic text-muted-foreground">No numeric responses yet.</p>;
    }
    const sum = nums.reduce((a, b) => a + b, 0);
    const avg = sum / nums.length;
    const min = Math.min(...nums);
    const max = Math.max(...nums);
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <NumericStat label="Average" value={avg.toFixed(1)} />
        <NumericStat label="Min" value={String(min)} />
        <NumericStat label="Max" value={String(max)} />
      </div>
    );
  }

  const responses = (qStats.responses as Array<string>) || [];
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <TypeIcon className="h-3 w-3" /> {responses.length} {responses.length === 1 ? 'response' : 'responses'}
      </div>
      <ul className="max-h-72 space-y-2 overflow-y-auto pr-1">
        {responses.slice(0, 20).map((r, i) => (
          <li
            key={i}
            className="rounded-xl border border-border bg-background/60 px-3 py-2 text-sm text-foreground/90"
          >
            {r || <span className="italic text-muted-foreground">empty</span>}
          </li>
        ))}
      </ul>
      {responses.length > 20 && <p className="text-xs text-muted-foreground">+{responses.length - 20} more</p>}
    </div>
  );
}

function NumericStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/60 p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}
