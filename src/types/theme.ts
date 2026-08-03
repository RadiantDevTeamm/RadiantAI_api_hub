import type { LucideIcon } from 'lucide-react';
import { Moon, Sun, Grid3x3, Coffee } from 'lucide-react';

export type ThemeId = 'classic-dark' | 'classic-light' | 'perplexity-cream' | 'nothing';
export type ThemeFamily = 'classic' | 'nothing';

export interface ThemeDef {
  id: ThemeId;
  label: string;
  family: ThemeFamily;
  icon: LucideIcon;
  swatch: { bg: string; surface: string; accent: string; border: string };
  description: string;
}

export const THEMES: ThemeDef[] = [
  {
    id: 'classic-dark',
    label: 'Dark Mode',
    family: 'classic',
    icon: Moon,
    swatch: { bg: '#0a0b0f', surface: '#131419', accent: '#5b8def', border: '#26282f' },
    description: 'Perplexity & Linear inspired',
  },
  {
    id: 'perplexity-cream',
    label: 'Light (Perplexity Cream)',
    family: 'classic',
    icon: Coffee,
    swatch: { bg: '#F9F9F8', surface: '#EFEFEA', accent: '#1F7B8C', border: '#D8D8D2' },
    description: 'Warm cream with teal accent',
  },
  {
    id: 'classic-light',
    label: 'Classic Light',
    family: 'classic',
    icon: Sun,
    swatch: { bg: '#f7f8fa', surface: '#ffffff', accent: '#4f7ce8', border: '#e3e5ea' },
    description: 'Clean & bright',
  },
  {
    id: 'nothing',
    label: 'Nothing Style',
    family: 'nothing',
    icon: Grid3x3,
    swatch: { bg: '#000000', surface: '#0a0a0a', accent: '#ffffff', border: '#2a2a2a' },
    description: 'Dot-matrix monochrome',
  },
];

export const DEFAULT_THEME: ThemeId = 'classic-dark';
