import { createContext, useContext } from 'react';
import type { ProviderConfig, ProviderType } from '@/types/provider';

export interface ConfigContextValue {
  configs: ProviderConfig[];
  activeConfigId: string | null;
  activeConfig: ProviderConfig | null;
  addConfig: (provider: ProviderType, name: string) => string;
  updateConfig: (id: string, data: Partial<ProviderConfig>) => void;
  deleteConfig: (id: string) => void;
  setActiveConfig: (id: string) => void;
  isBuiltin: (id: string) => boolean;
}

export const ConfigContext = createContext<ConfigContextValue | null>(null);

export function useConfig(): ConfigContextValue {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error('useConfig must be used within ConfigProvider');
  return ctx;
}
