import { useMemo } from 'react';

import { useAppTheme } from '@/components/theme/app-theme-provider';

export function useMenuPalette() {
  const { palette } = useAppTheme();

  return useMemo(
    () => ({
      background: palette.background,
      glass: palette.menuGlass,
      glassBorder: palette.menuGlassBorder,
      itemBackground: palette.menuItemBackground,
      itemBorder: palette.menuItemBorder,
      text: palette.text,
      muted: palette.textMuted,
      primary: palette.primary,
      overlay: palette.overlay,
      shadow: palette.shadow,
    }),
    [palette]
  );
}
