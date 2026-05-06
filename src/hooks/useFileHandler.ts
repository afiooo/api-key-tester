import { useRef, useCallback, type ChangeEvent } from 'react';
import { toast } from '@/lib/toast';
import { extractApiKeys } from '@/lib/keyProcessor';

interface UseFileHandlerOptions {
  onKeysLoaded: (keysText: string) => void;
  t: (key: string, params?: Record<string, number>) => string;
}

export function useFileHandler({ onKeysLoaded, t }: UseFileHandlerOptions) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.name.endsWith('.txt')) {
        toast.error(t('selectTextFile'));
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(t('fileTooLarge'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result as string;
        const keys = extractApiKeys(text);
        if (keys.length === 0) {
          toast.error(t('noValidKeysFound'));
          return;
        }
        onKeysLoaded(keys.join('\n'));
        toast.success(t('importSuccess', { count: keys.length }));
      };
      reader.onerror = () => {
        toast.error(t('importFailed'));
      };
      reader.readAsText(file);

      // Reset so re-selecting the same file triggers onChange again
      e.target.value = '';
    },
    [onKeysLoaded, t],
  );

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) {
        toast.error(t('clipboardError'));
        return;
      }
      const lines = text
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);
      const cleaned = Array.from(new Set(lines));
      onKeysLoaded(cleaned.join('\n'));
      toast.success(t('importSuccess', { count: cleaned.length }));
    } catch {
      toast.error(t('clipboardError'));
    }
  }, [onKeysLoaded, t]);

  return { fileInputRef, handleFileUpload, handleFileChange, handlePaste };
}
