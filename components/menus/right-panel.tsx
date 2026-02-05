import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { menuPalette } from '@/components/menus/menu-theme';

type RightPanelProps = {
  title: string;
  children?: ReactNode;
};

export function RightPanel({ title, children }: RightPanelProps) {
  return (
    <View style={styles.panel}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    backgroundColor: menuPalette.glass,
    borderWidth: 1,
    borderColor: menuPalette.glassBorder,
    borderRadius: 22,
    paddingTop: 18,
    paddingHorizontal: 18,
    shadowColor: '#000',
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
    flex: 1,
  },
});
