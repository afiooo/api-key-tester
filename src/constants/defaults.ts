import type { AdvancedSettings } from '@/components/modals/AdvancedSettingsModal';

export const DEFAULT_ADVANCED: AdvancedSettings = {
  concurrency: 20,
  retries: 1,
  verboseLog: false,
  paidCheck: false,
  testEndpoint: '',
  authHeader: '',
  authPrefix: '',
  balanceEndpoint: '',
};

export const DEFAULT_CONCURRENCY = 20;
export const DEFAULT_RETRIES = 1;
