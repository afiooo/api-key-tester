import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...rest }: InputProps) {
  return (
    <input
      className={cn(
        'w-full h-8 px-2 rounded-card border border-border bg-surface',
        'text-body text-fg placeholder:text-fg-subtle',
        'outline-none transition-colors',
        'focus:border-primary focus:ring-2 focus:ring-primary/20',
        className,
      )}
      {...rest}
    />
  );
}
