import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const COLOR_PALETTE = {
  primary: '#F4F4F2',
  secondary: '#E8E8E8',
  neutral: '#BBBFCA',
  dark: '#495464',
};

export type ThemeType = 'modern' | 'classic' | 'dark' | 'glass';

export interface ThemeConfig {
  id: ThemeType;
  name: string;
  colors: {
    background: string;
    text: string;
    title: string;
    accent: string;
  };
  fonts: {
    title: string;
    header: string;
    subheader: string;
    body: string;
  };
  typography: {
    fontFamily: string;
    titleSize: number;
    textSize: number;
    titleWeight: string;
  };
  layout: {
    padding: number;
    gap: number;
    borderRadius: number;
  };
}

/**
 * Optimized for 960x540 canvas (Half 1080p)
 * Standard Google Slides scale (scaled 0.5x):
 * Title: ~42px
 * Body: ~20px
 * Security Margin (Padding): 40px
 */
export const THEMES: Record<ThemeType, ThemeConfig> = {
  modern: {
    id: 'modern',
    name: 'Modern Clean',
    colors: {
      background: '#FFFFFF',
      text: '#495464',
      title: '#1a1a1a',
      accent: '#3b82f6',
    },
    fonts: {
      title: 'Instrument Sans, sans-serif',
      header: 'Instrument Sans, sans-serif',
      subheader: 'Instrument Sans, sans-serif',
      body: 'Instrument Sans, sans-serif',
    },
    typography: {
      fontFamily: `var(--brand-font-body, 'Instrument Sans, sans-serif')`,
      titleSize: 42,
      textSize: 20,
      titleWeight: '800',
    },
    layout: {
      padding: 40,
      gap: 24,
      borderRadius: 12,
    },
  },
  classic: {
    id: 'classic',
    name: 'Classic Executive',
    colors: {
      background: '#F4F4F2',
      text: '#495464',
      title: '#1a1a1a',
      accent: '#495464',
    },
    fonts: {
      title: 'EB Garamond, serif',
      header: 'EB Garamond, serif',
      subheader: 'EB Garamond, serif',
      body: 'EB Garamond, serif',
    },
    typography: {
      fontFamily: `var(--brand-font-body, 'EB Garamond, serif')`,
      titleSize: 48,
      textSize: 22,
      titleWeight: 'bold',
    },
    layout: {
      padding: 60,
      gap: 20,
      borderRadius: 0,
    },
  },
  dark: {
    id: 'dark',
    name: 'Midnight Pro',
    colors: {
      background: '#1a1a1a',
      text: '#BBBFCA',
      title: '#FFFFFF',
      accent: '#3b82f6',
    },
    fonts: {
      title: 'Inter, sans-serif',
      header: 'Inter, sans-serif',
      subheader: 'Inter, sans-serif',
      body: 'Inter, sans-serif',
    },
    typography: {
      fontFamily: `var(--brand-font-body, 'Inter, sans-serif')`,
      titleSize: 42,
      textSize: 18,
      titleWeight: 'bold',
    },
    layout: {
      padding: 40,
      gap: 24,
      borderRadius: 16,
    },
  },
  glass: {
    id: 'glass',
    name: 'Future Glass',
    colors: {
      background: 'rgba(255, 255, 255, 0.7)',
      text: '#495464',
      title: '#1a1a1a',
      accent: '#3b82f6',
    },
    fonts: {
      title: 'Outfit, sans-serif',
      header: 'Outfit, sans-serif',
      subheader: 'Outfit, sans-serif',
      body: 'Outfit, sans-serif',
    },
    typography: {
      fontFamily: `var(--brand-font-body, 'Outfit, sans-serif')`,
      titleSize: 42,
      textSize: 18,
      titleWeight: '900',
    },
    layout: {
      padding: 32,
      gap: 16,
      borderRadius: 24,
    },
  },
};

export const DEFAULT_BRAND = {
  colors: {
    primary: '#0D99FF',
    secondary: '#495464',
    background: '#FFFFFF',
    surface: '#F8F9FA',
    text: '#333333',
  },
  fonts: {
    title: 'Inter, sans-serif',
    header: 'Inter, sans-serif',
    subheader: 'Inter, sans-serif',
    body: 'Inter, sans-serif',
  },
  fontSizes: {
    title: 48,
    header: 32,
    subheader: 24,
    body: 18,
  },
  fontWeights: {
    title: '700',
    header: '600',
    subheader: '500',
    body: '400',
  },
};

export const DEFAULT_NODE_DATA = {
  text: {
    content: '# New Slide\nWrite your markdown here...',
  },
  image: {
    base64: '',
    name: '',
  },
  video: {
    base64: '',
    name: '',
  },
};
