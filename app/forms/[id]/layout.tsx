import type { Metadata } from 'next';
import { getForm } from '@/lib/formStore';
import { createMetadata } from '@/lib/metadata';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const form = await getForm(id);

  if (!form) {
    return createMetadata({ title: 'Form not found · Givita' });
  }

  return createMetadata({
    title: form.title,
    description: form.description || `Fill out the ${form.title} survey on Givita`,
    openGraph: {
      title: form.title,
      description: form.description || `Fill out the ${form.title} survey on Givita`,
    },
    twitter: {
      title: form.title,
      description: form.description || `Fill out the ${form.title} survey on Givita`,
    },
  });
}

export default function FormLayout({ children }: { children: React.ReactNode }) {
  return children;
}
