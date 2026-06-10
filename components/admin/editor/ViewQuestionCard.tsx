import { FormQuestion } from '@/types';
import { Badge } from '@/components/ui/badge';

export function ViewQuestionCard({
  question,
  index,
}: {
  question: FormQuestion;
  index: number;
}) {
  return (
    <article className="rounded-3xl border border-border bg-card/40 p-5 backdrop-blur">
      <div className="flex items-start gap-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-xs font-semibold text-primary">
          {index + 1}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold">{question.title}</h3>
          {question.description && (
            <p className="mt-1 text-sm text-muted-foreground">{question.description}</p>
          )}
        </div>
        <Badge variant="secondary" className="shrink-0 rounded-full border-0 bg-muted text-muted-foreground">
          {question.type}
        </Badge>
      </div>
    </article>
  );
}
