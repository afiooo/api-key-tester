import { useEffect, useRef } from 'react';

export function useClickOutside<T extends HTMLElement = HTMLElement>(
  active: boolean,
  onOutside: () => void,
) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!active) return;
    const handle = (e: MouseEvent) => {
      const node = ref.current;
      if (!node) return;
      if (e.target instanceof Node && !node.contains(e.target)) {
        onOutside();
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOutside();
    };
    document.addEventListener('mousedown', handle);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handle);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [active, onOutside]);

  return ref;
}
