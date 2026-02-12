import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { AppShell } from '@/components/app-shell';
import { useAppTheme } from '@/components/theme/app-theme-provider';
import { getMenusForRole, getRoleFromUser } from '@/constants/menus';

const studentRows = [
  { name: 'Addy', added: 'Added 2/5/2026', email: 'addy.austin@gmail.com', fee: '$160 Per Mo', level: 'Level 2' },
  { name: 'Adri', added: 'Added 2/5/2026', email: 'adri@gmail.com', fee: '$160 Per Mo', level: 'Level 3' },
  { name: 'Ames', added: 'Added 2/6/2026', email: 'apenn81@yahoo.com', fee: '$150 Per Mo', level: 'Level 2' },
  { name: 'Axel', added: 'Added 2/6/2026', email: 'joybeth.martinez@gmail.com', fee: '$320 Per Mo', level: 'Level 2' },
  { name: 'Ayaan', added: 'Added 2/6/2026', email: 'ssamreen@gmail.com', fee: '$160 Per Mo', level: 'Level 2' },
  { name: 'Eli', added: 'Added 2/5/2026', email: 'eli.sing@gmail.com', fee: '$150 Per Mo', level: 'Level 4' },
  { name: 'Jake', added: 'Added 2/6/2026', email: 'amandajuliancpa@gmail.com', fee: '$160 Per Mo', level: 'Level 2' },
  { name: 'Joelea', added: 'Added 2/6/2026', email: 'billy_grinstead@yahoo.com', fee: '$150 Per Mo', level: 'Level 3' },
  { name: 'Josh', added: 'Added 2/5/2026', email: 'josh.s@gmail.com', fee: '$160 Per Mo', level: 'Level 5' },
  { name: 'Keira', added: 'Added 2/6/2026', email: 'kimluerssen@hotmail.com', fee: '$112 Per Mo', level: 'Level 3' },
];

