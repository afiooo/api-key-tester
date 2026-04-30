import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  tone?: 'default' | 'info';
  padding?: 'none' | 'sm' | 'md';
}

export function Card({
  children,
  className,
  tone = 'default',
  padding = 'md',
  ...rest
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-card border',
        tone === 'default'
          ? 'bg-card border-border'
          : 'bg-primary-soft border-primary-soft',
        padding === 'md' && 'p-4',
        padding === 'sm' && 'p-2',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
