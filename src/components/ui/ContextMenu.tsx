import { useEffect, useRef, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface ContextMenuItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  danger?: boolean;
}

interface ContextMenuProps {
  items: ContextMenuItem[];
  position: { x: number; y: number } | null;
  onClose: () => void;
}

export function ContextMenu({ items, position, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!position) return;
    const handler = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent && e.key === 'Escape') {
        onClose();
        return;
      }
      // Click outside
      if (e instanceof MouseEvent && ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Delay adding listener so the right-click that opened it doesn't immediately close
    const id = setTimeout(() => {
      document.addEventListener('mousedown', handler);
      document.addEventListener('keydown', handler);
    }, 0);

    return () => {
      clearTimeout(id);
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', handler);
    };
  }, [position, onClose]);

  if (!position) return null;

  return (
    <div
      ref={ref}
      className="fixed z-[9999] min-w-[140px] rounded-card border border-border bg-bg shadow-popover overflow-hidden py-1"
      style={{ left: position.x, top: position.y }}
    >
      {items.map((item, i) => (
        <button
          key={i}
          type="button"
          onClick={() => {
            item.onClick();
            onClose();
          }}
          className={cn(
            'w-full flex items-center gap-2 px-3 py-2 text-btn text-left cursor-pointer transition-colors',
            item.danger
              ? 'text-error hover:bg-error-soft'
              : 'text-fg hover:bg-card',
          )}
        >
          {item.icon && <span className="w-4 h-4 flex items-center justify-center shrink-0">{item.icon}</span>}
          {item.label}
        </button>
      ))}
    </div>
  );
}
