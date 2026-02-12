import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';

import { AppShell } from '@/components/app-shell';
import { LiveRegionClocks } from '@/components/company/live-region-clocks';
import { useAppTheme } from '@/components/theme/app-theme-provider';
import { getMenusForRole, getRoleFromUser } from '@/constants/menus';

const accountLabels: Record<string, string> = {
  neil: 'Company account',
  brian: 'Teacher account',
  quinn: 'Student account',
};

export default function DashboardScreen() {
  const { palette, mode } = useAppTheme();
  const styles = useMemo(() => createStyles(palette, mode), [palette, mode]);
  const { width } = useWindowDimensions();
  const isWide = width >= 1080;
  const isPhone = width < 640;
  const { user } = useLocalSearchParams<{ user?: string }>();
  const accountLabel = user ? accountLabels[user.toLowerCase()] : undefined;
  const role = getRoleFromUser(user);
  const { menu, quick } = getMenusForRole(role);

  if (role === 'student') {
    return (
      <AppShell
        title="Dashboard"
        subtitle="Your practice snapshot will live here."
        menuItems={menu}
        quickActions={quick}
        user={user}>
        <View style={[styles.studentHeader, isPhone && styles.studentHeaderPhone]}>
          <View>
            <Text style={styles.studentOverline}>STUDENTS</Text>
            <Text style={[styles.studentTitle, isPhone && styles.studentTitlePhone]}>Dashboard</Text>
            <Text style={styles.studentSubtitle}>Your practice snapshot will live here.</Text>
          </View>
          <Pressable style={styles.inlinePill}>
            <Text style={styles.inlinePillText}>SHOW NEIL MESSAGE</Text>
          </Pressable>
        </View>

        <View style={styles.feesBanner}>
          <Text style={styles.bannerOverline}>LESSON FEES DUE</Text>
          <Text style={styles.bannerTitle}>This month&apos;s lesson fees are not marked paid yet.</Text>
          <Text style={styles.bannerBody}>
            Please check in with your teacher and get this taken care of.
          </Text>
        </View>

        <View style={[styles.dashboardGrid, !isWide && styles.dashboardGridStacked]}>
          <View style={styles.leftColumn}>
            <View style={styles.bigCard}>
              <Text style={styles.cardOverline}>LAST VIEWED LESSON VIDEO</Text>
              <Text style={styles.cardHeading}>Lesson Video</Text>
              <View style={styles.videoWrap}>
                <Image
                  source={require('@/assets/images/student-video.png')}
                  style={[styles.videoImage, isPhone && styles.videoImagePhone]}
                  contentFit="cover"
                />
                <View style={styles.videoShade}>
                  <Text style={styles.videoMeta}>VIEWING</Text>
                  <Text style={styles.videoTitle}>Dreams Come True</Text>
                  <Text style={styles.videoSub}>1.1.1 - Demonstrate Piece</Text>
                </View>
              </View>
              <View style={styles.videoControls}>
                <Text style={styles.controlsText}>● 02:39</Text>
                <View style={styles.seekTrack}>
                  <View style={styles.seekFill} />
                </View>
                <Text style={styles.controlsText}>VOL</Text>
              </View>
              <View style={[styles.videoFooter, isPhone && styles.videoFooterPhone]}>
                <Text style={styles.videoFooterLabel}>LAST VIEWED LESSON VIDEO</Text>
                <View style={[styles.videoFooterButtons, isPhone && styles.videoFooterButtonsPhone]}>
                  <Pressable style={[styles.smallPill, isPhone && styles.smallPillPhone]}>
                    <Text style={styles.smallPillText}>PREVIOUS</Text>
                  </Pressable>
                  <Pressable style={[styles.smallPill, isPhone && styles.smallPillPhone]}>
                    <Text style={styles.smallPillText}>NEXT</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.rightColumn}>
            <View style={styles.sideCard}>
              <Text style={styles.cardOverline}>THIS WEEK</Text>
              <Text style={styles.sideTitle}>Lesson Plan Ready</Text>
              <Text style={styles.sideBody}>
                Jump into your current lesson plan to review parts, videos, and practice goals.
              </Text>
              <Pressable style={styles.smallPill}>
                <Text style={styles.smallPillText}>VIEW LESSON PLAN</Text>
              </Pressable>
            </View>

            <View style={styles.sideCard}>
              <Image
                source={require('@/assets/images/jazz-colors.png')}
                style={styles.lessonPackImage}
                contentFit="cover"
              />
              <Text style={[styles.cardOverline, styles.cardOverlineTop]}>LESSON ADDED</Text>
              <Text style={styles.sideTitle}>New Lesson Pack: Jazz Colors</Text>
              <Text style={styles.sideBody}>
                Swing into a fresh set of grooves, chords, and riffs.
              </Text>
              <Pressable style={styles.smallPill}>
                <Text style={styles.smallPillText}>VIEW LESSON PACK DETAILS</Text>
              </Pressable>
            </View>

            <View style={styles.sideCard}>
              <Text style={styles.cardOverline}>PLAYLIST</Text>
              <Text style={styles.sideTitle}>Keep Your Playlist Repertoire Alive!</Text>
              <Text style={styles.sideBody}>
                This is your personal playlist, curated by your teacher so you can sit down and play.
              </Text>
              <View style={styles.emptyPill}>
                <Text style={styles.emptyText}>No playlist items have been set yet.</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.bottomCardsGrid, !isWide && styles.dashboardGridStacked]}>
          <View style={styles.bottomCard}>
            <Text style={styles.cardOverline}>FOCUS</Text>
            <Text style={styles.bottomCardTitle}>Make &quot;a focus song&quot; your weekly win.</Text>
            <Text style={styles.bottomCardBody}>
              Focus song will appear here once setup by your teacher.
            </Text>
          </View>

          <View style={styles.bottomCard}>
            <Text style={styles.cardOverline}>FOCUS</Text>
            <Text style={styles.bottomCardTitle}>Keep &quot;your focus song&quot; polished.</Text>
            <Text style={styles.bottomCardBody}>
              Focus song will appear here once setup by your teacher.
            </Text>
          </View>

          <View style={styles.bottomCard}>
            <Text style={styles.cardOverline}>PRACTICE</Text>
            <Text style={styles.bottomCardTitle}>Have you played &quot;a new song&quot; lately?</Text>
            <Text style={styles.bottomCardBody}>Unlock a lesson to get started.</Text>
          </View>

          <View style={styles.bottomCard}>
            <Text style={styles.cardOverline}>CHECK-IN</Text>
            <Text style={styles.bottomCardTitle}>Is &quot;this song&quot; still in your fingers?</Text>
            <Text style={styles.bottomCardBody}>
              Unlock a lesson to see your check-in prompt.
            </Text>
          </View>
        </View>
      </AppShell>
    );
  }

  if (role === 'teacher') {
    return (
      <AppShell
        title="Dashboard"
        subtitle="Your studio snapshot, schedule, and fees in one place."
        menuItems={menu}
        quickActions={quick}
        user={user}>
        <View style={styles.teacherHeader}>
          <Text style={styles.studentOverline}>TEACHERS</Text>
          <Text style={[styles.teacherTitle, isPhone && styles.teacherTitlePhone]}>Dashboard</Text>
          <Text style={styles.studentSubtitle}>Your studio snapshot, schedule, and fees in one place.</Text>
        </View>

        <View style={[styles.teacherTopGrid, !isWide && styles.dashboardGridStacked]}>
          <View style={styles.teacherTopCard}>
            <View style={styles.teacherTopHead}>
              <Text style={styles.cardOverline}>MESSAGES</Text>
              <Pressable>
                <Text style={styles.upcomingMeta}>VIEW</Text>
              </Pressable>
            </View>
            <Text style={styles.teacherTopCount}>1</Text>
            <Text style={styles.teacherBody}>Unread messages</Text>
            <View style={styles.teacherTopPills}>
              <View style={styles.tagPill}>
                <Text style={styles.tagText}>Quinn</Text>
                <View style={styles.badgeDot}>
                  <Text style={styles.badgeText}>1</Text>
                </View>
              </View>
              <View style={styles.tagPill}>
                <Text style={styles.tagText}>Corporate</Text>
              </View>
            </View>
          </View>

          <View style={styles.teacherTopCard}>
            <Text style={styles.cardOverline}>STUDENTS UNPAID</Text>
            <Text style={styles.teacherTopCount}>22</Text>
            <Text style={styles.teacherBody}>Follow up before month-end.</Text>
          </View>
        </View>

        <View style={[styles.teacherGrid, !isWide && styles.dashboardGridStacked]}>
          <View style={styles.teacherLeft}>
            <View style={styles.teacherLessonsCard}>
              <Text style={styles.cardOverline}>LESSONS</Text>
              <Text style={styles.teacherCount}>3</Text>
              <Text style={styles.teacherBody}>Your Upcoming Schedule</Text>
              <Text style={styles.teacherBody}>Wednesday, February 11, 2026.</Text>

              <View style={styles.teacherLessonRow}>
                <View style={styles.teacherLessonLeft}>
                  <View style={styles.checkCircle}>
                    <Text style={styles.checkMark}>✓</Text>
                  </View>
                  <Text style={styles.teacherStudentName}>Eli</Text>
                </View>
                <View style={styles.teacherLessonRight}>
                  <Text style={styles.paidPill}>UNPAID</Text>
                  <Text style={styles.timeText}>6:00 PM</Text>
                </View>
              </View>

              <View style={styles.teacherLessonRow}>
                <View style={styles.teacherLessonLeft}>
                  <View style={styles.checkCircle}>
                    <Text style={styles.checkMark}>✓</Text>
                  </View>
                  <Text style={styles.teacherStudentName}>Ayaan</Text>
                </View>
                <View style={styles.teacherLessonRight}>
                  <Text style={styles.paidPill}>UNPAID</Text>
                  <Text style={styles.timeText}>7:00 PM</Text>
                </View>
              </View>

              <View style={styles.teacherLessonRow}>
                <View style={styles.teacherLessonLeft}>
                  <View style={styles.checkCircle}>
                    <Text style={styles.checkMark}>✓</Text>
                  </View>
                  <Text style={styles.teacherStudentName}>Josh</Text>
                </View>
                <View style={styles.teacherLessonRight}>
                  <Text style={styles.paidPill}>UNPAID</Text>
                  <Text style={styles.timeText}>8:00 PM</Text>
                </View>
              </View>
            </View>

            <View style={styles.teacherLessonsCard}>
              <View style={styles.upcomingHead}>
                <Text style={styles.cardOverline}>UPCOMING</Text>
                <Text style={styles.upcomingMeta}>NEXT 2 DAYS</Text>
              </View>

              <View style={[styles.upcomingGrid, isPhone && styles.dashboardGridStacked]}>
                <View style={styles.upcomingCol}>
                  <Text style={styles.upcomingDate}>THU, FEB 12</Text>
                  <Text style={styles.upcomingCount}>2</Text>
                  <View style={styles.upcomingRow}>
                    <Text style={styles.upcomingName}>Addy</Text>
                    <Text style={styles.upcomingTime}>5:00 PM</Text>
                  </View>
                  <View style={styles.upcomingRow}>
                    <Text style={styles.upcomingName}>Joelea</Text>
                    <Text style={styles.upcomingTime}>5:30 PM</Text>
                  </View>
                </View>

                <View style={styles.upcomingCol}>
                  <Text style={styles.upcomingDate}>FRI, FEB 13</Text>
                  <Text style={styles.upcomingCount}>4</Text>
                  <View style={styles.upcomingRow}>
                    <Text style={styles.upcomingName}>Oliver</Text>
                    <Text style={styles.upcomingTime}>4:00 PM</Text>
                  </View>
                  <View style={styles.upcomingRow}>
                    <Text style={styles.upcomingName}>Axel</Text>
                    <Text style={styles.upcomingTime}>4:30 PM</Text>
                  </View>
                  <View style={styles.upcomingRow}>
                    <Text style={styles.upcomingName}>Miles</Text>
                    <Text style={styles.upcomingTime}>5:30 PM</Text>
                  </View>
                  <View style={styles.upcomingRow}>
                    <Text style={styles.upcomingName}>Wyatt</Text>
                    <Text style={styles.upcomingTime}>6:00 PM</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.teacherRight}>
            <View style={[styles.sideCard, styles.teacherDateNavCard]}>
              <View style={styles.dateNavRow}>
                <Pressable style={styles.dateNavPill}>
                  <Text style={styles.dateNavText}>BACK</Text>
                </Pressable>
                <Text style={styles.upcomingMeta}>WED, FEB 11</Text>
                <Pressable style={styles.dateNavPill}>
                  <Text style={styles.dateNavText}>NEXT</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.sideCard}>
              <Text style={styles.cardOverline}>CURRENT DATE/TIME</Text>
              <Text style={styles.teacherDateTitle}>Wednesday, February 11</Text>
              <Text style={styles.teacherBody}>12:15 PM</Text>
            </View>

            <View style={styles.sideCard}>
              <Text style={styles.cardOverline}>NEXT STUDENT</Text>
              <Text style={styles.teacherDateTitle}>Eli</Text>
              <Text style={styles.teacherBody}>6:00 PM · Individual · Level 4</Text>
            </View>

            <View style={styles.sideCard}>
              <Image
                source={require('@/assets/images/jazz-colors.png')}
                style={styles.lessonPackImage}
                contentFit="cover"
              />
              <Text style={[styles.cardOverline, styles.cardOverlineTop]}>LESSON ADDED</Text>
              <Text style={styles.sideTitle}>Jazz Colors: Teacher Edition</Text>
              <Text style={styles.sideBody}>
                Quick coaching ideas, voicing tips, and a groove-first approach.
              </Text>
              <Pressable style={[styles.smallPill, styles.teacherLessonAddedButton]}>
                <Text style={styles.smallPillText}>VIEW LESSON PACK DETAILS</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.teacherBottomVideoCard}>
          <Text style={styles.cardOverline}>LAST VIEWED LESSON VIDEO</Text>
          <Text style={styles.cardHeading}>Lesson Video</Text>
          <View style={styles.videoWrap}>
            <Image
              source={require('@/assets/images/student-video.png')}
              style={[styles.videoImage, isPhone && styles.videoImagePhone]}
              contentFit="cover"
            />
            <View style={styles.videoShade}>
              <Text style={styles.videoMeta}>VIEWING</Text>
              <Text style={styles.videoTitle}>Dreams Come True</Text>
              <Text style={styles.videoSub}>1.1.1 - Demonstrate Piece</Text>
            </View>
          </View>
          <View style={styles.videoControls}>
            <Text style={styles.controlsText}>● 02:39</Text>
            <View style={styles.seekTrack}>
              <View style={styles.seekFill} />
            </View>
            <Text style={styles.controlsText}>VOL</Text>
          </View>
          <View style={[styles.videoFooter, isPhone && styles.videoFooterPhone]}>
            <Text style={styles.videoFooterLabel}>LAST VIEWED LESSON VIDEO</Text>
            <View style={[styles.videoFooterButtons, isPhone && styles.videoFooterButtonsPhone]}>
              <Pressable style={[styles.smallPill, isPhone && styles.smallPillPhone]}>
                <Text style={styles.smallPillText}>PREVIOUS</Text>
              </Pressable>
              <Pressable style={[styles.smallPill, isPhone && styles.smallPillPhone]}>
                <Text style={styles.smallPillText}>NEXT</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </AppShell>
    );
  }

  if (role === 'company') {
    return (
      <AppShell
        title="Dashboard"
        subtitle="Choose a workspace to jump into a focused view."
        menuItems={menu}
        quickActions={quick}
        user={user}>
        <View style={[styles.companyHeaderRow, isPhone && styles.dashboardGridStacked]}>
          <View>
            <Text style={styles.studentOverline}>OVERVIEW</Text>
            <Text style={[styles.teacherTitle, isPhone && styles.teacherTitlePhone]}>Dashboard</Text>
            <Text style={styles.studentSubtitle}>Choose a workspace to jump into a focused view.</Text>
          </View>
          <LiveRegionClocks />
        </View>

        <View style={[styles.companyStatsGrid, !isWide && styles.dashboardGridStacked]}>
          <View style={styles.companyBillingCard}>
            <Text style={styles.cardOverline}>BILLING OUTLOOK</Text>
            <Text style={styles.companyWorkTitle}>Monthly Royalties Snapshot</Text>
            <Text style={styles.companyStatBody}>
              Estimated from current student counts under the new subscription model.
            </Text>

            <View style={styles.companyBillingGrid}>
              <View style={styles.companyBillingRow}>
                <View style={styles.companyBillingItem}>
                  <Text style={styles.companyBillingLabel}>TOTAL DUE</Text>
                  <Text
                    style={styles.companyBillingValue}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.8}>
                    $205,335
                  </Text>
                </View>
                <View style={styles.companyBillingItem}>
                  <Text style={styles.companyBillingLabel}>BILLING DATE</Text>
                  <Text
                    style={[styles.companyBillingValue, styles.companyBillingValueDate]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.8}>
                    Mar 1, 2026
                  </Text>
                </View>
              </View>
              <View style={styles.companyBillingRow}>
                <View style={styles.companyBillingItem}>
                  <Text style={styles.companyBillingLabel}>ACTIVE STUDENTS</Text>
                  <Text
                    style={styles.companyBillingValue}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.8}>
                    22,815
                  </Text>
                </View>
                <View style={styles.companyBillingItem}>
                  <Text style={styles.companyBillingLabel}>AT-RISK ACCOUNTS</Text>
                  <Text
                    style={styles.companyBillingValue}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.8}>
                    14
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.companyStatsGrid, !isWide && styles.dashboardGridStacked]}>
          <View style={styles.companyStatCard}>
            <Text style={styles.cardOverline}>LESSON LIBRARY</Text>
            <Text style={styles.companyStatValue}>128 Packs</Text>
            <Text style={styles.companyStatBody}>Refresh content, uploads, and releases.</Text>
          </View>
          <View style={styles.companyStatCard}>
            <Text style={styles.cardOverline}>SUBSCRIPTIONS</Text>
            <Text style={styles.companyStatValue}>22,815</Text>
            <Text style={styles.companyStatBody}>Students billed at $9 per month.</Text>
          </View>
          <View style={styles.companyStatCard}>
            <Text style={styles.cardOverline}>ACCOUNTS</Text>
            <Text style={styles.companyStatValue}>845</Text>
            <Text style={styles.companyStatBody}>Active teachers across the network.</Text>
          </View>
          <View style={styles.companyStatCard}>
            <Text style={styles.cardOverline}>MESSAGES</Text>
            <Text style={styles.companyStatValue}>24 Threads</Text>
            <Text style={styles.companyStatBody}>Active teacher conversations.</Text>
          </View>
        </View>

        <View style={[styles.companyStatsGrid, !isWide && styles.dashboardGridStacked]}>
          <View style={styles.companyStatCard}>
            <Text style={styles.cardOverline}>SUBSCRIPTIONS</Text>
            <Text style={styles.companyStatValue}>22,815</Text>
            <Text style={styles.companyStatBody}>Current student subscriptions across all studios.</Text>
          </View>
          <View style={styles.companyStatCard}>
            <Text style={styles.cardOverline}>ACCOUNTS</Text>
            <Text style={styles.companyStatValue}>30 Teachers</Text>
            <Text style={styles.companyStatBody}>Teacher directory, statuses, and roster assignments.</Text>
          </View>
          <View style={styles.companyStatCard}>
            <Text style={styles.cardOverline}>SUPPORT</Text>
            <Text style={styles.companyStatValue}>6 Open</Text>
            <Text style={styles.companyStatBody}>Active requests focused on teacher support and guidance.</Text>
          </View>
        </View>
      </AppShell>
    );
  }

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

