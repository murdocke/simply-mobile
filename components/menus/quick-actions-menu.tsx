import { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { menuPalette } from '@/components/menus/menu-theme';

export type QuickActionItem = {
  label: string;
  icon: ComponentProps<typeof IconSymbol>['name'];
};

type QuickActionsMenuProps = {
  actions: QuickActionItem[];
};

export function QuickActionsMenu({ actions }: QuickActionsMenuProps) {
  return (
    <View style={styles.menu}>
      {actions.map((item) => (
        <Pressable key={item.label} style={styles.item}>
          <View style={styles.itemRow}>
            <IconSymbol name={item.icon} size={18} color={menuPalette.text} />
            <Text style={styles.itemText}>{item.label}</Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  menu: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: menuPalette.glass,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: menuPalette.glassBorder,
    shadowColor: '#000',
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
    color: menuPalette.text,
    fontWeight: '500',
  },
});
