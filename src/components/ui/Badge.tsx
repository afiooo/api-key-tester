import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'success' | 'error' | 'warning' | 'info';

interface BadgeProps {
  tone: Tone;
  children: ReactNode;
  className?: string;
}

const toneClasses: Record<Tone, string> = {
  success: 'bg-success-soft border-success text-fg',
  error: 'bg-error-soft border-error text-fg',
  warning: 'bg-warning-soft border-warning text-fg',
  info: 'bg-primary-soft border-primary text-fg',
};

export function Badge({ tone, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center w-24 h-8 rounded-full border text-body',
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
