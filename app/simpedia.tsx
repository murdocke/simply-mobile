import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { AppShell } from '@/components/app-shell';
import { getMenusForRole, getRoleFromUser } from '@/constants/menus';

export default function SimpediaScreen() {
  const { user } = useLocalSearchParams<{ user?: string }>();
  const role = getRoleFromUser(user);
  const { menu, quick } = getMenusForRole(role);

  return (
    <AppShell
      title="Simpedia"
      subtitle="Quick answers and support resources."
      menuItems={menu}
      quickActions={quick}
      user={user}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Simpedia</Text>
        <Text style={styles.cardBody}>Guides and FAQs will live here.</Text>
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2a2a2a',
  },
  cardBody: {
    marginTop: 8,
    fontSize: 14,
    color: '#6f6a66',
  },
});
