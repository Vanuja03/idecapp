import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const palette = {
  navy: '#0F3D6E',
  navyDark: '#0A2A4D',
  steel: '#1F4E79',
  accent: '#C45C26',
  surface: '#F4F6F9',
  card: '#FFFFFF',
  text: '#12263A',
  muted: '#5B6B7C',
  border: '#D7DEE7',
  warning: '#C98900',
  warningBg: '#FFF4D6',
  success: '#1F7A4D',
  successBg: '#E4F6EC',
  error: '#B42318',
  errorBg: '#FDECEC',
  info: '#175CD3',
  infoBg: '#E8F1FC',
};

export const Colors = {
  light: {
    text: palette.text,
    background: palette.surface,
    tint: palette.navy,
    icon: palette.muted,
    tabIconDefault: palette.muted,
    tabIconSelected: palette.navy,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: '#fff',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#fff',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
};

export const paperLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: palette.navy,
    secondary: palette.accent,
    background: palette.surface,
    surface: palette.card,
    onSurface: palette.text,
    error: palette.error,
  },
};

export const paperDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#8BB8E8',
    secondary: '#E08A55',
  },
};

export const statusTokens = {
  PENDING: { label: 'Pending', color: palette.warning, background: palette.warningBg },
  COMPLETED: { label: 'Completed', color: palette.success, background: palette.successBg },
  CANCELED: { label: 'Canceled', color: palette.error, background: palette.errorBg },
} as const;

export const dayStatusTokens = {
  OPEN: { label: 'OPEN', color: palette.info, background: palette.infoBg },
  FINALIZED: { label: 'FINALIZED', color: palette.muted, background: '#EEF1F4' },
} as const;
