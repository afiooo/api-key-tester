import { Toaster } from 'react-hot-toast';

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          background: 'var(--color-card)',
          color: 'var(--color-fg)',
          border: '1px solid var(--color-border)',
          fontSize: '14px',
          borderRadius: '8px',
        },
        success: {
          iconTheme: { primary: 'var(--color-success)', secondary: '#fff' },
        },
        error: {
          iconTheme: { primary: 'var(--color-error)', secondary: '#fff' },
        },
      }}
    />
  );
}
