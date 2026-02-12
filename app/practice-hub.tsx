import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { AppShell } from '@/components/app-shell';
import { useAppTheme } from '@/components/theme/app-theme-provider';
import { getMenusForRole, getRoleFromUser } from '@/constants/menus';

export default function PracticeHubScreen() {
  const { palette } = useAppTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const { user } = useLocalSearchParams<{ user?: string }>();
  const role = getRoleFromUser(user);
  const { menu, quick } = getMenusForRole(role);

  return (
    <AppShell
      title="Practice Hub"
      subtitle="Practice tools and assignments in one place."
      menuItems={menu}
      quickActions={quick}
      user={user}>
      <View style={styles.header}>
        <Text style={styles.overline}>STUDENTS</Text>
        <Text style={styles.pageTitle}>Practice Hub</Text>
        <Text style={styles.pageSubtitle}>Your daily practice workspace is ready.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Coming Soon</Text>
        <Text style={styles.cardBody}>
          We will add practice plans, streak tracking, and quick-start drills here.
        </Text>
      </View>
    </AppShell>
  );
}

const createStyles = (palette: ReturnType<typeof useAppTheme>['palette']) =>
  StyleSheet.create({
    header: {
      marginBottom: 14,
    },
    overline: {
      color: '#c13b3f',
      fontSize: 12,
      letterSpacing: 5,
    },
    pageTitle: {
      marginTop: 8,
      fontSize: 42,
      fontWeight: '600',
      color: palette.text,
    },
    pageSubtitle: {
      marginTop: 8,
      fontSize: 15,
      color: palette.textMuted,
    },
    card: {
      borderRadius: 16,
      backgroundColor: palette.background,
      borderWidth: 1,
      borderColor: palette.border,
      padding: 16,
      marginBottom: 28,
    },
    cardTitle: {
      fontSize: 22,
      fontWeight: '600',
      color: palette.text,
    },
    cardBody: {
      marginTop: 8,
      fontSize: 14,
      lineHeight: 22,
      color: palette.textMuted,
    },
  });
