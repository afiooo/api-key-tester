import { useCallback, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';
const STORAGE_KEY = 'api-key-tester-theme';

function readStored(): ThemeMode {
  if (typeof window === 'undefined') return 'system';
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === 'light' || v === 'dark' || v === 'system' ? v : 'system';
}

function resolveActual(mode: ThemeMode): 'light' | 'dark' {
  if (mode !== 'system') return mode;
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useTheme() {
  const [mode, setModeState] = useState<ThemeMode>(() => readStored());
  const [actual, setActual] = useState<'light' | 'dark'>(() => resolveActual(readStored()));

  const apply = useCallback((m: ThemeMode) => {
    const next = resolveActual(m);
    setActual(next);
    const root = document.documentElement;
    if (next === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, []);

  useEffect(() => {
    apply(mode);
  }, [mode, apply]);

  useEffect(() => {
    if (mode !== 'system') return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => apply('system');
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [mode, apply]);

  const setMode = useCallback((m: ThemeMode) => {
    window.localStorage.setItem(STORAGE_KEY, m);
    setModeState(m);
  }, []);

  return { mode, actual, setMode };
}
