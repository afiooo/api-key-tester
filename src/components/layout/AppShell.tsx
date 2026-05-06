import { useState, useEffect, type ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile sidebar when resizing to desktop
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) setMobileOpen(false);
    };
    handler(mq);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-fg">
      <div className="sticky top-0 z-[var(--z-sticky)]">
        <Navbar onMenuClick={() => setMobileOpen((o) => !o)} />
      </div>
      <div className="flex flex-1 min-h-[calc(100vh-4rem)]">
        <Sidebar
          isMobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />
        <main className="flex-1 min-w-0 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
