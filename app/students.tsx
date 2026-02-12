import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { AppShell } from '@/components/app-shell';
import { useAppTheme } from '@/components/theme/app-theme-provider';
import { getMenusForRole, getRoleFromUser } from '@/constants/menus';

type StudentRecord = {
  id: string;
  name: string;
  email: string;
  level: string;
  fee: string;
  added: string;
  lastLogin: string;
  lastPractice: string;
};

const PAGE_SIZE = 5;

const studentRows: StudentRecord[] = [
  {
    id: 'addy',
    name: 'Addy',
    email: 'addy.austin@gmail.com',
    level: 'Level 2',
    fee: '$160/mo',
    added: 'Added 2/5/2026',
    lastLogin: 'Today, 8:42 AM',
    lastPractice: 'Today, 7:10 AM',
  },
  {
    id: 'adri',
    name: 'Adri',
    email: 'adri@gmail.com',
    level: 'Level 3',
    fee: '$160/mo',
    added: 'Added 2/5/2026',
    lastLogin: 'Yesterday, 6:04 PM',
    lastPractice: 'Yesterday, 5:33 PM',
  },
  {
    id: 'ames',
    name: 'Ames',
    email: 'apenn81@yahoo.com',
    level: 'Level 2',
    fee: '$150/mo',
    added: 'Added 2/6/2026',
    lastLogin: 'Today, 9:12 AM',
    lastPractice: 'Today, 8:30 AM',
  },
  {
    id: 'axel',
    name: 'Axel',
    email: 'joybeth.martinez@gmail.com',
    level: 'Level 2',
    fee: '$320/mo',
    added: 'Added 2/6/2026',
    lastLogin: 'Yesterday, 9:45 PM',
    lastPractice: 'Yesterday, 8:18 PM',
  },
  {
    id: 'ayaan',
    name: 'Ayaan',
    email: 'ssamreen@gmail.com',
    level: 'Level 2',
    fee: '$160/mo',
    added: 'Added 2/6/2026',
    lastLogin: 'Today, 10:05 AM',
    lastPractice: 'Today, 9:37 AM',
  },
  {
    id: 'eli',
    name: 'Eli',
    email: 'eli.sing@gmail.com',
    level: 'Level 4',
    fee: '$150/mo',
    added: 'Added 2/5/2026',
    lastLogin: 'Today, 11:10 AM',
    lastPractice: 'Today, 10:24 AM',
  },
  {
    id: 'jake',
    name: 'Jake',
    email: 'amandajuliancpa@gmail.com',
    level: 'Level 2',
    fee: '$160/mo',
    added: 'Added 2/6/2026',
    lastLogin: 'Yesterday, 4:28 PM',
    lastPractice: 'Yesterday, 3:55 PM',
  },
  {
    id: 'joelea',
    name: 'Joelea',
    email: 'billy_grinstead@yahoo.com',
    level: 'Level 3',
    fee: '$150/mo',
    added: 'Added 2/6/2026',
    lastLogin: 'Today, 7:51 AM',
    lastPractice: 'Yesterday, 6:40 PM',
  },
  {
    id: 'josh',
    name: 'Josh',
    email: 'josh.s@gmail.com',
    level: 'Level 5',
    fee: '$160/mo',
    added: 'Added 2/5/2026',
    lastLogin: 'Yesterday, 8:05 PM',
    lastPractice: 'Yesterday, 7:20 PM',
  },
  {
    id: 'keira',
    name: 'Keira',
    email: 'kimluerssen@hotmail.com',
    level: 'Level 3',
    fee: '$112/mo',
    added: 'Added 2/6/2026',
    lastLogin: 'Today, 6:48 AM',
    lastPractice: 'Today, 6:11 AM',
  },
];

