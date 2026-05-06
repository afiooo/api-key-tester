import {
  cloneElement,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type FocusEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/cn';

type Side = 'top' | 'bottom' | 'left' | 'right';

interface TriggerProps {
  ref?: Ref<HTMLElement>;
  onMouseEnter?: (e: MouseEvent<HTMLElement>) => void;
  onMouseLeave?: (e: MouseEvent<HTMLElement>) => void;
  onFocus?: (e: FocusEvent<HTMLElement>) => void;
  onBlur?: (e: FocusEvent<HTMLElement>) => void;
  'aria-describedby'?: string;
}

interface TooltipProps {
  /** Tooltip body — usually a string, but any ReactNode works. */
  content: ReactNode;
  /** A single React element that will receive hover/focus handlers. */
  children: ReactElement<TriggerProps>;
  /** Preferred side; will be clamped to the viewport. Default: 'top'. */
  side?: Side;
  /** Delay before showing, in ms. Default: 200. */
  delay?: number;
  /** Extra classes for the tooltip bubble. */
  className?: string;
}

export function Tooltip({
  content,
  children,
  side = 'top',
  delay = 200,
  className,
}: TooltipProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);

  const show = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(true), delay);
  };
  const hide = () => {
    window.clearTimeout(timer.current);
    setOpen(false);
  };

  // Position the bubble after it mounts so we can read its measured size.
  useLayoutEffect(() => {
    if (!open || !triggerRef.current || !tipRef.current) return;
    const t = triggerRef.current.getBoundingClientRect();
    const p = tipRef.current.getBoundingClientRect();
    const gap = 6;
    let top: number;
    let left: number;
    if (side === 'top') {
      top = t.top - p.height - gap;
      left = t.left + (t.width - p.width) / 2;
    } else if (side === 'bottom') {
      top = t.bottom + gap;
      left = t.left + (t.width - p.width) / 2;
    } else if (side === 'left') {
      top = t.top + (t.height - p.height) / 2;
      left = t.left - p.width - gap;
    } else {
      top = t.top + (t.height - p.height) / 2;
      left = t.right + gap;
    }
    // Clamp to viewport with an 8px safety margin.
    left = Math.max(8, Math.min(left, window.innerWidth - p.width - 8));
    top = Math.max(8, Math.min(top, window.innerHeight - p.height - 8));
    setPos({ top, left });
  }, [open, side, content]);

  // Clean up any pending timer on unmount.
  useLayoutEffect(
    () => () => {
      window.clearTimeout(timer.current);
    },
    [],
  );

  const childProps: TriggerProps = children.props;
  const childRef = (children as ReactElement & { ref?: Ref<HTMLElement> }).ref;

  // Merge our ref with any ref the child may already have.
  const setTriggerRef = (node: HTMLElement | null) => {
    triggerRef.current = node;
    if (typeof childRef === 'function') {
      childRef(node);
    } else if (childRef && typeof childRef === 'object') {
      (childRef as { current: HTMLElement | null }).current = node;
    }
  };

  // Chain — never overwrite — the child's existing handlers.
  const onMouseEnter = (e: MouseEvent<HTMLElement>) => {
    childProps.onMouseEnter?.(e);
    show();
  };
  const onMouseLeave = (e: MouseEvent<HTMLElement>) => {
    childProps.onMouseLeave?.(e);
    hide();
  };
  const onFocus = (e: FocusEvent<HTMLElement>) => {
    childProps.onFocus?.(e);
    show();
  };
  const onBlur = (e: FocusEvent<HTMLElement>) => {
    childProps.onBlur?.(e);
    hide();
  };

  const trigger = cloneElement(children, {
    ref: setTriggerRef,
    'aria-describedby': open ? id : childProps['aria-describedby'],
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur,
  });

  return (
    <>
      {trigger}
      {open &&
        createPortal(
          <div
            ref={tipRef}
            id={id}
            role="tooltip"
            style={pos ? { top: pos.top, left: pos.left } : { visibility: 'hidden' }}
            className={cn(
              'fixed z-[var(--z-tooltip)] px-2 py-1 text-xs rounded-card',
              'bg-canvas text-fg border border-border shadow-popover',
              'pointer-events-none whitespace-nowrap',
              className,
            )}
          >
            {content}
          </div>,
          document.body,
        )}
    </>
  );
}
