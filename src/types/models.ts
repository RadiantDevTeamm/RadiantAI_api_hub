export type ProviderId =
  | 'openai'
  | 'anthropic'
  | 'perplexity'
  | 'kimi'
  | 'deepseek'
  | 'gemini'
  | 'groq'
  | 'mistral'
  | 'openrouter';

export interface Provider {
  id: ProviderId;
  label: string;
  docsUrl: string;
  keyPrefixes: string[];
  placeholder: string;
  color: string;
  /** If true, this provider shares a prefix with others and needs manual confirmation */
  ambiguous?: boolean;
}

export const PROVIDERS: Provider[] = [
  {
    id: 'openai',
    label: 'OpenAI',
    docsUrl: 'https://platform.openai.com/api-keys',
    keyPrefixes: ['sk-proj-', 'sk-'],
    placeholder: 'sk-... or sk-proj-...',
    color: '#10a37f',
  },
  {
    id: 'anthropic',
    label: 'Anthropic',
    docsUrl: 'https://console.anthropic.com/settings/keys',
    keyPrefixes: ['sk-ant-'],
    placeholder: 'sk-ant-...',
    color: '#d4a27f',
  },
  {
    id: 'perplexity',
    label: 'Perplexity',
    docsUrl: 'https://www.perplexity.ai/settings/api',
    keyPrefixes: ['pplx-'],
    placeholder: 'pplx-...',
    color: '#20808e',
  },
  {
    id: 'kimi',
    label: 'Kimi (Moonshot)',
    docsUrl: 'https://platform.moonshot.cn/console/api-keys',
    keyPrefixes: ['sk-'],
    placeholder: 'sk-...',
    color: '#5b5bd6',
    ambiguous: true,
  },
  {
    id: 'deepseek',
    label: 'DeepSeek',
    docsUrl: 'https://platform.deepseek.com/api_keys',
    keyPrefixes: ['sk-'],
    placeholder: 'sk-...',
    color: '#4d6bfe',
    ambiguous: true,
  },
  {
    id: 'gemini',
    label: 'Google Gemini',
    docsUrl: 'https://aistudio.google.com/app/apikey',
    keyPrefixes: ['AIza'],
    placeholder: 'AIza...',
    color: '#4285f4',
  },
  {
    id: 'groq',
    label: 'Groq',
    docsUrl: 'https://console.groq.com/keys',
    keyPrefixes: ['gsk_'],
    placeholder: 'gsk_...',
    color: '#f55036',
  },
  {
    id: 'mistral',
    label: 'Mistral AI',
    docsUrl: 'https://console.mistral.ai/api-keys',
    keyPrefixes: ['mistral-'],
    placeholder: 'mistral-...',
    color: '#ff7000',
  },
  {
    id: 'openrouter',
    label: 'OpenRouter',
    docsUrl: 'https://openrouter.ai/keys',
    keyPrefixes: ['sk-or-'],
    placeholder: 'sk-or-...',
    color: '#8a3ffc',
  },
];

export interface ModelOption {
  id: string;
  label: string;
  provider: ProviderId;
  apiName: string;
}

