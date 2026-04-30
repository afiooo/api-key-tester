import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { ProviderConfig, ProviderType } from '@/types/provider';
import { PROVIDER_PRESETS } from '@/data/providerPresets';
import { DEFAULT_ADVANCED } from '@/constants/defaults';

// ── State ──────────────────────────────────────────────────────────

interface ConfigState {
  configs: ProviderConfig[];
  activeConfigId: string | null;
}

const STORAGE_KEY = 'provider_configs';
const ACTIVE_KEY = 'active_config_id';

const BUILTIN_TYPES: ProviderType[] = [
  'openai', 'claude', 'gemini', 'deepseek',
  'siliconcloud', 'xai', 'openrouter',
];

function createBuiltinConfigs(): ProviderConfig[] {
  return BUILTIN_TYPES.map((provider) => {
    const preset = PROVIDER_PRESETS[provider];
    return {
      id: `builtin_${provider}`,
      name: preset.name,
      provider,
      baseUrl: preset.defaultBaseUrl,
      model: preset.defaultModel,
      presetModels: preset.modelOptions.join(', '),
      apiKeys: '',
      proxyUrl: '',
      extraHeaders: preset.defaultExtraHeaders,
      queryParamAuth: preset.defaultQueryParamAuth,
      advanced: {
        ...DEFAULT_ADVANCED,
        testEndpoint: preset.defaultEndpoint,
        authHeader: preset.defaultAuthHeader,
        authPrefix: preset.defaultAuthPrefix,
        balanceEndpoint: preset.defaultBalanceEndpoint,
      },
    };
  });
}

function loadState(): ConfigState {
  const builtins = createBuiltinConfigs();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved: ProviderConfig[] = JSON.parse(raw);
      const savedMap = new Map(saved.map((c) => [c.provider, c]));

      // Merge saved data into builtins, deep-merging advanced settings
      const merged = builtins.map((b) => {
        const saved_ = savedMap.get(b.provider);
        if (!saved_) return b;
        return {
          ...b,
          ...saved_,
          id: b.id,
          provider: b.provider,
          advanced: { ...b.advanced, ...saved_.advanced },
          extraHeaders: saved_.extraHeaders ?? b.extraHeaders,
          queryParamAuth: saved_.queryParamAuth ?? b.queryParamAuth,
        };
      });

      // Add user-created configs (those whose provider isn't a builtin type, or extra ones)
      const savedIds = new Set(builtins.map((b) => b.provider));
      const userConfigs = saved.filter((c) => !savedIds.has(c.provider as ProviderType));

      const configs = [...merged, ...userConfigs];
      const activeConfigId = localStorage.getItem(ACTIVE_KEY);
      const validId = activeConfigId && configs.some((c) => c.id === activeConfigId)
        ? activeConfigId
        : configs[0]?.id ?? null;

      return { configs, activeConfigId: validId };
    }
  } catch {
    // fall through
  }

  // First visit: builtins only
  localStorage.setItem(STORAGE_KEY, JSON.stringify(builtins));
  localStorage.setItem(ACTIVE_KEY, builtins[0]?.id ?? null);
  return { configs: builtins, activeConfigId: builtins[0]?.id ?? null };
}

// ── Helpers ────────────────────────────────────────────────────────

let counter = 0;
function nextId() {
  counter += 1;
  return `cfg_${Date.now()}_${counter}`;
}

function isBuiltin(id: string) {
  return id.startsWith('builtin_');
}

// ── Actions ────────────────────────────────────────────────────────

type Action =
  | { type: 'ADD'; payload: ProviderConfig }
  | { type: 'UPDATE'; payload: { id: string; data: Partial<ProviderConfig> } }
  | { type: 'DELETE'; payload: string }
  | { type: 'SET_ACTIVE'; payload: string | null };

function reducer(state: ConfigState, action: Action): ConfigState {
  switch (action.type) {
    case 'ADD':
      return { ...state, configs: [...state.configs, action.payload] };

    case 'UPDATE':
      return {
        ...state,
        configs: state.configs.map((c) =>
          c.id === action.payload.id ? { ...c, ...action.payload.data } : c,
        ),
      };

    case 'DELETE':
      // Prevent deleting built-in configs
      if (isBuiltin(action.payload)) return state;
      return {
        configs: state.configs.filter((c) => c.id !== action.payload),
        activeConfigId:
          state.activeConfigId === action.payload
            ? state.configs.find((c) => c.id !== action.payload)?.id ?? null
            : state.activeConfigId,
      };

    case 'SET_ACTIVE':
      return { ...state, activeConfigId: action.payload };

    default:
      return state;
  }
}

// ── Context ────────────────────────────────────────────────────────

interface ConfigContextValue {
  configs: ProviderConfig[];
  activeConfigId: string | null;
  activeConfig: ProviderConfig | null;
  addConfig: (provider: ProviderType, name: string) => string;
  updateConfig: (id: string, data: Partial<ProviderConfig>) => void;
  deleteConfig: (id: string) => void;
  setActiveConfig: (id: string) => void;
  isBuiltin: (id: string) => boolean;
}

const ConfigContext = createContext<ConfigContextValue | null>(null);

// ── Provider ───────────────────────────────────────────────────────

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);
  const [ready, setReady] = useState(false);

  // Persist to localStorage (skip initial sync)
  useEffect(() => {
    if (!ready) { setReady(true); return; }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.configs));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.configs]);

  useEffect(() => {
    if (state.activeConfigId) {
      localStorage.setItem(ACTIVE_KEY, state.activeConfigId);
    } else {
      localStorage.removeItem(ACTIVE_KEY);
    }
  }, [state.activeConfigId]);

  const value: ConfigContextValue = {
    configs: state.configs,
    activeConfigId: state.activeConfigId,
    activeConfig:
      state.configs.find((c) => c.id === state.activeConfigId) ?? null,

    addConfig(provider, name) {
      const preset = PROVIDER_PRESETS[provider];
      const config: ProviderConfig = {
        id: nextId(),
        name,
        provider,
        baseUrl: preset.defaultBaseUrl,
        model: preset.defaultModel,
        presetModels: preset.modelOptions.join(', '),
        apiKeys: '',
        proxyUrl: '',
        extraHeaders: preset.defaultExtraHeaders,
        queryParamAuth: preset.defaultQueryParamAuth,
        advanced: {
          ...DEFAULT_ADVANCED,
          testEndpoint: preset.defaultEndpoint,
          authHeader: preset.defaultAuthHeader,
          authPrefix: preset.defaultAuthPrefix,
          balanceEndpoint: preset.defaultBalanceEndpoint,
        },
      };
      dispatch({ type: 'ADD', payload: config });
      return config.id;
    },

    updateConfig(id, data) {
      dispatch({ type: 'UPDATE', payload: { id, data } });
    },

    deleteConfig(id) {
      dispatch({ type: 'DELETE', payload: id });
    },

    setActiveConfig(id) {
      dispatch({ type: 'SET_ACTIVE', payload: id });
    },

    isBuiltin,
  };

  return (
    <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────

export function useConfig(): ConfigContextValue {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error('useConfig must be used within ConfigProvider');
  return ctx;
}
