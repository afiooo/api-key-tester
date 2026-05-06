export type ProviderType =
  | 'openai'
  | 'claude'
  | 'gemini'
  | 'deepseek'
  | 'siliconcloud'
  | 'xai'
  | 'openrouter'
  | 'moonshot'
  | 'qwen'
  | 'doubao';

export interface AdvancedSettings {
  concurrency: number;
  retries: number;
  verboseLog: boolean;
  paidCheck: boolean;
  /** Custom test endpoint, e.g. /chat/completions, /messages */
  testEndpoint: string;
  /** Custom auth header name, e.g. Authorization, x-api-key */
  authHeader: string;
  /** Prefix before the key value, e.g. "Bearer " */
  authPrefix: string;
  /** Custom balance query endpoint, e.g. /user/info, /v1/usage */
  balanceEndpoint: string;
}

export interface ProviderConfig {
  id: string;
  name: string;
  provider: ProviderType;
  baseUrl: string;
  model: string;
  presetModels: string;
  apiKeys: string;
  proxyUrl: string;
  /** Extra HTTP headers as JSON string, e.g. {"anthropic-version":"2023-06-01"} */
  extraHeaders: string;
  /** Whether API key goes in URL query param (?key=) instead of header */
  queryParamAuth: boolean;
  advanced: AdvancedSettings;
}
