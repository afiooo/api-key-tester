import type { TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type Props = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...rest }: Props) {
  return (
    <textarea
      className={cn(
        'w-full px-2 py-2 rounded-card border border-border bg-surface',
        'text-body text-fg placeholder:text-fg-subtle font-mono',
        'outline-none transition-colors',
        'focus:border-primary focus:ring-2 focus:ring-primary/20',
        className,
      )}
      {...rest}
    />
  );
}