export default function StudentsScreen() {
  const { palette } = useAppTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const { user } = useLocalSearchParams<{ user?: string }>();
  const role = getRoleFromUser(user);
  const { menu, quick } = getMenusForRole(role);

  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupPage, setLookupPage] = useState(1);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(studentRows[0]?.id ?? null);

  const filteredStudents = useMemo(() => {
    const query = lookupQuery.trim().toLowerCase();
    if (!query) return studentRows;

    const isNumericOnly = /^[0-9]+$/.test(query);
    if (isNumericOnly) {
      return studentRows.filter((student) => {
        const levelNumber = student.level.match(/[0-9]+/)?.[0] ?? '';
        return levelNumber === query;
      });
    }

    return studentRows.filter(
      (student) =>
        student.name.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query) ||
        student.level.toLowerCase().includes(query)
    );
  }, [lookupQuery]);

  const totalLookupPages = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE));

  useEffect(() => {
    setLookupPage(1);
  }, [lookupQuery]);

  useEffect(() => {
    setLookupPage((current) => Math.min(current, totalLookupPages));
  }, [totalLookupPages]);

  useEffect(() => {
    if (!selectedStudentId) return;
    const stillExists = studentRows.some((student) => student.id === selectedStudentId);
    if (!stillExists) {
      setSelectedStudentId(studentRows[0]?.id ?? null);
    }
  }, [selectedStudentId]);

  const lookupStart = (lookupPage - 1) * PAGE_SIZE;
  const lookupStudents = filteredStudents.slice(lookupStart, lookupStart + PAGE_SIZE);
  const lastViewedStudents = studentRows.slice(0, 5);

  return (
    <AppShell
      title="Students"
      subtitle="Manage your studio roster, lesson readiness, and status updates."
      menuItems={menu}
      quickActions={quick}
      rightPanelTitle=""
      rightPanelNudgeMode="every-visit"
      rightPanelContent={
        <View style={styles.rightPanelWrap}>
          <View style={styles.rightPanelActions}>
            <Pressable style={styles.primaryPill}>
              <Text style={styles.primaryPillText}>ADD STUDENT</Text>
            </Pressable>
            <Pressable style={styles.darkPill}>
              <Text style={styles.darkPillText}>LESSON FEES</Text>
            </Pressable>
          </View>

          <View style={styles.lookupCard}>
            <Text style={styles.lookupOverline}>FIND STUDENT</Text>
            <Text style={styles.lookupTitle}>Search and Select</Text>
            <TextInput
              value={lookupQuery}
              onChangeText={setLookupQuery}
              placeholder="Search name or email"
              placeholderTextColor={palette.textMuted}
              style={styles.lookupInput}
            />

            <View style={styles.lookupList}>
              {lookupStudents.map((student) => {
                const selected = selectedStudentId === student.id;
                return (
                  <Pressable
                    key={student.id}
                    style={[styles.lookupItem, selected && styles.lookupItemActive]}
                    onPress={() => setSelectedStudentId(student.id)}>
                    <View style={styles.lookupItemTextWrap}>
                      <Text style={[styles.lookupItemName, selected && styles.lookupItemNameActive]}>
                        {student.name}
                      </Text>
                      <Text style={styles.lookupItemMeta}>{student.email}</Text>
                    </View>
                    <Text style={styles.lookupItemLevel}>{student.level}</Text>
                  </Pressable>
                );
              })}
              {lookupStudents.length === 0 ? (
                <View style={styles.lookupEmpty}>
                  <Text style={styles.lookupEmptyText}>No students found.</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.lookupFooter}>
              <View style={styles.lookupPagerRow}>
                <Pressable
                  style={[styles.pagePill, lookupPage === 1 && styles.pagePillDisabled]}
                  onPress={() => setLookupPage((current) => Math.max(1, current - 1))}
                  disabled={lookupPage === 1}>
                  <Text style={styles.pagePillText}>PREV</Text>
                </Pressable>
                <Pressable
                  style={[styles.pagePill, lookupPage === totalLookupPages && styles.pagePillDisabled]}
                  onPress={() => setLookupPage((current) => Math.min(totalLookupPages, current + 1))}
                  disabled={lookupPage === totalLookupPages}>
                  <Text style={styles.pagePillText}>NEXT</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      }
      user={user}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.overline}>TEACHERS</Text>
          <Text style={styles.pageTitle}>Students</Text>
          <Text style={styles.subtitle}>
            Manage your studio roster, lesson readiness, and status updates.
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Last Viewed</Text>
        <Text style={styles.sectionMeta}>5 STUDENTS • BRIAN</Text>

        <View style={styles.lastViewedList}>
          {lastViewedStudents.map((student) => (
            <View key={student.id} style={styles.studentCard}>
              <View style={styles.studentCardHead}>
                <View>
                  <Text style={styles.studentName}>{student.name}</Text>
                  <Text style={styles.studentMeta}>{student.email}</Text>
                </View>
                <View style={styles.studentPills}>
                  <Text style={styles.levelPill}>{student.level}</Text>
                  <Text style={styles.feePill}>{student.fee}</Text>
                </View>
              </View>

              <View style={styles.studentStatsRow}>
                <View style={styles.statBlock}>
                  <Text style={styles.statLabel}>LAST LOGIN</Text>
                  <Text style={styles.statValue}>{student.lastLogin}</Text>
                </View>
                <View style={styles.statBlock}>
                  <Text style={styles.statLabel}>LAST PRACTICE</Text>
                  <Text style={styles.statValue}>{student.lastPractice}</Text>
                </View>
              </View>

              <View style={styles.studentActionsRow}>
                <Pressable style={styles.actionPill}>
                  <Text style={styles.actionText}>VIEW MESSAGES</Text>
                </Pressable>
                <Pressable style={styles.actionPill}>
                  <Text style={styles.actionText}>VIEW LESSONS</Text>
                </Pressable>
                <Pressable style={styles.actionPill}>
                  <Text style={styles.actionText}>VIEW PRACTICE LOG</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      </View>
    </AppShell>
  );
}

const createStyles = (palette: ReturnType<typeof useAppTheme>['palette']) =>
  StyleSheet.create({
    headerRow: {
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
    lastViewedList: {
      marginTop: 12,
      gap: 10,
    },
    studentCard: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.surfaceSoft,
      padding: 12,
      gap: 10,
    },
    studentCardHead: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 10,
    },
    studentName: {
      color: palette.text,
      fontSize: 20,
      fontWeight: '600',
    },
    studentMeta: {
      marginTop: 2,
      color: palette.textMuted,
      fontSize: 12,
    },
    studentPills: {
      alignItems: 'flex-end',
      gap: 6,
    },
    levelPill: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: palette.borderStrong,
      backgroundColor: palette.surface,
      paddingHorizontal: 10,
      paddingVertical: 5,
      color: palette.textMuted,
      fontSize: 11,
    },
    feePill: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: palette.borderStrong,
      backgroundColor: palette.surface,
      paddingHorizontal: 10,
      paddingVertical: 5,
      color: palette.textMuted,
      fontSize: 11,
      letterSpacing: 1,
    },
    studentStatsRow: {
      flexDirection: 'row',
      gap: 10,
      flexWrap: 'wrap',
    },
    statBlock: {
      minWidth: 160,
      flex: 1,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.surface,
      paddingHorizontal: 10,
      paddingVertical: 8,
    },
    statLabel: {
      color: palette.textMuted,
      fontSize: 10,
      letterSpacing: 2,
    },
    statValue: {
      marginTop: 4,
      color: palette.text,
      fontSize: 13,
      fontWeight: '500',
    },
    studentActionsRow: {
      flexDirection: 'row',
      gap: 8,
      flexWrap: 'wrap',
    },
    actionPill: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: palette.borderStrong,
      backgroundColor: palette.surface,
      paddingHorizontal: 10,
      paddingVertical: 7,
    },
    actionText: {
      color: palette.textMuted,
      fontSize: 10,
      letterSpacing: 1.5,
    },
    rightPanelWrap: {
      gap: 12,
    },
    rightPanelActions: {
      gap: 10,
    },
    darkPill: {
      borderRadius: 999,
      backgroundColor: '#1e2731',
      paddingHorizontal: 16,
      paddingVertical: 10,
      alignItems: 'center',
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
      alignItems: 'center',
    },
    primaryPillText: {
      color: '#fff',
      fontSize: 11,
      letterSpacing: 2.4,
      fontWeight: '600',
    },
    lookupCard: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.surface,
      padding: 12,
      gap: 10,
    },
    lookupOverline: {
      color: '#c13b3f',
      fontSize: 10,
      letterSpacing: 3.2,
    },
    lookupTitle: {
      color: palette.text,
      fontSize: 18,
      fontWeight: '600',
      marginTop: -2,
    },
    lookupInput: {
      borderWidth: 1,
      borderColor: palette.border,
      borderRadius: 10,
      backgroundColor: palette.surfaceSoft,
      color: palette.text,
      paddingHorizontal: 10,
      paddingVertical: 9,
      fontSize: 14,
    },
    lookupList: {
      gap: 8,
    },
    lookupItem: {
      borderRadius: 10,
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.surfaceSoft,
      paddingHorizontal: 10,
      paddingVertical: 8,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 10,
    },
    lookupItemActive: {
      borderColor: palette.primary,
      backgroundColor: palette.surface,
    },
    lookupItemTextWrap: {
      flex: 1,
    },
    lookupItemName: {
      color: palette.text,
      fontSize: 14,
      fontWeight: '600',
    },
    lookupItemNameActive: {
      color: palette.primary,
    },
    lookupItemMeta: {
      marginTop: 2,
      color: palette.textMuted,
      fontSize: 11,
    },
    lookupItemLevel: {
      color: palette.textMuted,
      fontSize: 11,
      letterSpacing: 1.2,
    },
    lookupEmpty: {
      borderRadius: 10,
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.surfaceSoft,
      paddingHorizontal: 10,
      paddingVertical: 12,
    },
    lookupEmptyText: {
      color: palette.textMuted,
      fontSize: 12,
      textAlign: 'center',
    },
    lookupFooter: {
      gap: 8,
    },
    lookupPagerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      justifyContent: 'space-between',
    },
    pagePill: {
      flex: 1,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: palette.borderStrong,
      backgroundColor: palette.surface,
      paddingHorizontal: 10,
      paddingVertical: 6,
      alignItems: 'center',
    },
    pagePillDisabled: {
      opacity: 0.45,
    },
    pagePillText: {
      color: palette.textMuted,
      fontSize: 10,
      letterSpacing: 1.6,
    },
  });
