import { ComponentProps } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { menuPalette } from '@/components/menus/menu-theme';

export type MenuItem = {
  label: string;
  route: string;
  icon: ComponentProps<typeof IconSymbol>['name'];
};

type LeftMenuPanelProps = {
  items: MenuItem[];
  onSelect: (route: string) => void;
};

export function LeftMenuPanel({ items, onSelect }: LeftMenuPanelProps) {
  return (
    <View style={styles.panel}>
      <View style={styles.header}>
        <View>
          <Text style={styles.overline}>SIMPLY MUSIC</Text>
          <Text style={styles.title}>Navigation</Text>
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: menuPalette.glass,
    borderWidth: 1,
    borderColor: menuPalette.glassBorder,
    borderRadius: 22,
    paddingTop: 18,
    paddingHorizontal: 18,
    shadowColor: '#000',
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
    color: menuPalette.muted,
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
    backgroundColor: 'rgba(255,255,255,0.42)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
    shadowColor: '#000',
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
});
