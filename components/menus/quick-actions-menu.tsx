import { ComponentProps, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useMenuPalette } from '@/components/menus/menu-theme';
import { useAppTheme } from '@/components/theme/app-theme-provider';

export type QuickActionItem = {
  label: string;
  icon: ComponentProps<typeof IconSymbol>['name'];
};

type QuickActionsMenuProps = {
  actions: QuickActionItem[];
};

export function QuickActionsMenu({ actions }: QuickActionsMenuProps) {
  const menuPalette = useMenuPalette();
  const { mode } = useAppTheme();
  const styles = useMemo(() => createStyles(menuPalette, mode), [menuPalette, mode]);

  return (
    <BlurView
      intensity={mode === 'light' ? 22 : 30}
      tint="default"
      experimentalBlurMethod="dimezisBlurView"
      style={styles.menu}>
      {actions.map((item) => (
        <Pressable key={item.label} style={styles.item}>
          <View style={styles.itemRow}>
            <IconSymbol name={item.icon} size={18} color={mode === 'light' ? '#111111' : menuPalette.text} />
            <Text style={styles.itemText}>{item.label}</Text>
          </View>
        </Pressable>
      ))}
    </BlurView>
  );
}

const createStyles = (menuPalette: ReturnType<typeof useMenuPalette>, mode: 'light' | 'dark') =>
  StyleSheet.create({
  menu: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: mode === 'light' ? 'rgba(236, 240, 246, 0.72)' : 'transparent',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: menuPalette.glassBorder,
    shadowColor: menuPalette.shadow,
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  item: {
    paddingVertical: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  itemText: {
    fontSize: 15,
    color: mode === 'light' ? '#111111' : menuPalette.text,
    fontWeight: '500',
  },
});
