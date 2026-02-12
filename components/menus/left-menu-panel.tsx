import { ComponentProps, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useMenuPalette } from '@/components/menus/menu-theme';
import { MenuControlsCard } from '@/components/menus/menu-controls-card';
import { useAppTheme } from '@/components/theme/app-theme-provider';

export type MenuItem = {
  label: string;
  route: string;
  icon: ComponentProps<typeof IconSymbol>['name'];
};

type LeftMenuPanelProps = {
  items: MenuItem[];
  onSelect: (route: string) => void;
  onLogout: () => void;
  user?: string;
};

const accountDisplayNames: Record<string, string> = {
  brian: 'Brian G.',
  quinn: 'Quinn F.',
  neil: 'Neil M.',
  admin: 'Neil M.',
};

export function LeftMenuPanel({ items, onSelect, onLogout, user }: LeftMenuPanelProps) {
  const { mode } = useAppTheme();
  const menuPalette = useMenuPalette();
  const styles = useMemo(() => createStyles(menuPalette, mode), [menuPalette, mode]);
  const headerTitle =
    (user ? accountDisplayNames[user.toLowerCase()] : undefined) ?? 'Welcome Back';

  return (
    <BlurView intensity={30} tint="default" experimentalBlurMethod="dimezisBlurView" style={styles.panel}>
      <View style={styles.header}>
        <View>
          <Text style={styles.overline}>SIMPLY MUSIC</Text>
          <Text style={styles.title}>{headerTitle}</Text>
        </View>
        <Pressable style={styles.signOutButton} onPress={onLogout}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </View>
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}>
        {items.map((item) => (
          <Pressable
            key={item.label}
            style={styles.item}
            onPress={() => onSelect(item.route)}>
            <View style={styles.itemRow}>
              <IconSymbol name={item.icon} size={18} color={menuPalette.text} />
              <Text style={styles.itemText}>{item.label}</Text>
            </View>
          </Pressable>
        ))}
        <MenuControlsCard onOpenMetronome={() => onSelect('/metronome')} />
      </ScrollView>
    </BlurView>
  );
}

const createStyles = (menuPalette: ReturnType<typeof useMenuPalette>, mode: 'light' | 'dark') =>
  StyleSheet.create({
  panel: {
    backgroundColor: mode === 'light' ? 'rgba(236, 240, 246, 0.72)' : 'transparent',
    borderWidth: 1,
    borderColor: menuPalette.glassBorder,
    borderRadius: 22,
    overflow: 'hidden',
    paddingTop: 18,
    paddingHorizontal: 18,
    shadowColor: menuPalette.shadow,
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 12, height: 12 },
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 10,
  },
  overline: {
    fontSize: 10,
    letterSpacing: 2.5,
    color: menuPalette.primary,
    fontWeight: '600',
  },
  title: {
    fontSize: 19,
    fontWeight: '600',
    color: menuPalette.text,
    marginTop: 4,
  },
  list: {
    marginBottom: 12,
  },
  listContent: {
    gap: 6,
    paddingBottom: 8,
  },
  item: {
    borderRadius: 14,
    backgroundColor: menuPalette.itemBackground,
    borderWidth: 1,
    borderColor: menuPalette.itemBorder,
    shadowColor: menuPalette.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
  },
  itemRow: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  itemText: {
    fontSize: 16,
    color: menuPalette.text,
    fontWeight: '500',
  },
  signOutButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: menuPalette.glassBorder,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    backgroundColor: menuPalette.itemBackground,
  },
  signOutText: {
    color: menuPalette.text,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
