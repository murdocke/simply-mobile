import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { AppShell } from '@/components/app-shell';
import { useAppTheme } from '@/components/theme/app-theme-provider';
import { getMenusForRole, getRoleFromUser } from '@/constants/menus';

const levels = [
  { title: 'Level 1', price: '$29' },
  { title: 'Level 2', price: '$29' },
  { title: 'Level 3', price: '$29' },
  { title: 'Level 4', price: '$29' },
  { title: 'Level 5', price: '$29' },
  { title: 'Level 6', price: '$29' },
  { title: 'Level 7', price: '$29' },
  { title: 'Level 8', price: '$29' },
  { title: 'Level 9', price: '$29' },
];

export default function LibraryScreen() {
  const { palette } = useAppTheme();
  const { width } = useWindowDimensions();
  const isPhone = width < 640;
  const isNarrowPhone = width < 430;
  const styles = useMemo(() => createStyles(palette), [palette]);
  const { user } = useLocalSearchParams<{ user?: string }>();
  const role = getRoleFromUser(user);
  const { menu, quick } = getMenusForRole(role);

  return (
    <AppShell
      title="Lesson Library"
      subtitle="Explore the curriculum and open a section to start learning."
      menuItems={menu}
      quickActions={quick}
      rightPanelTitle=""
      rightPanelAutoOpen="none"
      rightPanelNudgeMode="every-visit"
      rightPanelContent={
        <View style={styles.rightPanelWrap}>
          <Text style={styles.rightPanelProgramTitle}>Foundation Program</Text>
          <View style={styles.rightPanelLevelList}>
            {levels.map((level) => (
              <Pressable key={`panel-${level.title}`} style={styles.rightPanelLevelButton}>
                <Text style={styles.rightPanelLevelButtonText}>{level.title}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable style={styles.rightPanelViewMoreButton}>
            <Text style={styles.rightPanelViewMoreText}>VIEW MORE</Text>
          </Pressable>
        </View>
      }
      user={user}>
      <View style={[styles.mainCard, isPhone && styles.mainCardPhone]}>
        <Text style={styles.sectionOverline}>CURRICULUM</Text>
        <Text style={[styles.sectionTitle, isPhone && styles.sectionTitlePhone]}>Program Library</Text>
        <Text style={styles.sectionBody}>
          Browse each program and open a section to see materials.
        </Text>

        <View style={[styles.programPanel, isPhone && styles.programPanelPhone]}>
          <View style={[styles.panelHeaderRow, isPhone && styles.panelHeaderRowPhone]}>
            <View style={styles.panelHeaderTextWrap}>
              <Text style={styles.programOverline}>FOUNDATION PROGRAM</Text>
              <Text style={styles.programBody}>Choose a section to view materials.</Text>
            </View>
            <Pressable style={styles.viewAllPill}>
              <Text style={styles.viewAllText}>VIEW ALL</Text>
            </Pressable>
          </View>

          <View style={styles.levelGrid}>
            {levels.map((level) => (
              <View key={level.title} style={[styles.levelCard, isPhone && styles.levelCardPhone]}>
                <View style={styles.levelTop}>
                  <Text style={[styles.levelName, isPhone && styles.levelNamePhone]}>{level.title}</Text>
                  <Text style={[styles.levelPrice, isPhone && styles.levelPricePhone]}>{level.price}</Text>
                </View>
                <View style={[styles.levelBottom, isNarrowPhone && styles.levelBottomPhone]}>
                  <Text
                    style={[
                      styles.lockedText,
                      isPhone && styles.lockedTextPhone,
                      isNarrowPhone && styles.lockedTextNarrowPhone,
                    ]}>
                    LOCKED SECTION
                  </Text>
                  <Pressable style={[styles.unlockPill, isNarrowPhone && styles.unlockPillNarrowPhone]}>
                    <Text
                      style={[
                        styles.unlockText,
                        isPhone && styles.unlockTextPhone,
                        isNarrowPhone && styles.unlockTextNarrowPhone,
                      ]}>
                      UNLOCK THIS SECTION
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </AppShell>
  );
}

const createStyles = (palette: ReturnType<typeof useAppTheme>['palette']) =>
  StyleSheet.create({
  mainCard: {
    borderRadius: 16,
    backgroundColor: palette.background,
    borderWidth: 0,
    padding: 24,
    marginBottom: 36,
  },
  mainCardPhone: {
    padding: 14,
    marginBottom: 24,
  },
  sectionOverline: {
    color: '#c13b3f',
    letterSpacing: 5,
    fontSize: 12,
  },
  sectionTitle: {
    marginTop: 10,
    fontSize: 40,
    fontWeight: '600',
    color: palette.text,
  },
  sectionTitlePhone: {
    fontSize: 30,
    marginTop: 8,
  },
  sectionBody: {
    marginTop: 8,
    fontSize: 14,
    color: palette.textMuted,
  },
  programPanel: {
    marginTop: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 18,
    backgroundColor: palette.background,
  },
  programPanelPhone: {
    marginTop: 14,
    padding: 12,
  },
  panelHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
  },
  panelHeaderRowPhone: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  panelHeaderTextWrap: {
    flex: 1,
  },
  programOverline: {
    color: '#c13b3f',
    letterSpacing: 4.2,
    fontSize: 12,
  },
  programBody: {
    marginTop: 8,
    fontSize: 15,
    color: palette.textMuted,
  },
  viewAllPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: palette.surface,
  },
  viewAllText: {
    fontSize: 12,
    letterSpacing: 3,
    color: palette.textMuted,
  },
  levelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  levelCard: {
    flexBasis: '49%',
    flexGrow: 1,
    minWidth: 300,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surfaceSoft,
    padding: 12,
    shadowColor: palette.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  levelCardPhone: {
    flexBasis: '100%',
    minWidth: 0,
    padding: 10,
  },
  levelTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelName: {
    fontSize: 24,
    color: palette.text,
    fontWeight: '500',
  },
  levelNamePhone: {
    fontSize: 20,
  },
  levelPrice: {
    fontSize: 28,
    color: palette.text,
    opacity: 0.7,
    fontWeight: '600',
  },
  levelPricePhone: {
    fontSize: 24,
  },
  levelBottom: {
    marginTop: 8,
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 8,
  },
  levelBottomPhone: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 8,
  },
  lockedText: {
    fontSize: 12,
    letterSpacing: 4,
    color: palette.textMuted,
  },
  lockedTextPhone: {
    fontSize: 11,
    letterSpacing: 2.4,
  },
  lockedTextNarrowPhone: {
    letterSpacing: 2,
  },
  unlockPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    backgroundColor: palette.surface,
    paddingHorizontal: 14,
    paddingVertical: 9,
    width: '100%',
    alignItems: 'center',
  },
  unlockPillNarrowPhone: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  unlockText: {
    fontSize: 12,
    letterSpacing: 3,
    color: palette.textMuted,
  },
  unlockTextPhone: {
    fontSize: 11,
    letterSpacing: 2,
  },
  unlockTextNarrowPhone: {
    letterSpacing: 1.6,
  },
  rightPanelWrap: {
    gap: 12,
  },
  rightPanelProgramTitle: {
    fontSize: 16,
    color: palette.text,
    fontWeight: '600',
  },
  rightPanelLevelList: {
    gap: 8,
  },
  rightPanelLevelButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    backgroundColor: palette.surface,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  rightPanelLevelButtonText: {
    color: palette.text,
    fontSize: 12,
    letterSpacing: 1.2,
    fontWeight: '600',
  },
  rightPanelViewMoreButton: {
    marginTop: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    backgroundColor: 'transparent',
    paddingHorizontal: 12,
    paddingVertical: 9,
    alignItems: 'center',
  },
  rightPanelViewMoreText: {
    color: palette.textMuted,
    fontSize: 11,
    letterSpacing: 2.4,
    fontWeight: '600',
  },
});
