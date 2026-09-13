export type SiteThemeName = 'midnight' | 'emerald' | 'gold' | 'sunset' | 'graphite' | 'custom';

export interface SiteThemePreset {
  label: string;
  description: string;
  headerColor: string;
  footerColor: string;
  bodyColor: string;
  surfaceColor: string;
  mutedColor: string;
  flashStart: string;
  flashMid: string;
  flashEnd: string;
  heroTheme: 'midnight' | 'gold' | 'emerald' | 'sunset' | 'dark';
}

export const SITE_THEME_PRESETS: Record<Exclude<SiteThemeName, 'custom'>, SiteThemePreset> = {
  midnight: {
    label: 'Midnight',
    description: 'Le style actuel, premium et contrasté.',
    headerColor: '#ffffff',
    footerColor: '#020617',
    bodyColor: '#f1f5f9',
    surfaceColor: '#ffffff',
    mutedColor: '#f8fafc',
    flashStart: '#020617',
    flashMid: '#0f172a',
    flashEnd: '#312e81',
    heroTheme: 'midnight',
  },
  emerald: {
    label: 'Émeraude',
    description: 'Frais, rassurant et orienté confiance.',
    headerColor: '#f0fdf4',
    footerColor: '#022c22',
    bodyColor: '#ecfdf5',
    surfaceColor: '#ffffff',
    mutedColor: '#f0fdf4',
    flashStart: '#022c22',
    flashMid: '#064e3b',
    flashEnd: '#115e59',
    heroTheme: 'emerald',
  },
  gold: {
    label: 'Prestige Or',
    description: 'Chaleureux, luxe et adapté aux offres premium.',
    headerColor: '#fffbeb',
    footerColor: '#1c1917',
    bodyColor: '#fffbeb',
    surfaceColor: '#ffffff',
    mutedColor: '#fef3c7',
    flashStart: '#1c1917',
    flashMid: '#451a03',
    flashEnd: '#78350f',
    heroTheme: 'gold',
  },
  sunset: {
    label: 'Sunset',
    description: 'Énergique et accrocheur pour les promotions.',
    headerColor: '#fff7ed',
    footerColor: '#431407',
    bodyColor: '#fff7ed',
    surfaceColor: '#ffffff',
    mutedColor: '#ffedd5',
    flashStart: '#431407',
    flashMid: '#7c2d12',
    flashEnd: '#9f1239',
    heroTheme: 'sunset',
  },
  graphite: {
    label: 'Graphite',
    description: 'Sobre, moderne et très lisible.',
    headerColor: '#e2e8f0',
    footerColor: '#0f172a',
    bodyColor: '#f8fafc',
    surfaceColor: '#ffffff',
    mutedColor: '#e2e8f0',
    flashStart: '#0f172a',
    flashMid: '#1e293b',
    flashEnd: '#334155',
    heroTheme: 'dark',
  },
};

export const DEFAULT_SITE_THEME: SiteThemeName = 'midnight';

export function normalizeHexColor(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback;
  const normalized = value.trim();
  return /^#[0-9a-fA-F]{6}$/.test(normalized) ? normalized : fallback;
}

export function getSiteThemePreset(theme: unknown): SiteThemePreset {
  if (typeof theme === 'string' && theme !== 'custom' && theme in SITE_THEME_PRESETS) {
    return SITE_THEME_PRESETS[theme as Exclude<SiteThemeName, 'custom'>];
  }
  return SITE_THEME_PRESETS.midnight;
}