const createStyles = (
  palette: ReturnType<typeof useAppTheme>['palette'],
  mode: 'light' | 'dark'
) => {
  const lightCardBackground = mode === 'light' ? '#f3f6fb' : palette.background;
  const lightSoftBackground = mode === 'light' ? '#edf2f8' : palette.surfaceSoft;
  const lightPillBackground = mode === 'light' ? '#f8fbff' : palette.surface;

  return StyleSheet.create({
  studentHeader: {
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  studentHeaderPhone: {
    flexDirection: 'column',
  },
  studentOverline: {
    color: '#c13b3f',
    fontSize: 12,
    letterSpacing: 5.5,
  },
  studentTitle: {
    marginTop: 8,
    fontSize: 44,
    color: palette.text,
    fontWeight: '500',
  },
  studentTitlePhone: {
    fontSize: 34,
  },
  teacherHeader: {
    marginBottom: 14,
  },
  teacherTitle: {
    marginTop: 8,
    fontSize: 46,
    color: palette.text,
    fontWeight: '500',
  },
  teacherTitlePhone: {
    fontSize: 36,
  },
  teacherGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  teacherTopGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  teacherTopCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: lightCardBackground,
    padding: 14,
  },
  teacherTopHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  teacherTopCount: {
    marginTop: 4,
    fontSize: 34,
    color: palette.text,
    fontWeight: '600',
  },
  teacherTopPills: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  tagPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    backgroundColor: lightPillBackground,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tagText: {
    fontSize: 13,
    color: palette.textMuted,
  },
  badgeDot: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  teacherLeft: {
    flex: 2.2,
    gap: 12,
  },
  teacherRight: {
    flex: 1,
    gap: 12,
  },
  teacherBottomVideoCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: lightCardBackground,
    padding: 12,
    marginBottom: 24,
  },
  companyHeaderRow: {
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  companyStatsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  companyStatCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: lightCardBackground,
    padding: 14,
    minWidth: 220,
  },
  companyStatValue: {
    marginTop: 10,
    color: palette.text,
    fontSize: 30,
    fontWeight: '600',
  },
  companyStatBody: {
    marginTop: 6,
    color: palette.textMuted,
    fontSize: 14,
  },
  companyWorkCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: lightCardBackground,
    padding: 14,
    marginBottom: 12,
  },
  companyWorkHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  companyWorkTitle: {
    marginTop: 10,
    color: palette.text,
    fontSize: 22,
    fontWeight: '500',
    lineHeight: 28,
  },
  updatedPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: lightPillBackground,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  updatedPillText: {
    color: palette.textMuted,
    fontSize: 11,
  },
  companyWorkGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  companyWorkItem: {
    flexBasis: '32%',
    flexGrow: 1,
    minWidth: 250,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: lightCardBackground,
    padding: 12,
  },
  companyBottomGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  companyBillingCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: lightCardBackground,
    padding: 14,
  },
  companyBillingGrid: {
    marginTop: 12,
    gap: 10,
  },
  companyBillingRow: {
    flexDirection: 'row',
    gap: 10,
  },
  companyBillingItem: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: lightSoftBackground,
    padding: 12,
  },
  companyBillingLabel: {
    color: palette.textMuted,
    fontSize: 10,
    letterSpacing: 1.8,
  },
  companyBillingValue: {
    marginTop: 6,
    color: palette.text,
    fontSize: 23,
    fontWeight: '600',
    flexShrink: 1,
  },
  companyBillingValueDate: {
    fontSize: 20,
  },
  companyCommList: {
    marginTop: 12,
    gap: 8,
  },
  companyCommItem: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: lightSoftBackground,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  companyActionPill: {
    marginTop: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    backgroundColor: lightPillBackground,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  companyActionPillText: {
    color: palette.textMuted,
    fontSize: 11,
    letterSpacing: 2.4,
  },
  teacherLessonsCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: lightCardBackground,
    padding: 14,
  },
  teacherCount: {
    marginTop: 8,
    fontSize: 34,
    color: palette.text,
    fontWeight: '600',
  },
  teacherBody: {
    marginTop: 4,
    fontSize: 14,
    color: palette.textMuted,
  },
  teacherLessonRow: {
    marginTop: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: mode === 'dark' ? '#5b6752' : '#ccd4c2',
    backgroundColor: mode === 'dark' ? '#2c3428' : '#d5dbc8',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  teacherLessonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#c0b8ad',
    backgroundColor: '#ece7dd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    color: '#9d978f',
    fontSize: 14,
  },
  teacherStudentName: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '500',
  },
  teacherLessonRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paidPill: {
    borderRadius: 999,
    backgroundColor: mode === 'dark' ? '#5a3f2a' : '#f0d8c4',
    color: mode === 'dark' ? '#ffd7b8' : '#ad7c54',
    fontSize: 10,
    letterSpacing: 2.2,
    paddingHorizontal: 8,
    paddingVertical: 5,
    overflow: 'hidden',
  },
  timeText: {
    color: '#7f7a73',
    fontSize: 13,
    letterSpacing: 1,
  },
  upcomingHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  upcomingMeta: {
    color: palette.textMuted,
    fontSize: 11,
    letterSpacing: 2.4,
  },
  upcomingGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  upcomingCol: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: lightCardBackground,
    padding: 12,
  },
  upcomingDate: {
    color: palette.textMuted,
    fontSize: 11,
    letterSpacing: 3,
  },
  upcomingCount: {
    marginTop: 6,
    color: palette.text,
    fontSize: 32,
    fontWeight: '600',
  },
  upcomingRow: {
    marginTop: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: lightPillBackground,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  upcomingName: {
    color: palette.text,
    fontSize: 13,
  },
  upcomingTime: {
    color: palette.textMuted,
    fontSize: 12,
    letterSpacing: 1,
  },
  dateNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  dateNavPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    backgroundColor: lightPillBackground,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  dateNavText: {
    fontSize: 10,
    letterSpacing: 1.6,
    color: palette.textMuted,
  },
  teacherDateTitle: {
    marginTop: 8,
    fontSize: 22,
    color: palette.text,
    fontWeight: '600',
  },
  studentSubtitle: {
    marginTop: 6,
    fontSize: 15,
    color: palette.textMuted,
  },
  inlinePill: {
    marginTop: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    backgroundColor: lightPillBackground,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  inlinePillText: {
    fontSize: 11,
    letterSpacing: 3,
    color: palette.textMuted,
  },
  feesBanner: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: lightSoftBackground,
    padding: 14,
    marginBottom: 14,
  },
  bannerOverline: {
    fontSize: 11,
    letterSpacing: 4,
    color: '#9d7f62',
  },
  bannerTitle: {
    marginTop: 8,
    fontSize: 17,
    color: palette.text,
    fontWeight: '600',
  },
  bannerBody: {
    marginTop: 6,
    fontSize: 14,
    color: palette.textMuted,
  },
  dashboardGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  dashboardGridStacked: {
    flexDirection: 'column',
  },
  leftColumn: {
    flex: 1.95,
  },
  rightColumn: {
    flex: 1,
    gap: 12,
  },
  bigCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: lightCardBackground,
    padding: 12,
  },
  cardOverline: {
    color: '#c13b3f',
    fontSize: 11,
    letterSpacing: 4.5,
  },
  cardHeading: {
    marginTop: 8,
    fontSize: 31,
    color: palette.text,
    fontWeight: '500',
  },
  videoWrap: {
    marginTop: 10,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: palette.borderStrong,
    backgroundColor: '#121212',
  },
  videoImage: {
    width: '100%',
    height: 390,
  },
  videoImagePhone: {
    height: 250,
  },
  videoShade: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.38)',
  },
  videoMeta: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    letterSpacing: 4,
  },
  videoTitle: {
    marginTop: 10,
    color: '#fff',
    fontSize: 30,
    fontWeight: '600',
  },
  videoSub: {
    marginTop: 4,
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
  },
  videoControls: {
    marginTop: 0,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: palette.borderStrong,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    backgroundColor: '#111',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlsText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    letterSpacing: 1,
  },
  seekTrack: {
    flex: 1,
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  seekFill: {
    width: '58%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#fff',
  },
  videoFooter: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  videoFooterPhone: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  videoFooterLabel: {
    color: palette.textMuted,
    fontSize: 11,
    letterSpacing: 3,
  },
  videoFooterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  videoFooterButtonsPhone: {
    width: '100%',
    flexWrap: 'wrap',
  },
  smallPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    backgroundColor: lightPillBackground,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  smallPillPhone: {
    minWidth: 108,
    alignItems: 'center',
  },
  smallPillText: {
    fontSize: 11,
    letterSpacing: 3,
    color: palette.text,
  },
  teacherLessonAddedButton: {
    marginTop: 10,
  },
  sideCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: lightSoftBackground,
    padding: 12,
  },
  teacherDateNavCard: {
    backgroundColor: mode === 'light' ? lightCardBackground : palette.surfaceSoft,
  },
  sideTitle: {
    marginTop: 8,
    fontSize: 17,
    color: palette.text,
    fontWeight: '600',
  },
  sideBody: {
    marginTop: 8,
    fontSize: 14,
    color: palette.textMuted,
  },
  lessonPackImage: {
    width: '100%',
    height: 108,
    borderRadius: 12,
    marginBottom: 6,
  },
  cardOverlineTop: {
    marginTop: 6,
  },
  emptyPill: {
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border,
    borderStyle: 'dashed',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: lightPillBackground,
  },
  emptyText: {
    color: palette.textMuted,
    fontSize: 14,
  },
  bottomCardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 28,
  },
  bottomCard: {
    flexBasis: '49%',
    flexGrow: 1,
    minWidth: 320,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: lightSoftBackground,
    padding: 16,
  },
  bottomCardTitle: {
    marginTop: 8,
    fontSize: 17,
    color: palette.text,
    fontWeight: '600',
  },
  bottomCardBody: {
    marginTop: 8,
    fontSize: 14,
    color: palette.textMuted,
  },
  heroCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: palette.border,
    shadowColor: palette.shadow,
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
    backgroundColor: lightPillBackground,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: palette.border,
    shadowColor: palette.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: palette.text,
  },
  cardBody: {
    marginTop: 8,
    fontSize: 14,
    color: palette.textMuted,
  },
});
};
