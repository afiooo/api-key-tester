import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'success' | 'ghost' | 'soft' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-primary text-on-primary hover:opacity-90 active:opacity-80 disabled:opacity-50',
  secondary:
    'bg-secondary text-on-primary hover:opacity-90 active:opacity-80 disabled:opacity-50',
  success:
    'bg-success text-on-primary hover:opacity-90 active:opacity-80 disabled:opacity-50',
  ghost:
    'bg-transparent text-fg hover:bg-card active:bg-border border border-border',
  soft:
    'bg-primary-soft text-primary hover:bg-primary/15',
  danger:
    'bg-error text-on-primary hover:opacity-90 active:opacity-80 disabled:opacity-50',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-8 px-3 text-btn',
  md: 'h-10 px-4 text-btn',
  lg: 'h-12 px-5 text-btn',
};

export function Button({
  variant = 'primary',
  size = 'md',
  block,
  iconLeft,
  iconRight,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-[8px] font-bold transition-colors select-none cursor-pointer disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        block && 'w-full',
        className,
      )}
      {...rest}
    >
      {iconLeft}
      {children}
      {iconRight}
    </button>
  );
}
