import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { AppShell } from '@/components/app-shell';
import { useAppTheme } from '@/components/theme/app-theme-provider';
import { getMenusForRole, getRoleFromUser } from '@/constants/menus';

type ReactionKey = 'love' | 'helpful' | 'inspired';

type Comment = {
  id: string;
  author: string;
  text: string;
  postedAt: string;
};

type CommunicationPost = {
  id: string;
  title: string;
  body: string;
  category: string;
  publishedAt: string;
  reactions: Record<ReactionKey, number>;
  comments: Comment[];
};

const reactionLabels: Record<ReactionKey, string> = {
  love: 'Love',
  helpful: 'Helpful',
  inspired: 'Inspired',
};

const seedPosts: CommunicationPost[] = [
  {
    id: 'p1',
    title: 'Studio Schedule Reminder',
    body: 'Please arrive five minutes early this week so we can settle in and start on time.',
    category: 'STUDIO UPDATE',
    publishedAt: 'Today, 8:10 AM',
    reactions: { love: 12, helpful: 9, inspired: 5 },
    comments: [
      { id: 'c1', author: 'Quinn F.', text: 'Thanks for the reminder.', postedAt: 'Today, 8:24 AM' },
      { id: 'c2', author: 'Ayaan M.', text: 'Got it. We will be there early.', postedAt: 'Today, 8:33 AM' },
    ],
  },
  {
    id: 'p2',
    title: 'Practice Focus for This Week',
    body: 'Spend extra time on smooth transitions between sections. Keep a steady pulse through the bridge.',
    category: 'PRACTICE',
    publishedAt: 'Yesterday, 4:20 PM',
    reactions: { love: 18, helpful: 14, inspired: 11 },
    comments: [{ id: 'c3', author: 'Adri B.', text: 'This helped a lot in practice today.', postedAt: 'Yesterday, 6:05 PM' }],
  },
];

