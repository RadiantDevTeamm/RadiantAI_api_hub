/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        xs: '400px',
      },
      colors: {
        bg: 'var(--c-bg)',
        surface: 'var(--c-surface)',
        'surface-2': 'var(--c-surface-2)',
        border: 'var(--c-border)',
        text: 'var(--c-text)',
        muted: 'var(--c-muted)',
        accent: 'var(--c-accent)',
        'accent-soft': 'var(--c-accent-soft)',
        'accent-text': 'var(--c-accent-text)',
        'code-bg': 'var(--c-code-bg)',
        danger: 'var(--c-danger)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
        display: ['var(--font-display)', 'var(--font-mono)', 'monospace'],
      },
      borderRadius: {
        theme: 'var(--radius)',
      },
      boxShadow: {
        theme: 'var(--shadow)',
      },
      transitionTimingFunction: {
        theme: 'var(--ease)',
      },
    },
  },
  plugins: [],
};
