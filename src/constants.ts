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
