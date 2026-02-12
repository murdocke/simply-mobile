import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { AppShell } from '@/components/app-shell';
import { useAppTheme } from '@/components/theme/app-theme-provider';
import { getMenusForRole, getRoleFromUser } from '@/constants/menus';

const posts = [
  {
    title: 'Why Teach Simply Music',
    excerpt:
      'I want to share something I’ve been reflecting on as a teacher — not as a criticism of traditional classical training, but as an explanation of why I choose to teach the way I do. Traditional classical music education has given the world incredible discipline, structure, and musical literacy. It teaches focus, perseverance, and attention…',
  },
  {
    title: 'Traditional Lessons and Pain/Injury',
    excerpt:
      'I’m really interested in everyone’s perspective. Multiple studies over decades report that roughly 50–70% of musicians (including pianists) experience playing-related musculoskeletal pain or injury during their training or careers. Given that traditional piano pedagogy relies heavily on standardised posture rules, prescribed hand positions, and visual ideals of “correct” technique, how do you reconcile those injury…',
  },
  {
    title: 'Shoo-fly as Blues Piece',
    excerpt:
      'Subsequent to Unmani M.’s post regarding “Shoo-fly” arrangement from Arrangements 3 (originally taught in Level 5), I thought I’d take a moment to revive a discussion from more than a DECADE ago about the fact that Shoo-fly is a BLUES piece 😎. For reference you can view the previous discussion on Simpedia here (https://simpedia.info/shoo-fly-blues), or…',
  },
  {
    title: 'Piano Journey Journal',
    excerpt:
      'My adult student made this book with the help of chat GPT. He has included some inspiration messages for himself, some aspirations as a musician and a repertoire. Title: My Piano Journey: One Note at a Time Text on the back page: THIS MUSIC BOOK IS A REFLECTION OF MY JOURNEY — A GROWING COLLECTION…',
  },
  {
    title: 'Explaining Enrollment Fees',
    excerpt:
      'Here’s a first! For those who have an initial or annual enrollment fee, have you ever had anyone ask you to “explain the enrollment fee and what that goes to?” How did you answer? I feel kinda weirded by it. I’ve signed up my son for all kinds of activities and never once thought to…',
  },
  {
    title: 'Mooz Online Lessons',
    excerpt:
      'Anyone tried Mooz for online lessons? Thanks ahead of time for your sharing your thoughts. Yes. It’s great 👍 Equal quality to Rockoutloud but easier to use and easier onboarding for students. Ian B. The cost is double compared to Zoom, right? Kym N. Compared to Zoom it’s $10 more per month for pro plan.…',
  },
  {
    title: 'Parent Support Kit',
    excerpt:
      'I thought i would share this with you. Its a parent support kit i put together you are all more than welcome to use it if it helps you Scott Jones’ Expanded Parent Support Toolkit Original conversation started May 3, 2025',
  },
  {
    title: 'Here to Stay A Chords',
    excerpt:
      'Jazz Clue 2 questions. 😊 What to play in “Here to Stay”, measure 4, LH? Playing A7 on every beat sounds too ‘vanilla’. Also, any voicing suggestions for the final measure? Ok, here’s my response: Neil’s Video Answer It is basically the Fly Me To The Moon progression and I just can’t help but hear…',
  },
  {
    title: 'High Five C Chord',
    excerpt:
      'If using Jazz Clue 2 in “High Five”, what do you have students do in meas. 15 with the “C” chord? An open 5th sounds odd to me. Here ya go Ruth! Neil’s Video Answer As a general rule with JC2, one can pretend Major chords are Major 7ths (and similarly pretend that Minor chords…',
  },
  {
    title: 'Shortening Rhythmic Phrases',
    excerpt:
      'I find that my students who don’t like to sing often shorten the ends of phrases in Dreams, Dog, Sleeping, Fur Elise, etc. so they have to work at unlearning, then learning the correct rhythm by singing with me, reviewing the audio, playing with the audio. Yes, I emphasize using the voice, and yes we…',
  },
];

export default function SimpediaScreen() {
  const { palette } = useAppTheme();
  const { width } = useWindowDimensions();
  const isPhone = width < 640;
  const styles = useMemo(() => createStyles(palette), [palette]);
  const { user } = useLocalSearchParams<{ user?: string }>();
  const role = getRoleFromUser(user);
  const { menu, quick } = getMenusForRole(role);

  return (
    <AppShell
      title="Latest Posts"
      subtitle="Browse the latest articles on Simpedia"
      menuItems={menu}
      quickActions={quick}
      user={user}>
      <View style={[styles.header, isPhone && styles.headerPhone]}>
        <Text style={styles.overline}>SIMPEDIA</Text>
        <Text style={[styles.pageTitle, isPhone && styles.pageTitlePhone]}>Latest Posts</Text>
        <Text style={styles.pageSubtitle}>Browse the latest articles on Simpedia</Text>
      </View>

      <View style={[styles.feedCard, isPhone && styles.feedCardPhone]}>
        {posts.map((post) => (
          <View key={post.title} style={styles.postCard}>
            <Text style={styles.postTitle}>{post.title}</Text>
            <Text style={styles.postBody}>{post.excerpt}</Text>
            <Pressable style={styles.readMoreButton}>
              <Text style={styles.readMoreText}>Read more</Text>
            </Pressable>
          </View>
        ))}
      </View>
    </AppShell>
  );
}

const createStyles = (palette: ReturnType<typeof useAppTheme>['palette']) =>
  StyleSheet.create({
  header: {
    marginBottom: 14,
  },
  headerPhone: {
    marginBottom: 10,
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
  pageTitlePhone: {
    fontSize: 34,
    marginTop: 6,
  },
  pageSubtitle: {
    marginTop: 8,
    fontSize: 15,
    color: palette.textMuted,
  },
  feedCard: {
    borderRadius: 16,
    backgroundColor: palette.background,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 16,
    marginBottom: 28,
  },
  feedCardPhone: {
    padding: 12,
    marginBottom: 20,
  },
  postCard: {
    borderRadius: 14,
    backgroundColor: palette.surfaceSoft,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 14,
    marginBottom: 10,
    shadowColor: palette.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  postTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: palette.text,
  },
  postBody: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 22,
    color: palette.textMuted,
  },
  readMoreButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    backgroundColor: palette.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  readMoreText: {
    fontSize: 13,
    letterSpacing: 1.2,
    color: palette.textMuted,
  },
});
