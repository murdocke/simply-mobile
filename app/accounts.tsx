import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { AppShell } from '@/components/app-shell';
import { useAppTheme } from '@/components/theme/app-theme-provider';
import { getMenusForRole, getRoleFromUser } from '@/constants/menus';

type TeacherAccount = {
  id: string;
  name: string;
  email: string;
  city: string;
  students: number;
  status: 'Active' | 'Pending';
};

const PAGE_SIZE = 15;

const teacherAccounts: TeacherAccount[] = [
  { id: 'a1', name: 'Ava Chen', email: 'ava.chen@studio.com', city: 'Sacramento', students: 26, status: 'Active' },
  { id: 'a2', name: 'Liam Rivera', email: 'liam.rivera@studio.com', city: 'Seattle', students: 24, status: 'Active' },
  { id: 'a3', name: 'Mia Patel', email: 'mia.patel@studio.com', city: 'Melbourne', students: 30, status: 'Active' },
  { id: 'a4', name: 'Noah Brooks', email: 'noah.brooks@studio.com', city: 'Dallas', students: 22, status: 'Active' },
  { id: 'a5', name: 'Emma Scott', email: 'emma.scott@studio.com', city: 'Phoenix', students: 19, status: 'Active' },
  { id: 'a6', name: 'Lucas Wright', email: 'lucas.wright@studio.com', city: 'Chicago', students: 18, status: 'Active' },
  { id: 'a7', name: 'Olivia Adams', email: 'olivia.adams@studio.com', city: 'Nashville', students: 16, status: 'Active' },
  { id: 'a8', name: 'Ethan Young', email: 'ethan.young@studio.com', city: 'Atlanta', students: 14, status: 'Active' },
  { id: 'a9', name: 'Sophia Hall', email: 'sophia.hall@studio.com', city: 'San Diego', students: 17, status: 'Active' },
  { id: 'a10', name: 'Mason King', email: 'mason.king@studio.com', city: 'Denver', students: 20, status: 'Active' },
  { id: 'a11', name: 'Isabella Ward', email: 'isabella.ward@studio.com', city: 'Portland', students: 12, status: 'Pending' },
  { id: 'a12', name: 'James Turner', email: 'james.turner@studio.com', city: 'Brisbane', students: 11, status: 'Active' },
  { id: 'a13', name: 'Amelia Foster', email: 'amelia.foster@studio.com', city: 'Miami', students: 25, status: 'Active' },
  { id: 'a14', name: 'Benjamin Cole', email: 'ben.cole@studio.com', city: 'Charlotte', students: 15, status: 'Active' },
  { id: 'a15', name: 'Harper Lane', email: 'harper.lane@studio.com', city: 'Austin', students: 21, status: 'Active' },
  { id: 'a16', name: 'Elijah Price', email: 'elijah.price@studio.com', city: 'San Jose', students: 18, status: 'Active' },
  { id: 'a17', name: 'Evelyn Ross', email: 'evelyn.ross@studio.com', city: 'Orlando', students: 13, status: 'Pending' },
  { id: 'a18', name: 'Henry Diaz', email: 'henry.diaz@studio.com', city: 'Tampa', students: 14, status: 'Active' },
  { id: 'a19', name: 'Abigail Reed', email: 'abigail.reed@studio.com', city: 'Minneapolis', students: 19, status: 'Active' },
  { id: 'a20', name: 'Alexander Gray', email: 'alex.gray@studio.com', city: 'Salt Lake City', students: 23, status: 'Active' },
  { id: 'a21', name: 'Ella Hayes', email: 'ella.hayes@studio.com', city: 'Boise', students: 17, status: 'Active' },
  { id: 'a22', name: 'Michael Bell', email: 'michael.bell@studio.com', city: 'Reno', students: 12, status: 'Pending' },
  { id: 'a23', name: 'Scarlett Pierce', email: 'scarlett.pierce@studio.com', city: 'Memphis', students: 20, status: 'Active' },
  { id: 'a24', name: 'Daniel Kelly', email: 'daniel.kelly@studio.com', city: 'Cincinnati', students: 16, status: 'Active' },
  { id: 'a25', name: 'Chloe Bennett', email: 'chloe.bennett@studio.com', city: 'Kansas City', students: 18, status: 'Active' },
  { id: 'a26', name: 'Matthew Collins', email: 'matt.collins@studio.com', city: 'St. Louis', students: 22, status: 'Active' },
  { id: 'a27', name: 'Grace Cooper', email: 'grace.cooper@studio.com', city: 'Omaha', students: 13, status: 'Pending' },
  { id: 'a28', name: 'Joseph Murphy', email: 'joseph.murphy@studio.com', city: 'Indianapolis', students: 15, status: 'Active' },
  { id: 'a29', name: 'Lily Sanders', email: 'lily.sanders@studio.com', city: 'New Orleans', students: 11, status: 'Active' },
  { id: 'a30', name: 'David Hughes', email: 'david.hughes@studio.com', city: 'Columbus', students: 24, status: 'Active' },
];

