import { StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams } from 'expo-router';

import { AppShell } from '@/components/app-shell';
import { getMenusForRole, getRoleFromUser } from '@/constants/menus';

export default function CurriculumScreen() {
  const { user } = useLocalSearchParams<{ user?: string }>();
  const role = getRoleFromUser(user);
  const { menu, quick } = getMenusForRole(role);

  return (
    <AppShell
      title="Curriculum"
      subtitle="Lesson plans and progress tracking."
      menuItems={menu}
      quickActions={quick}
      user={user}>
      <View style={styles.lessonCard}>
        <View style={styles.videoFrame}>
          <WebView
            source={{
              uri: 'https://player.vimeo.com/video/35117474?title=0&byline=0&portrait=0',
            }}
            style={styles.video}
            originWhitelist={['*']}
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            allowsFullscreenVideo
          />
        </View>
        <View style={styles.lessonBody}>
          <Text style={styles.lessonOverline}>Lesson Title</Text>
          <Text style={styles.lessonTitle}>Piano Foundations: Touch &amp; Dynamics</Text>
          <Text style={styles.lessonSubtitle}>
            Subtitle: Building expressive touch with a dynamic palette.
          </Text>

          <View style={styles.metaRow}>
            <View style={[styles.metaCard, styles.metaWarm]}>
              <Text style={styles.metaLabel}>Date Added</Text>
              <Text style={styles.metaValue}>Jan 22, 2026</Text>
            </View>
            <View style={[styles.metaCard, styles.metaCool]}>
              <Text style={styles.metaLabel}>Lesson Date</Text>
              <Text style={styles.metaValue}>Feb 4, 2026</Text>
            </View>
            <View style={[styles.metaCard, styles.metaMint]}>
              <Text style={styles.metaLabel}>Duration</Text>
              <Text style={styles.metaValue}>42 min</Text>
            </View>
          </View>

          <View style={styles.progressCard}>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Progress</Text>
              <Text style={styles.progressValue}>65% watched</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={styles.progressFill} />
            </View>
            <View style={styles.nextPill}>
              <Text style={styles.nextText}>Next: Touch &amp; Dynamics Drill</Text>
            </View>
          </View>
        </View>
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2a2a2a',
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#f7efe2',
    borderWidth: 1,
    borderColor: '#ead9bf',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8b5b1a',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#7b7772',
    marginBottom: 16,
  },
  lessonCard: {
    backgroundColor: '#fff',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    overflow: 'hidden',
  },
  videoFrame: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#111',
  },
  video: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  lessonBody: {
    padding: 18,
  },
  lessonOverline: {
    fontSize: 11,
    letterSpacing: 2,
    color: '#9b938c',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  lessonTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2a2a2a',
  },
  lessonSubtitle: {
    marginTop: 6,
    fontSize: 13,
    color: '#7b7772',
  },
  metaRow: {
    marginTop: 16,
    gap: 10,
  },
  metaCard: {
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
  },
  metaWarm: {
    backgroundColor: '#fbf2e4',
    borderColor: '#efdfc2',
  },
  metaCool: {
    backgroundColor: '#eef5ff',
    borderColor: '#d8e6fb',
  },
  metaMint: {
    backgroundColor: '#eef7f1',
    borderColor: '#d9ece0',
  },
  metaLabel: {
    fontSize: 11,
    letterSpacing: 1.4,
    color: '#8b7c6c',
    textTransform: 'uppercase',
  },
  metaValue: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#2a2a2a',
  },
  progressCard: {
    marginTop: 16,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#f8f6f3',
    borderWidth: 1,
    borderColor: '#ece6dd',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 11,
    letterSpacing: 1.5,
    color: '#9b938c',
    textTransform: 'uppercase',
  },
  progressValue: {
    fontSize: 12,
    color: '#6f6a66',
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: '#ebe6de',
  },
  progressFill: {
    width: '65%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#c8102e',
  },
  nextPill: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d9dfe8',
    backgroundColor: '#f7f9fc',
  },
  nextText: {
    fontSize: 12,
    color: '#2a2a2a',
  },
});
