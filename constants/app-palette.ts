export type ThemeMode = 'light' | 'dark';

export type AppPalette = {
  text: string;
  textMuted: string;
  background: string;
  surface: string;
  surfaceSoft: string;
  border: string;
  borderStrong: string;
  shadow: string;
  primary: string;
  primaryPressed: string;
  danger: string;
  overlay: string;
  menuGlass: string;
  menuGlassBorder: string;
  menuItemBackground: string;
  menuItemBorder: string;
};

export const appPalettes: Record<ThemeMode, AppPalette> = {
  light: {
    text: '#2a2a2a',
    textMuted: '#74777d',
    background: '#fcfcfd',
    surface: '#ffffff',
    surfaceSoft: '#f6f7f9',
    border: '#e3e5ea',
    borderStrong: '#d2d6dd',
    shadow: '#000000',
    primary: '#c8102e',
    primaryPressed: '#a40d25',
    danger: '#b8322d',
    overlay: 'rgba(16, 16, 16, 0.35)',
    menuGlass: '#ffffff',
    menuGlassBorder: '#d8dde6',
    menuItemBackground: '#ffffff',
    menuItemBorder: '#bcc5d3',
  },
  dark: {
    text: '#ececec',
    textMuted: '#aaa39b',
    background: '#171514',
    surface: '#24201e',
    surfaceSoft: '#2d2825',
    border: '#3c3632',
    borderStrong: '#4b433d',
    shadow: '#000000',
    primary: '#e14a62',
    primaryPressed: '#c53b53',
    danger: '#ff6b67',
    overlay: 'rgba(0, 0, 0, 0.55)',
    menuGlass: 'rgba(45, 40, 36, 0.94)',
    menuGlassBorder: 'rgba(98, 87, 79, 0.6)',
    menuItemBackground: 'rgba(58, 51, 46, 0.82)',
    menuItemBorder: 'rgba(90, 80, 72, 0.65)',
  },
};
