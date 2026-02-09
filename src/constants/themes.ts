export type ThemeId = 'retro-amber' | 'retro-crt' | 'retro-silver' | 'retro-rose' | 'retro-ocean';

export const THEMES: { id: ThemeId; name: string }[] = [
  { id: 'retro-amber', name: 'Amber' },
  { id: 'retro-crt', name: 'CRT Green' },
  { id: 'retro-silver', name: 'Silver' },
  { id: 'retro-rose', name: 'Rose' },
  { id: 'retro-ocean', name: 'Ocean' },
];

export const DEFAULT_THEME: ThemeId = 'retro-amber';
