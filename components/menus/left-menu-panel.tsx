import { ComponentProps, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';

import { useAppTheme } from '@/components/theme/app-theme-provider';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useMenuPalette } from '@/components/menus/menu-theme';

export type MenuItem = {
  label: string;
  route: string;
  icon: ComponentProps<typeof IconSymbol>['name'];
};

type LeftMenuPanelProps = {
  items: MenuItem[];
  onSelect: (route: string) => void;
  onLogout: () => void;
};

export function LeftMenuPanel({ items, onSelect, onLogout }: LeftMenuPanelProps) {
  const { mode, setMode } = useAppTheme();
  const menuPalette = useMenuPalette();
  const styles = useMemo(() => createStyles(menuPalette, mode), [menuPalette, mode]);

  return (
    <BlurView intensity={30} tint="default" experimentalBlurMethod="dimezisBlurView" style={styles.panel}>
      <View style={styles.header}>
        <View>
          <Text style={styles.overline}>SIMPLY MUSIC</Text>
          <Text style={styles.title}>Welcome Back</Text>
        </View>
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
        <View style={styles.themeWrap}>
          <Text style={styles.themeLabel}>Theme</Text>
          <View style={styles.themeRow}>
            <Pressable
              style={[styles.themeBtn, mode === 'light' && styles.themeBtnActive]}
              onPress={() => setMode('light')}>
              <Text style={[styles.themeBtnText, mode === 'light' && styles.themeBtnTextActive]}>
                Light
              </Text>
            </Pressable>
            <Pressable
              style={[styles.themeBtn, mode === 'dark' && styles.themeBtnActive]}
              onPress={() => setMode('dark')}>
              <Text style={[styles.themeBtnText, mode === 'dark' && styles.themeBtnTextActive]}>
                Dark
              </Text>
            </Pressable>
          </View>
        </View>
        <Pressable style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
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
  themeWrap: {
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: menuPalette.glassBorder,
    backgroundColor: menuPalette.itemBackground,
    padding: 10,
  },
  themeLabel: {
    color: menuPalette.text,
    fontSize: 11,
    letterSpacing: 1.2,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  themeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  themeBtn: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: menuPalette.glassBorder,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.3)',
  },
  themeBtnActive: {
    backgroundColor: menuPalette.primary,
    borderColor: menuPalette.primary,
  },
  themeBtnText: {
    color: menuPalette.text,
    fontSize: 13,
    fontWeight: '600',
  },
  themeBtnTextActive: {
    color: '#fff',
  },
  logoutButton: {
    marginTop: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: menuPalette.glassBorder,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: menuPalette.itemBackground,
  },
  logoutText: {
    color: menuPalette.text,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
