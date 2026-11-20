import { useColorScheme, Platform, StyleSheet } from 'react-native';

// Brand anchors from the PSPACE logo.
export const brand = {
  navy: '#001B3A',
  red: '#C8102E',
  amber: '#FFB547',
};

const light = {
  scheme: 'light',
  background: '#F2F3F7', // grouped ground
  surface: '#FFFFFF', // grouped cell
  surfacePressed: '#E9EBF0',
  fill: '#E4E7ED', // inset fills: segmented track, switch off
  segActive: '#FFFFFF',
  label: '#0B1526',
  secondaryLabel: '#555F70',
  tertiaryLabel: '#6C7585',
  separator: '#DADDE4',
  tint: '#0B3D7A', // interactive: links, header buttons, focus
  onTint: '#FFFFFF',
  primary: brand.navy, // filled primary button, icon tiles
  onPrimary: '#FFFFFF',
  tile: brand.navy,
  onTile: '#FFFFFF',
  accent: '#B76E00', // amber, darkened to hold contrast on white
  danger: '#B3122A',
  dangerFill: '#FCEBEE',
  warning: '#8A5300',
  warningFill: '#FFF4E0',
  positive: '#1E7A46',
  diagramGround: '#F5F7FA',
  runway: '#3A4352',
  onRunway: '#FFFFFF',
};

const dark = {
  scheme: 'dark',
  background: '#000000',
  surface: '#14181F',
  surfacePressed: '#1F2530',
  fill: '#1F2530',
  segActive: '#3A4252',
  label: '#F3F5F8',
  secondaryLabel: '#A3ACBA',
  tertiaryLabel: '#858E9E',
  separator: '#2A303B',
  tint: brand.amber,
  onTint: brand.navy,
  primary: brand.amber,
  onPrimary: brand.navy,
  tile: '#1D3A63',
  onTile: '#FFFFFF',
  accent: brand.amber,
  danger: '#FF6B7D',
  dangerFill: '#3A1219',
  warning: '#FFC56E',
  warningFill: '#352509',
  positive: '#5BD38D',
  diagramGround: '#0C1016',
  runway: '#566173',
  onRunway: '#FFFFFF',
};

export function useTheme() {
  const scheme = useColorScheme();
  return scheme === 'dark' ? dark : light;
}

// Type scale mapped to iOS text styles / Material roles. System faces only.
export const type = {
  largeTitle: { fontSize: 34, lineHeight: 41, fontWeight: '700', letterSpacing: Platform.OS === 'ios' ? 0.37 : 0 },
  title2: { fontSize: 22, lineHeight: 28, fontWeight: '700' },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: '600' },
  body: { fontSize: 17, lineHeight: 22 },
  callout: { fontSize: 16, lineHeight: 21 },
  subhead: { fontSize: 15, lineHeight: 20 },
  footnote: { fontSize: 13, lineHeight: 18 },
  caption: { fontSize: 12, lineHeight: 16 },
  answer: { fontSize: 48, lineHeight: 54, fontWeight: '700', letterSpacing: -0.5 },
  figure: { fontSize: 22, lineHeight: 28, fontWeight: '600' },
};

export const tabular = { fontVariant: ['tabular-nums'] };

export const space = { xs: 4, s: 8, m: 12, l: 16, xl: 24, xxl: 32 };

export const radius = { cell: 12, tile: 8, control: 10 };

export const hairline = StyleSheet.hairlineWidth;

export const monoFamily = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });
