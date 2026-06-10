import { NotFoundContent } from '@/components/404/NotFoundContent';
import { AvailableForms } from './AvailableForms';

export function NotFoundShell({ message }: { message: string }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4">
      <NotFoundContent
        title="This form isn't here"
        description={message}
        showNav={false}
      >
        <div className="mt-6">
          <AvailableForms formId={null} />
        </div>
      </NotFoundContent>
    </div>
  );
}
