import type { ProviderId } from '@/types/models';

interface ProviderIconProps {
  provider: ProviderId;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function ProviderIcon({ provider, size = 16, className = '', style }: ProviderIconProps) {
  const props = { width: size, height: size, viewBox: '0 0 24 24', className, fill: 'none', style };

  switch (provider) {
    case 'openai':
      return (
        <svg {...props} fill="currentColor">
          <path d="M22.28 9.82a5.94 5.94 0 0 0-.51-4.91 6.04 6.04 0 0 0-5.19-2.95 6 6 0 0 0-4.49 2.02 5.5 5.5 0 0 0-4.1-1.48 5.5 5.5 0 0 0-5.24 5.5 5.5 5.5 0 0 0 .51 2.36 5.5 5.5 0 0 0-2.52 4.16 5.5 5.5 0 0 0 5.19 5.5 5.5 5.5 0 0 0 4.49-2.02 5.5 5.5 0 0 0 4.1 1.48 5.5 5.5 0 0 0 5.24-5.5 5.5 5.5 0 0 0-.51-2.36 5.5 5.5 0 0 0 2.52-4.16 5.5 5.5 0 0 0 .51-1.12zM12.2 17.4a4.2 4.2 0 0 1-4.2-4.2 4.2 4.2 0 0 1 .12-1.02l8.4-4.2a4.2 4.2 0 0 1 1.68 3.36 4.2 4.2 0 0 1-6 4.06z" />
        </svg>
      );
    case 'anthropic':
      return (
        <svg {...props} fill="currentColor">
          <path d="M13.82 12L8.82 22h3.94l5-10-5-10H8.82l5 10z" />
          <path d="M7.82 12L4.94 6.2 2.06 12l2.88 5.8L7.82 12z" />
        </svg>
      );
    case 'perplexity':
      return (
        <svg {...props} fill="currentColor">
          <path d="M12 2L3 9.5v8.2L12 24l9-6.3V9.5L12 2zm0 3.2l6.2 4.3v6L12 19.8 5.8 15.5v-6L12 5.2zM12 7.5L8 10.3v3.4l4 2.8 4-2.8v-3.4l-4-2.8z" />
        </svg>
      );
    case 'kimi':
      return (
        <svg {...props} fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3.5c3.6 0 6.5 2.9 6.5 6.5s-2.9 6.5-6.5 6.5-6.5-2.9-6.5-6.5 2.9-6.5 6.5-6.5zm0 3a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z" />
        </svg>
      );
    case 'deepseek':
      return (
        <svg {...props} fill="currentColor">
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 3.5c3.6 0 6.5 2.9 6.5 6.5s-2.9 6.5-6.5 6.5-6.5-2.9-6.5-6.5S8.4 5.5 12 5.5zm-3 6.5a3 3 0 0 0 6 0 3 3 0 0 0-6 0z" />
        </svg>
      );
    case 'gemini':
      return (
        <svg {...props} fill="currentColor">
          <path d="M12 2c0 5.5-4.5 10-10 10 5.5 0 10 4.5 10 10 0-5.5 4.5-10 10-10-5.5 0-10-4.5-10-10z" />
        </svg>
      );
    case 'groq':
      return (
        <svg {...props} fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5l-4-4 1.41-1.41L11 13.67l5.59-5.59L18 9.5l-7 7z" />
        </svg>
      );
    case 'mistral':
      return (
        <svg {...props} fill="currentColor">
          <rect x="3" y="3" width="4" height="4" />
          <rect x="9" y="3" width="4" height="4" />
          <rect x="15" y="3" width="4" height="4" />
          <rect x="9" y="9" width="4" height="4" />
          <rect x="15" y="9" width="4" height="4" />
          <rect x="3" y="9" width="4" height="4" />
          <rect x="3" y="15" width="4" height="4" />
          <rect x="9" y="15" width="4" height="4" />
          <rect x="15" y="15" width="4" height="4" />
          <rect x="9" y="15" width="4" height="4" opacity="0.5" />
        </svg>
      );
    case 'openrouter':
      return (
        <svg {...props} fill="currentColor">
          <path d="M12 2L2 12l10 10 10-10L12 2zm0 3.5L18.5 12 12 18.5 5.5 12 12 5.5z" />
        </svg>
      );
    default:
      return null;
  }
}