export default function AccountsScreen() {
  const { palette } = useAppTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const { width } = useWindowDimensions();
  const isPhone = width < 760;
  const { user } = useLocalSearchParams<{ user?: string }>();
  const role = getRoleFromUser(user);
  const { menu, quick } = getMenusForRole(role);
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(teacherAccounts.length / PAGE_SIZE);
  const pageStart = (page - 1) * PAGE_SIZE;
  const pageRows = teacherAccounts.slice(pageStart, pageStart + PAGE_SIZE);
  const activeCount = teacherAccounts.filter((row) => row.status === 'Active').length;

  return (
    <AppShell
      title="Accounts"
      subtitle="Manage teacher and student account access."
      menuItems={menu}
      quickActions={quick}
      user={user}>
      <View style={styles.pageHeader}>
        <Text style={styles.overline}>COMPANY</Text>
        <Text style={styles.pageTitle}>Accounts</Text>
        <Text style={styles.pageSubtitle}>Teacher account directory and account status.</Text>
      </View>

      <View style={[styles.statsGrid, isPhone && styles.statsGridPhone]}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>TOTAL TEACHERS</Text>
          <Text style={styles.statValue}>{teacherAccounts.length}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>ACTIVE</Text>
          <Text style={styles.statValue}>{activeCount}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>PAGE</Text>
          <Text style={styles.statValueSmall}>
            {page} / {totalPages}
          </Text>
        </View>
      </View>

      <View style={styles.listCard}>
        <View style={styles.listHead}>
          <Text style={styles.listTitle}>Teacher Accounts</Text>
          <Text style={styles.listMeta}>
            Showing {pageStart + 1}-{Math.min(pageStart + PAGE_SIZE, teacherAccounts.length)}
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.rows}>
          {pageRows.map((row) => (
            <View key={row.id} style={styles.rowCard}>
              <View style={styles.rowMain}>
                <Text style={styles.rowName}>{row.name}</Text>
                <Text style={styles.rowMeta}>{row.email}</Text>
                <Text style={styles.rowMetaSecondary}>{row.city}</Text>
              </View>
              <View style={styles.rowRight}>
                <View
                  style={[styles.statusPill, row.status === 'Active' ? styles.statusPillActive : styles.statusPillPending]}>
                  <Text
                    style={[
                      styles.statusPillText,
                      row.status === 'Active' ? styles.statusPillTextActive : styles.statusPillTextPending,
                    ]}>
                    {row.status}
                  </Text>
                </View>
                <Text style={styles.studentCountText}>{row.students} Students</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.paginationRow}>
          <Pressable
            style={[styles.pageButton, page === 1 && styles.pageButtonDisabled]}
            onPress={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page === 1}>
            <Text style={styles.pageButtonText}>PREV</Text>
          </Pressable>
          <Pressable
            style={[styles.pageButton, page === totalPages && styles.pageButtonDisabled]}
            onPress={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={page === totalPages}>
            <Text style={styles.pageButtonText}>NEXT</Text>
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
    statValueSmall: {
      marginTop: 8,
      color: palette.text,
      fontSize: 24,
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
    listHead: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap',
      marginBottom: 10,
    },
    listTitle: {
      color: palette.text,
      fontSize: 26,
      fontWeight: '600',
    },
    listMeta: {
      color: palette.textMuted,
      fontSize: 12,
      letterSpacing: 1.4,
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
      justifyContent: 'space-between',
      gap: 10,
    },
    rowMain: {
      flex: 1,
    },
    rowName: {
      color: palette.text,
      fontSize: 18,
      fontWeight: '600',
    },
    rowMeta: {
      marginTop: 4,
      color: palette.textMuted,
      fontSize: 13,
    },
    rowMetaSecondary: {
      marginTop: 2,
      color: palette.textMuted,
      fontSize: 12,
      letterSpacing: 0.4,
    },
    rowRight: {
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 8,
      minWidth: 102,
    },
    statusPill: {
      borderRadius: 999,
      borderWidth: 1,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    statusPillActive: {
      borderColor: '#77b084',
      backgroundColor: '#e5f4e9',
    },
    statusPillPending: {
      borderColor: '#d1b271',
      backgroundColor: '#f8f0dc',
    },
    statusPillText: {
      fontSize: 10,
      letterSpacing: 1.8,
      textTransform: 'uppercase',
      fontWeight: '700',
    },
    statusPillTextActive: {
      color: '#2f6a3b',
    },
    statusPillTextPending: {
      color: '#7f6328',
    },
    studentCountText: {
      color: palette.text,
      fontSize: 13,
      fontWeight: '600',
    },
    paginationRow: {
      marginTop: 12,
      flexDirection: 'row',
      gap: 8,
    },
    pageButton: {
      flex: 1,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: palette.borderStrong,
      backgroundColor: palette.surface,
      alignItems: 'center',
      paddingVertical: 9,
    },
    pageButtonDisabled: {
      opacity: 0.4,
    },
    pageButtonText: {
      color: palette.textMuted,
      fontSize: 11,
      letterSpacing: 2.1,
      fontWeight: '700',
    },
  });