export default function CommunicationsScreen() {
  const { palette } = useAppTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const { width } = useWindowDimensions();
  const isPhone = width < 760;
  const { user } = useLocalSearchParams<{ user?: string }>();
  const role = getRoleFromUser(user);
  const { menu, quick } = getMenusForRole(role);
  const canPublish = role === 'teacher';
  const canParticipate = role === 'teacher' || role === 'student';
  const viewerName = role === 'teacher' ? 'Brian G.' : role === 'student' ? 'Quinn F.' : 'Neil M.';

  const [posts, setPosts] = useState(seedPosts);
  const [postTitle, setPostTitle] = useState('');
  const [postBody, setPostBody] = useState('');
  const [reactionByPost, setReactionByPost] = useState<Record<string, ReactionKey | undefined>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});

  const publishDisabled = postTitle.trim().length < 3 || postBody.trim().length < 8;

  const handlePublish = () => {
    if (publishDisabled) return;
    const newPost: CommunicationPost = {
      id: `${Date.now()}`,
      title: postTitle.trim(),
      body: postBody.trim(),
      category: 'ANNOUNCEMENT',
      publishedAt: 'Just now',
      reactions: { love: 0, helpful: 0, inspired: 0 },
      comments: [],
    };
    setPosts((prev) => [newPost, ...prev]);
    setPostTitle('');
    setPostBody('');
  };

  const handleReaction = (postId: string, nextReaction: ReactionKey) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        const current = reactionByPost[postId];
        const nextCounts = { ...post.reactions };
        if (current) {
          nextCounts[current] = Math.max(0, nextCounts[current] - 1);
        }
        if (current !== nextReaction) {
          nextCounts[nextReaction] += 1;
        }
        return { ...post, reactions: nextCounts };
      })
    );
    setReactionByPost((prev) => ({
      ...prev,
      [postId]: prev[postId] === nextReaction ? undefined : nextReaction,
    }));
  };

  const handleAddComment = (postId: string) => {
    const draft = (commentDrafts[postId] ?? '').trim();
    if (!draft) return;
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        const nextComment: Comment = {
          id: `${postId}-${Date.now()}`,
          author: viewerName,
          text: draft,
          postedAt: 'Just now',
        };
        return { ...post, comments: [...post.comments, nextComment] };
      })
    );
    setCommentDrafts((prev) => ({ ...prev, [postId]: '' }));
  };

  return (
    <AppShell
      title="Communications"
      subtitle={
        role === 'teacher'
          ? 'Share updates with students and keep everyone in sync.'
          : 'Follow teacher updates, react, and join the conversation.'
      }
      menuItems={menu}
      quickActions={quick}
      user={user}>
      <View style={styles.pageHeader}>
        <Text style={styles.overline}>{role === 'student' ? 'STUDENTS' : role === 'teacher' ? 'TEACHERS' : 'COMPANY'}</Text>
        <Text style={styles.pageTitle}>Communications</Text>
        <Text style={styles.pageSubtitle}>
          {role === 'teacher'
            ? 'Share updates with students and keep everyone in sync.'
            : 'Follow teacher updates, react, and join the conversation.'}
        </Text>
      </View>

      {canPublish ? (
        <View style={styles.composeCard}>
          <Text style={styles.composeTitle}>Create Update</Text>
          <Text style={styles.composeSubtitle}>Publish a post for students in your studio feed.</Text>
          <TextInput
            value={postTitle}
            onChangeText={setPostTitle}
            placeholder="Post title"
            placeholderTextColor={palette.textMuted}
            style={styles.composeTitleInput}
          />
          <TextInput
            multiline
            value={postBody}
            onChangeText={setPostBody}
            placeholder="Write your update..."
            placeholderTextColor={palette.textMuted}
            style={styles.composeBodyInput}
          />
          <View style={styles.composeActions}>
            <Pressable
              style={[styles.publishButton, publishDisabled && styles.publishButtonDisabled]}
              onPress={handlePublish}
              disabled={publishDisabled}>
              <Text style={styles.publishButtonText}>POST UPDATE</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={styles.viewerCard}>
          <Text style={styles.viewerCardTitle}>Studio Feed</Text>
          <Text style={styles.viewerCardBody}>Latest updates from your teacher and studio community.</Text>
        </View>
      )}

      <View style={styles.feedWrap}>
        {posts.map((post) => (
          <View key={post.id} style={styles.postCard}>
            <View style={[styles.postHead, isPhone && styles.postHeadPhone]}>
              <View style={styles.postHeadMain}>
                <Text style={styles.postCategory}>{post.category}</Text>
                <Text style={styles.postTitle}>{post.title}</Text>
              </View>
              <Text style={styles.postDate}>{post.publishedAt}</Text>
            </View>

            <Text style={styles.postBody}>{post.body}</Text>

            <View style={[styles.reactionRow, isPhone && styles.reactionRowPhone]}>
              {(Object.keys(reactionLabels) as ReactionKey[]).map((reaction) => {
                const isActive = reactionByPost[post.id] === reaction;
                return (
                  <Pressable
                    key={reaction}
                    style={[styles.reactionButton, isActive && styles.reactionButtonActive]}
                    onPress={() => handleReaction(post.id, reaction)}
                    disabled={!canParticipate}>
                    <Text style={[styles.reactionButtonText, isActive && styles.reactionButtonTextActive]}>
                      {reactionLabels[reaction]} · {post.reactions[reaction]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.commentSection}>
              <Text style={styles.commentLabel}>Comments</Text>
              {post.comments.length === 0 ? (
                <View style={styles.commentEmptyCard}>
                  <Text style={styles.commentEmptyText}>No comments yet.</Text>
                </View>
              ) : (
                <View style={styles.commentList}>
                  {post.comments.map((comment) => (
                    <View key={comment.id} style={styles.commentRow}>
                      <Text style={styles.commentAuthor}>{comment.author}</Text>
                      <Text style={styles.commentBody}>{comment.text}</Text>
                      <Text style={styles.commentMeta}>{comment.postedAt}</Text>
                    </View>
                  ))}
                </View>
              )}

              {canParticipate ? (
                <View style={styles.commentComposer}>
                  <TextInput
                    value={commentDrafts[post.id] ?? ''}
                    onChangeText={(value) => setCommentDrafts((prev) => ({ ...prev, [post.id]: value }))}
                    placeholder="Add a comment..."
                    placeholderTextColor={palette.textMuted}
                    style={styles.commentInput}
                  />
                  <Pressable
                    style={[
                      styles.commentSendButton,
                      !(commentDrafts[post.id] ?? '').trim() && styles.commentSendButtonDisabled,
                    ]}
                    onPress={() => handleAddComment(post.id)}
                    disabled={!(commentDrafts[post.id] ?? '').trim()}>
                    <Text style={styles.commentSendText}>SEND</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          </View>
        ))}
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
    composeCard: {
      backgroundColor: palette.surface,
      borderRadius: 18,
      padding: 14,
      borderWidth: 1,
      borderColor: palette.border,
      marginBottom: 12,
    },
    composeTitle: {
      fontSize: 26,
      fontWeight: '600',
      color: palette.text,
    },
    composeSubtitle: {
      marginTop: 5,
      fontSize: 14,
      color: palette.textMuted,
    },
    composeTitleInput: {
      marginTop: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.surfaceSoft,
      color: palette.text,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      fontWeight: '600',
    },
    composeBodyInput: {
      marginTop: 8,
      minHeight: 100,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.surfaceSoft,
      color: palette.text,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 14,
      textAlignVertical: 'top',
    },
    composeActions: {
      marginTop: 10,
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    publishButton: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: palette.primary,
      backgroundColor: palette.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    publishButtonDisabled: {
      opacity: 0.4,
    },
    publishButtonText: {
      color: '#fff',
      fontSize: 11,
      letterSpacing: 2,
      fontWeight: '700',
    },
    viewerCard: {
      backgroundColor: palette.surface,
      borderRadius: 18,
      padding: 14,
      borderWidth: 1,
      borderColor: palette.border,
      marginBottom: 12,
    },
    viewerCardTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: palette.text,
    },
    viewerCardBody: {
      marginTop: 8,
      fontSize: 14,
      color: palette.textMuted,
    },
    feedWrap: {
      gap: 12,
      paddingBottom: 28,
    },
    postCard: {
      backgroundColor: palette.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: palette.border,
      padding: 14,
    },
    postHead: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 8,
    },
    postHeadPhone: {
      flexDirection: 'column',
    },
    postHeadMain: {
      flex: 1,
    },
    postCategory: {
      color: '#c13b3f',
      fontSize: 10,
      letterSpacing: 2.6,
      fontWeight: '700',
    },
    postTitle: {
      marginTop: 6,
      color: palette.text,
      fontSize: 26,
      fontWeight: '600',
    },
    postDate: {
      color: palette.textMuted,
      fontSize: 12,
      letterSpacing: 1.2,
      marginTop: 2,
    },
    postBody: {
      marginTop: 8,
      color: palette.textMuted,
      fontSize: 15,
      lineHeight: 22,
    },
    reactionRow: {
      marginTop: 12,
      flexDirection: 'row',
      gap: 8,
      flexWrap: 'wrap',
    },
    reactionRowPhone: {
      gap: 6,
    },
    reactionButton: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: palette.borderStrong,
      backgroundColor: palette.surfaceSoft,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    reactionButtonActive: {
      borderColor: palette.primary,
      backgroundColor: palette.primary,
    },
    reactionButtonText: {
      color: palette.textMuted,
      fontSize: 12,
      fontWeight: '600',
    },
    reactionButtonTextActive: {
      color: '#fff',
    },
    commentSection: {
      marginTop: 12,
      borderTopWidth: 1,
      borderTopColor: palette.border,
      paddingTop: 10,
    },
    commentLabel: {
      color: palette.textMuted,
      fontSize: 11,
      letterSpacing: 2.2,
      textTransform: 'uppercase',
      marginBottom: 8,
    },
    commentEmptyCard: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: palette.border,
      borderStyle: 'dashed',
      backgroundColor: palette.surfaceSoft,
      paddingHorizontal: 10,
      paddingVertical: 10,
    },
    commentEmptyText: {
      color: palette.textMuted,
      fontSize: 13,
    },
    commentList: {
      gap: 8,
    },
    commentRow: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.surfaceSoft,
      paddingHorizontal: 10,
      paddingVertical: 9,
    },
    commentAuthor: {
      color: palette.text,
      fontSize: 13,
      fontWeight: '600',
    },
    commentBody: {
      marginTop: 4,
      color: palette.textMuted,
      fontSize: 14,
      lineHeight: 20,
    },
    commentMeta: {
      marginTop: 4,
      color: palette.textMuted,
      fontSize: 11,
      letterSpacing: 0.8,
    },
    commentComposer: {
      marginTop: 8,
      flexDirection: 'row',
      gap: 8,
      alignItems: 'center',
    },
    commentInput: {
      flex: 1,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.surfaceSoft,
      color: palette.text,
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: 14,
    },
    commentSendButton: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: palette.borderStrong,
      backgroundColor: palette.surface,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    commentSendButtonDisabled: {
      opacity: 0.45,
    },
    commentSendText: {
      color: palette.textMuted,
      fontSize: 11,
      letterSpacing: 1.8,
      fontWeight: '700',
    },
  });
