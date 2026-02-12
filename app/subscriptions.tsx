import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { AppShell } from '@/components/app-shell';
import { useAppTheme } from '@/components/theme/app-theme-provider';
import { getMenusForRole, getRoleFromUser } from '@/constants/menus';

type TeacherSubscription = {
  id: string;
  teacher: string;
  region: string;
  students: number;
  plan: 'Core' | 'Studio Pro' | 'Enterprise';
};

const teacherSubscriptions: TeacherSubscription[] = [
  { id: 't-1', teacher: 'Ava Chen', region: 'Sacramento', students: 34, plan: 'Studio Pro' },
  { id: 't-2', teacher: 'Liam Rivera', region: 'Seattle', students: 31, plan: 'Studio Pro' },
  { id: 't-3', teacher: 'Mia Patel', region: 'Melbourne', students: 29, plan: 'Enterprise' },
  { id: 't-4', teacher: 'Noah Brooks', region: 'Dallas', students: 27, plan: 'Core' },
  { id: 't-5', teacher: 'Emma Scott', region: 'Phoenix', students: 26, plan: 'Studio Pro' },
  { id: 't-6', teacher: 'Lucas Wright', region: 'Chicago', students: 24, plan: 'Core' },
  { id: 't-7', teacher: 'Olivia Adams', region: 'Nashville', students: 22, plan: 'Studio Pro' },
  { id: 't-8', teacher: 'Ethan Young', region: 'Atlanta', students: 20, plan: 'Core' },
  { id: 't-9', teacher: 'Sophia Hall', region: 'San Diego', students: 18, plan: 'Core' },
  { id: 't-10', teacher: 'Mason King', region: 'Denver', students: 16, plan: 'Core' },
  { id: 't-11', teacher: 'Isabella Ward', region: 'Portland', students: 14, plan: 'Core' },
  { id: 't-12', teacher: 'James Turner', region: 'Brisbane', students: 11, plan: 'Core' },
];

export default function SubscriptionsScreen() {
  const { palette } = useAppTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const { width } = useWindowDimensions();
  const isPhone = width < 760;
  const { user } = useLocalSearchParams<{ user?: string }>();
  const role = getRoleFromUser(user);
  const { menu, quick } = getMenusForRole(role);
  const teacherCount = teacherSubscriptions.length;
  const totalStudents = teacherSubscriptions.reduce((sum, row) => sum + row.students, 0);
  const avgStudents = Math.round(totalStudents / teacherCount);
  const highest = teacherSubscriptions[0];
  const lowest = teacherSubscriptions[teacherSubscriptions.length - 1];

  return (
    <AppShell
      title="Subscriptions"
      subtitle="Subscription metrics and billing controls."
      menuItems={menu}
      quickActions={quick}
      user={user}>
      <View style={styles.pageHeader}>
        <Text style={styles.overline}>COMPANY</Text>
        <Text style={styles.pageTitle}>Subscriptions</Text>
        <Text style={styles.pageSubtitle}>Teacher subscription roster and active student load.</Text>
      </View>

      <View style={[styles.statsGrid, isPhone && styles.statsGridPhone]}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>TEACHER ACCOUNTS</Text>
          <Text style={styles.statValue}>{teacherCount}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>ACTIVE STUDENTS</Text>
          <Text style={styles.statValue}>{totalStudents}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>AVG PER TEACHER</Text>
          <Text style={styles.statValue}>{avgStudents}</Text>
        </View>
      </View>

      <View style={styles.listCard}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Teacher Accounts</Text>
          <Text style={styles.listMeta}>Range {lowest.students}-{highest.students} students</Text>
        </View>

        <ScrollView contentContainerStyle={styles.rows}>
          {teacherSubscriptions.map((row) => (
            <View key={row.id} style={styles.rowCard}>
              <View style={styles.rowPrimary}>
                <Text style={styles.teacherName}>{row.teacher}</Text>
                <Text style={styles.teacherMeta}>
                  {row.region} • {row.plan}
                </Text>
              </View>
              <View style={styles.countPill}>
                <Text style={styles.countPillLabel}>STUDENTS</Text>
                <Text style={styles.countPillValue}>{row.students}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.footerRow}>
          <Pressable style={styles.footerAction}>
            <Text style={styles.footerActionText}>EXPORT SUBSCRIPTIONS</Text>
          </Pressable>
          <Pressable style={styles.footerAction}>
            <Text style={styles.footerActionText}>VIEW BILLING DETAIL</Text>
          </Pressable>
        </View>
      </View>
    </AppShell>
  );
}

const createStyles = (palette: ReturnType<typeof useAppTheme>['palette']) =>
  StyleSheet.create({
    pageHeader: {
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
    statsGrid: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 12,
    },
    statsGridPhone: {
      flexDirection: 'column',
    },
    statCard: {
      flex: 1,
      backgroundColor: palette.surface,
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
      borderColor: palette.border,
    },
    statLabel: {
      color: palette.textMuted,
      fontSize: 10,
      letterSpacing: 2.1,
    },
    statValue: {
      marginTop: 8,
      color: palette.text,
      fontSize: 30,
      fontWeight: '600',
    },
    listCard: {
      backgroundColor: palette.surface,
      borderRadius: 18,
      padding: 14,
      borderWidth: 1,
      borderColor: palette.border,
      marginBottom: 28,
    },
    listHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 8,
      marginBottom: 10,
      flexWrap: 'wrap',
    },
    listTitle: {
      fontSize: 26,
      fontWeight: '600',
      color: palette.text,
    },
    listMeta: {
      color: palette.textMuted,
      fontSize: 12,
      letterSpacing: 1.3,
    },
    rows: {
      gap: 10,
    },
    rowCard: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.surfaceSoft,
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
    },
    rowPrimary: {
      flex: 1,
    },
    teacherName: {
      color: palette.text,
      fontSize: 18,
      fontWeight: '600',
    },
    teacherMeta: {
      marginTop: 4,
      color: palette.textMuted,
      fontSize: 13,
    },
    countPill: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: palette.borderStrong,
      backgroundColor: palette.surface,
      paddingHorizontal: 10,
      paddingVertical: 8,
      minWidth: 88,
      alignItems: 'center',
    },
    countPillLabel: {
      color: palette.textMuted,
      fontSize: 9,
      letterSpacing: 1.6,
    },
    countPillValue: {
      marginTop: 3,
      color: palette.text,
      fontSize: 20,
      fontWeight: '700',
    },
    footerRow: {
      marginTop: 12,
      flexDirection: 'row',
      gap: 8,
      flexWrap: 'wrap',
    },
    footerAction: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: palette.borderStrong,
      backgroundColor: palette.surface,
      paddingHorizontal: 14,
      paddingVertical: 9,
    },
    footerActionText: {
      color: palette.textMuted,
      fontSize: 11,
      letterSpacing: 2,
    },
  });