export const PROVIDER_MODELS: Record<ProviderId, ModelOption[]> = {
  openai: [
    { id: 'gpt-4o', label: 'GPT-4o', provider: 'openai', apiName: 'gpt-4o' },
    { id: 'gpt-4o-mini', label: 'GPT-4o mini', provider: 'openai', apiName: 'gpt-4o-mini' },
    { id: 'o1', label: 'o1', provider: 'openai', apiName: 'o1' },
    { id: 'o3-mini', label: 'o3-mini', provider: 'openai', apiName: 'o3-mini' },
  ],
  anthropic: [
    { id: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet', provider: 'anthropic', apiName: 'claude-3-5-sonnet-20241022' },
    { id: 'claude-3-5-haiku', label: 'Claude 3.5 Haiku', provider: 'anthropic', apiName: 'claude-3-5-haiku-20241022' },
    { id: 'claude-3-opus', label: 'Claude 3 Opus', provider: 'anthropic', apiName: 'claude-3-opus-20240229' },
  ],
  perplexity: [
    { id: 'sonar', label: 'Sonar', provider: 'perplexity', apiName: 'sonar' },
    { id: 'sonar-pro', label: 'Sonar Pro', provider: 'perplexity', apiName: 'sonar-pro' },
    { id: 'sonar-reasoning', label: 'Sonar Reasoning', provider: 'perplexity', apiName: 'sonar-reasoning' },
  ],
  kimi: [
    { id: 'kimi-latest', label: 'Kimi Latest', provider: 'kimi', apiName: 'kimi-latest' },
    { id: 'moonshot-v1-8k', label: 'Moonshot v1 8K', provider: 'kimi', apiName: 'moonshot-v1-8k' },
    { id: 'moonshot-v1-32k', label: 'Moonshot v1 32K', provider: 'kimi', apiName: 'moonshot-v1-32k' },
    { id: 'moonshot-v1-128k', label: 'Moonshot v1 128K', provider: 'kimi', apiName: 'moonshot-v1-128k' },
  ],
  deepseek: [
    { id: 'deepseek-chat', label: 'DeepSeek V3 (Chat)', provider: 'deepseek', apiName: 'deepseek-chat' },
    { id: 'deepseek-reasoner', label: 'DeepSeek R1 (Reasoner)', provider: 'deepseek', apiName: 'deepseek-reasoner' },
  ],
  gemini: [
    { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', provider: 'gemini', apiName: 'gemini-2.0-flash' },
    { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', provider: 'gemini', apiName: 'gemini-1.5-pro' },
  ],
  groq: [
    { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B', provider: 'groq', apiName: 'llama-3.3-70b-versatile' },
    { id: 'deepseek-r1-distill-llama-70b', label: 'DeepSeek R1 Distill 70B', provider: 'groq', apiName: 'deepseek-r1-distill-llama-70b' },
  ],
  mistral: [
    { id: 'mistral-large-latest', label: 'Mistral Large', provider: 'mistral', apiName: 'mistral-large-latest' },
    { id: 'codestral-latest', label: 'Codestral', provider: 'mistral', apiName: 'codestral-latest' },
  ],
  openrouter: [
    { id: 'or-auto', label: 'Auto / Best', provider: 'openrouter', apiName: 'auto' },
    { id: 'or-claude-3.5-sonnet', label: 'Claude 3.5 Sonnet', provider: 'openrouter', apiName: 'anthropic/claude-3.5-sonnet' },
    { id: 'or-deepseek-r1', label: 'DeepSeek R1', provider: 'openrouter', apiName: 'deepseek/deepseek-r1' },
  ],
};

export function getProvider(id: ProviderId): Provider {
  return PROVIDERS.find((p) => p.id === id) || PROVIDERS[0];
}

/** Returns array of matching providers for a key (handles ambiguous sk- prefix) */
export function detectProviders(key: string): ProviderId[] {
  const trimmed = key.trim();
  if (!trimmed) return [];
  const matches: ProviderId[] = [];
  for (const p of PROVIDERS) {
    if (p.keyPrefixes.some((prefix) => trimmed.startsWith(prefix))) {
      matches.push(p.id);
    }
  }
  return matches;
}

/** Returns single provider if unambiguous, null if ambiguous or no match */
export function detectProvider(key: string): ProviderId | null {
  const matches = detectProviders(key);
  if (matches.length === 0) return null;
  if (matches.length === 1) return matches[0];
  // Multiple matches (ambiguous sk-) — return null to let user choose
  return null;
}

/** Returns single provider if unambiguous, or array of candidates if ambiguous */
export function detectProviderWithAmbiguity(key: string): {
  provider: ProviderId | null;
  candidates: ProviderId[];
} {
  const matches = detectProviders(key);
  if (matches.length === 0) return { provider: null, candidates: [] };
  if (matches.length === 1) return { provider: matches[0], candidates: [] };
  return { provider: null, candidates: matches };
}

export interface SavedModel {
  id: string;
  nickname: string;
  provider: ProviderId;
  modelId: string;
  modelLabel: string;
  apiName: string;
  apiKey: string;
  createdAt: number;
}
