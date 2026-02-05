import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';

import { AppShell } from '@/components/app-shell';
import { getMenusForRole, getRoleFromUser } from '@/constants/menus';

const accountLabels: Record<string, string> = {
  neil: 'Company account',
  brian: 'Teacher account',
  quinn: 'Student account',
};

export default function DashboardScreen() {
  const { user } = useLocalSearchParams<{ user?: string }>();
  const accountLabel = user ? accountLabels[user.toLowerCase()] : undefined;
  const role = getRoleFromUser(user);
  const { menu, quick } = getMenusForRole(role);

  return (
    <AppShell
      title="Dashboard"
      subtitle={accountLabel ? `Signed in as ${user} (${accountLabel}).` : undefined}
      menuItems={menu}
      quickActions={quick}
      user={user}>
      <View style={styles.heroCard}>
        <Image
          source={{
            uri: 'https://simplymusic.com/wp-content/uploads/2024/02/Teach_Simply_Music.png',
          }}
          style={styles.heroImage}
          contentFit="cover"
          contentPosition="center"
        />
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Welcome back</Text>
        <Text style={styles.cardBody}>This is your dashboard space.</Text>
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
  },
  heroImage: {
    width: '100%',
    height: 190,
    transform: [{ scale: 1.08 }],
  },
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
