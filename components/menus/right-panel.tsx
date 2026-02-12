import { ReactNode, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';

import { useMenuPalette } from '@/components/menus/menu-theme';
import { useAppTheme } from '@/components/theme/app-theme-provider';

type RightPanelProps = {
  title: string;
  children?: ReactNode;
};

export function RightPanel({ title, children }: RightPanelProps) {
  const menuPalette = useMenuPalette();
  const { mode } = useAppTheme();
  const styles = useMemo(() => createStyles(menuPalette, mode), [menuPalette, mode]);
  const hasTitle = title.trim().length > 0;

  return (
    <BlurView intensity={30} tint="default" experimentalBlurMethod="dimezisBlurView" style={styles.panel}>
      {hasTitle ? (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
        </View>
      ) : null}
      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </BlurView>
  );
}

const createStyles = (menuPalette: ReturnType<typeof useMenuPalette>, mode: 'light' | 'dark') =>
  StyleSheet.create({
  panel: {
    maxHeight: '100%',
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
    shadowOffset: { width: -12, height: 12 },
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: menuPalette.text,
  },
  body: {
    flexGrow: 0,
    maxHeight: '100%',
  },
  bodyContent: {
    flexGrow: 0,
    paddingBottom: 12,
  },
});