export default function StudentsScreen() {
  const { palette } = useAppTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const { user } = useLocalSearchParams<{ user?: string }>();
  const role = getRoleFromUser(user);
  const { menu, quick } = getMenusForRole(role);

  return (
    <AppShell
      title="Students"
      subtitle="Manage your studio roster, lesson readiness, and status updates."
      menuItems={menu}
      quickActions={quick}
      user={user}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.overline}>TEACHERS</Text>
          <Text style={styles.pageTitle}>Students</Text>
          <Text style={styles.subtitle}>
            Manage your studio roster, lesson readiness, and status updates.
          </Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable style={styles.darkPill}>
            <Text style={styles.darkPillText}>LESSON FEES</Text>
          </Pressable>
          <Pressable style={styles.primaryPill}>
            <Text style={styles.primaryPillText}>ADD STUDENT</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Active Roster</Text>
        <Text style={styles.sectionMeta}>22 STUDENTS • BRIAN</Text>

        <View style={styles.pinBar}>
          <Text style={styles.pinText}>No students selected yet. Choose a student to pin them here.</Text>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchCol}>
            <Text style={styles.searchLabel}>SEARCH STUDENTS</Text>
            <TextInput
              placeholder="Search by name or email..."
              placeholderTextColor={palette.textMuted}
              style={styles.searchInput}
            />
          </View>
          <View style={styles.tableActions}>
            <Pressable style={styles.viewArchivedPill}>
              <Text style={styles.viewArchivedText}>SHOW ARCHIVED</Text>
            </Pressable>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.tableWrap}>
            <View style={styles.tableHead}>
              <Text style={[styles.th, styles.colSelect]}>SELECT</Text>
              <Text style={[styles.th, styles.colStudent]}>Student</Text>
              <Text style={[styles.th, styles.colEmail]}>Email</Text>
              <Text style={[styles.th, styles.colFee]}>Lesson Fee</Text>
              <Text style={[styles.th, styles.colLevel]}>Level</Text>
              <Text style={[styles.th, styles.colStatus]}>Status</Text>
              <Text style={[styles.th, styles.colActions]}>Actions</Text>
            </View>
            {studentRows.map((row) => (
              <View key={row.email} style={styles.tableRow}>
                <View style={styles.colSelect}>
                  <Pressable style={styles.selectPill}>
                    <Text style={styles.selectPillText}>SELECT</Text>
                  </Pressable>
                </View>
                <View style={styles.colStudent}>
                  <Text style={styles.studentName}>{row.name}</Text>
                  <Text style={styles.studentMeta}>{row.added}</Text>
                </View>
                <Text style={[styles.td, styles.colEmail]}>{row.email}</Text>
                <Text style={[styles.td, styles.colFee]}>{row.fee}</Text>
                <View style={styles.colLevel}>
                  <Text style={styles.levelPill}>{row.level}</Text>
                </View>
                <View style={styles.colStatus}>
                  <Text style={styles.statusPill}>Active</Text>
                </View>
                <View style={[styles.colActions, styles.actionsRow]}>
                  <Pressable style={styles.actionPill}>
                    <Text style={styles.actionText}>EDIT</Text>
                  </Pressable>
                  <Pressable style={styles.actionPill}>
                    <Text style={styles.actionText}>ARCHIVE</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={styles.footerRow}>
          <Text style={styles.footerMeta}>SHOWING 1-10 OF 22</Text>
          <View style={styles.paginationRow}>
            <Pressable style={styles.pagePill}>
              <Text style={styles.pagePillText}>PREV</Text>
            </Pressable>
            <Text style={styles.pageMeta}>PAGE 1 OF 3</Text>
            <Pressable style={styles.pagePill}>
              <Text style={styles.pagePillText}>NEXT</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </AppShell>
  );
}

const createStyles = (palette: ReturnType<typeof useAppTheme>['palette']) =>
  StyleSheet.create({
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
      flexWrap: 'wrap',
      marginBottom: 14,
    },
    overline: {
      color: '#c13b3f',
      fontSize: 12,
      letterSpacing: 5,
    },
    pageTitle: {
      marginTop: 8,
      color: palette.text,
      fontSize: 44,
      fontWeight: '500',
    },
    subtitle: {
      marginTop: 6,
      fontSize: 15,
      color: palette.textMuted,
    },
    headerActions: {
      flexDirection: 'row',
      gap: 8,
      alignItems: 'flex-start',
      marginTop: 12,
    },
    darkPill: {
      borderRadius: 999,
      backgroundColor: '#1e2731',
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    darkPillText: {
      color: '#fff',
      fontSize: 11,
      letterSpacing: 2.4,
    },
    primaryPill: {
      borderRadius: 999,
      backgroundColor: palette.primary,
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    primaryPillText: {
      color: '#fff',
      fontSize: 11,
      letterSpacing: 2.4,
      fontWeight: '600',
    },
    card: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.surface,
      padding: 16,
      marginBottom: 24,
    },
    sectionTitle: {
      color: palette.text,
      fontSize: 24,
      fontWeight: '600',
    },
    sectionMeta: {
      marginTop: 4,
      color: palette.textMuted,
      fontSize: 11,
      letterSpacing: 2.6,
    },
    pinBar: {
      marginTop: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.surface,
      paddingHorizontal: 12,
      paddingVertical: 12,
    },
    pinText: {
      color: palette.textMuted,
      fontSize: 14,
    },
    searchRow: {
      marginTop: 14,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      gap: 12,
      flexWrap: 'wrap',
      marginBottom: 10,
    },
    searchCol: {
      minWidth: 260,
      flex: 1,
    },
    searchLabel: {
      color: palette.textMuted,
      fontSize: 11,
      letterSpacing: 3,
      marginBottom: 8,
    },
    searchInput: {
      borderWidth: 1,
      borderColor: palette.border,
      borderRadius: 12,
      backgroundColor: palette.surface,
      color: palette.text,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 15,
    },
    tableActions: {
      flexDirection: 'row',
      gap: 8,
    },
    viewArchivedPill: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: palette.borderStrong,
      backgroundColor: palette.surface,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    viewArchivedText: {
      fontSize: 11,
      letterSpacing: 2.2,
      color: palette.textMuted,
    },
    tableWrap: {
      minWidth: 1040,
      borderWidth: 1,
      borderColor: palette.border,
      borderRadius: 14,
      overflow: 'hidden',
      backgroundColor: palette.surface,
    },
    tableHead: {
      flexDirection: 'row',
      backgroundColor: palette.surfaceSoft,
      borderBottomWidth: 1,
      borderBottomColor: palette.border,
      paddingVertical: 10,
      paddingHorizontal: 12,
    },
    th: {
      color: palette.textMuted,
      fontSize: 11,
      letterSpacing: 2.1,
      textTransform: 'uppercase',
    },
    tableRow: {
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: palette.border,
      paddingVertical: 12,
      paddingHorizontal: 12,
      minHeight: 54,
    },
    td: {
      color: palette.textMuted,
      fontSize: 14,
    },
    colSelect: {
      width: 94,
      alignItems: 'flex-start',
    },
    colStudent: {
      width: 260,
    },
    colEmail: {
      width: 300,
    },
    colFee: {
      width: 180,
    },
    colLevel: {
      width: 120,
      alignItems: 'flex-start',
    },
    colStatus: {
      width: 130,
      alignItems: 'flex-start',
    },
    colActions: {
      width: 180,
    },
    selectPill: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: palette.borderStrong,
      backgroundColor: palette.surface,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    selectPillText: {
      color: palette.textMuted,
      fontSize: 10,
      letterSpacing: 2,
    },
    studentName: {
      color: palette.text,
      fontSize: 16,
      fontWeight: '500',
    },
    studentMeta: {
      marginTop: 3,
      color: palette.textMuted,
      fontSize: 12,
    },
    levelPill: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.surface,
      paddingHorizontal: 10,
      paddingVertical: 5,
      color: palette.textMuted,
      fontSize: 11,
    },
    statusPill: {
      borderRadius: 999,
      backgroundColor: '#d5dbc8',
      color: '#556248',
      paddingHorizontal: 10,
      paddingVertical: 5,
      overflow: 'hidden',
      fontSize: 11,
    },
    actionsRow: {
      flexDirection: 'row',
      gap: 8,
      alignItems: 'center',
    },
    actionPill: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: palette.borderStrong,
      backgroundColor: palette.surface,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    actionText: {
      color: palette.textMuted,
      fontSize: 10,
      letterSpacing: 1.6,
    },
    footerRow: {
      marginTop: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 10,
      flexWrap: 'wrap',
    },
    footerMeta: {
      color: palette.textMuted,
      fontSize: 11,
      letterSpacing: 2.2,
    },
    paginationRow: {
      flexDirection: 'row',
      gap: 8,
      alignItems: 'center',
    },
    pagePill: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: palette.borderStrong,
      backgroundColor: palette.surface,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    pagePillText: {
      color: palette.textMuted,
      fontSize: 10,
      letterSpacing: 1.6,
    },
    pageMeta: {
      color: palette.textMuted,
      fontSize: 11,
      letterSpacing: 2,
    },
  });
