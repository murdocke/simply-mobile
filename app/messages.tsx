import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { AppShell } from '@/components/app-shell';
import { useAppTheme } from '@/components/theme/app-theme-provider';
import { getMenusForRole, getRoleFromUser } from '@/constants/menus';

type Thread = {
  id: string;
  name: string;
  email?: string;
  status: 'online' | 'offline';
  unread?: number;
  lastSeen?: string;
};

type Message = {
  id: string;
  author: 'teacher' | 'student';
  body: string;
  sentAt: string;
};

const teacherThreads: Thread[] = [
  { id: 'addy', name: 'Addy', email: 'addy.austin@gmail.com', status: 'offline', unread: 0, lastSeen: '2h ago' },
  { id: 'adri', name: 'Adri', email: 'adri@gmail.com', status: 'online', unread: 2, lastSeen: 'now' },
  { id: 'ames', name: 'Ames', email: 'apenn81@yahoo.com', status: 'offline', unread: 0, lastSeen: 'Yesterday' },
];

const studentThreads: Thread[] = [
  { id: 'brian', name: 'Brian G.', status: 'online', unread: 1, lastSeen: 'now' },
  { id: 'studio', name: 'Simply Music Team', status: 'offline', unread: 0, lastSeen: 'Yesterday' },
];

const teacherMessagesByThread: Record<string, Message[]> = {
  addy: [],
  adri: [
    { id: '1', author: 'student', body: 'Can I move my lesson to Thursday?', sentAt: '9:14 AM' },
    { id: '2', author: 'teacher', body: 'Yes, Thursday at 6:00 PM works.', sentAt: '9:16 AM' },
  ],
  ames: [{ id: '3', author: 'teacher', body: 'Great progress this week. Keep reviewing Level 2.', sentAt: 'Yesterday' }],
};

const studentMessagesByThread: Record<string, Message[]> = {
  brian: [
    { id: '1', author: 'teacher', body: 'Great work on Dreams Come True this week.', sentAt: 'Yesterday' },
    { id: '2', author: 'student', body: 'Thanks. I will keep practicing the bridge section.', sentAt: 'Yesterday' },
  ],
  studio: [],
};

export default function MessagesScreen() {
  const { palette, mode } = useAppTheme();
  const styles = useMemo(() => createStyles(palette, mode), [palette, mode]);
  const { width } = useWindowDimensions();
  const isPhone = width < 740;
  const { user } = useLocalSearchParams<{ user?: string }>();
  const role = getRoleFromUser(user);
  const { menu, quick } = getMenusForRole(role);
  const isTeacherView = role === 'teacher';
  const [teacherThreadId, setTeacherThreadId] = useState(teacherThreads[0]?.id ?? '');
  const [studentThreadId, setStudentThreadId] = useState(studentThreads[0]?.id ?? '');
  const [draft, setDraft] = useState('');

  const activeTeacherThread = teacherThreads.find((thread) => thread.id === teacherThreadId) ?? teacherThreads[0];
  const activeTeacherMessages =
    (activeTeacherThread ? teacherMessagesByThread[activeTeacherThread.id] : undefined) ?? [];
  const activeStudentThread = studentThreads.find((thread) => thread.id === studentThreadId) ?? studentThreads[0];
  const activeStudentMessages =
    (activeStudentThread ? studentMessagesByThread[activeStudentThread.id] : undefined) ?? [];

  return (
    <AppShell
      title="Messages"
      subtitle={
        isTeacherView
          ? 'Keep track of student conversations and studio updates in one place.'
          : 'Stay connected with your teacher and studio updates.'
      }
      menuItems={menu}
      quickActions={quick}
      user={user}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageOverline}>{isTeacherView ? 'TEACHERS' : 'STUDENTS'}</Text>
        <Text style={styles.pageTitle}>Messages</Text>
        <Text style={styles.pageSubtitle}>
          {isTeacherView
            ? 'Keep track of student conversations and studio updates in one place.'
            : 'Stay connected with your teacher and studio updates.'}
        </Text>
      </View>

      {isTeacherView ? (
        <View style={styles.workspaceCard}>
          <View style={[styles.workspaceTop, isPhone && styles.workspaceTopPhone]}>
            <View>
              <Text style={styles.sectionTitle}>Send a message</Text>
              <Text style={styles.sectionSubtitle}>Select a recipient and send a quick update or note.</Text>
            </View>
            <Text style={styles.statusHint}>MESSAGES SYNC IN REAL TIME.</Text>
          </View>

          <View style={[styles.workspaceBody, isPhone && styles.workspaceBodyPhone]}>
            <View style={[styles.leftRail, isPhone && styles.leftRailPhone]}>
              <View style={styles.railCard}>
                <Text style={styles.railOverline}>Recipient</Text>
                <View style={styles.currentRecipientCard}>
                  <Text style={styles.currentRecipientLabel}>CURRENT</Text>
                  <Text style={styles.currentRecipientName}>{activeTeacherThread?.name}</Text>
                  <Text style={styles.currentRecipientMeta}>{activeTeacherThread?.email}</Text>
                </View>
                <Pressable style={styles.ghostButton}>
                  <Text style={styles.ghostButtonText}>CHOOSE RECIPIENT</Text>
                </Pressable>
              </View>

              <View style={styles.railCard}>
                <View style={styles.railHeadRow}>
                  <Text style={styles.railOverline}>Threads</Text>
                  <Text style={styles.railCount}>
                    {teacherThreads.filter((thread) => (thread.unread ?? 0) > 0).length} Active
                  </Text>
                </View>
                <View style={styles.threadList}>
                  {teacherThreads.map((thread) => {
                    const active = thread.id === activeTeacherThread?.id;
                    return (
                      <Pressable
                        key={thread.id}
                        style={[styles.threadRow, active && styles.threadRowActive]}
                        onPress={() => setTeacherThreadId(thread.id)}>
                        <View style={styles.threadRowMain}>
                          <Text style={[styles.threadName, active && styles.threadNameActive]}>{thread.name}</Text>
                          <Text style={styles.threadMeta}>{thread.lastSeen}</Text>
                        </View>
                        {thread.unread ? (
                          <View style={styles.unreadBadge}>
                            <Text style={styles.unreadBadgeText}>{thread.unread}</Text>
                          </View>
                        ) : null}
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>

            <View style={styles.conversationCard}>
              <View style={styles.conversationTop}>
                <View>
                  <Text style={styles.conversationOverline}>Conversation</Text>
                  <Text style={styles.conversationName}>{activeTeacherThread?.name}</Text>
                </View>
                <View style={styles.statusPill}>
                  <Text style={styles.statusPillText}>{activeTeacherThread?.status ?? 'offline'}</Text>
                </View>
              </View>

              <View style={styles.messageArea}>
                {activeTeacherMessages.length === 0 ? (
                  <View style={styles.emptyMessageCard}>
                    <Text style={styles.emptyMessageText}>No messages yet. Send a note to start the conversation.</Text>
                  </View>
                ) : (
                  <ScrollView contentContainerStyle={styles.messagesScroll}>
                    {activeTeacherMessages.map((message) => {
                      const mine = message.author === 'teacher';
                      return (
                        <View key={message.id} style={[styles.messageBubble, mine && styles.messageBubbleMine]}>
                          <Text style={[styles.messageText, mine && styles.messageTextMine]}>{message.body}</Text>
                          <Text style={[styles.messageTime, mine && styles.messageTimeMine]}>{message.sentAt}</Text>
                        </View>
                      );
                    })}
                  </ScrollView>
                )}
              </View>

              <View style={styles.replyWrap}>
                <View style={styles.replyHead}>
                  <View>
                    <Text style={styles.replyOverline}>Reply</Text>
                    <Text style={styles.replyHint}>Type your message. Press send to deliver instantly.</Text>
                  </View>
                </View>
                <TextInput
                  multiline
                  value={draft}
                  onChangeText={setDraft}
                  placeholder="Type your message..."
                  placeholderTextColor={palette.textMuted}
                  style={styles.replyInput}
                />
                <View style={styles.replyActions}>
                  <Pressable
                    style={[styles.primaryAction, draft.trim().length === 0 && styles.primaryActionDisabled]}
                    disabled={draft.trim().length === 0}>
                    <Text style={styles.primaryActionText}>SEND</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.workspaceCard}>
          <View style={[styles.workspaceBody, isPhone && styles.workspaceBodyPhone]}>
            <View style={[styles.leftRail, isPhone && styles.leftRailPhone]}>
              <View style={styles.railCard}>
                <Text style={styles.railOverline}>Inbox</Text>
                <View style={styles.threadList}>
                  {studentThreads.map((thread) => {
                    const active = thread.id === activeStudentThread?.id;
                    return (
                      <Pressable
                        key={thread.id}
                        style={[styles.threadRow, active && styles.threadRowActive]}
                        onPress={() => setStudentThreadId(thread.id)}>
                        <View style={styles.threadRowMain}>
                          <Text style={[styles.threadName, active && styles.threadNameActive]}>{thread.name}</Text>
                          <Text style={styles.threadMeta}>{thread.lastSeen}</Text>
                        </View>
                        {thread.unread ? (
                          <View style={styles.unreadBadge}>
                            <Text style={styles.unreadBadgeText}>{thread.unread}</Text>
                          </View>
                        ) : null}
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>

            <View style={styles.conversationCard}>
              <View style={styles.conversationTop}>
                <View>
                  <Text style={styles.conversationOverline}>Conversation</Text>
                  <Text style={styles.conversationName}>{activeStudentThread?.name}</Text>
                </View>
                <View style={styles.statusPill}>
                  <Text style={styles.statusPillText}>{activeStudentThread?.status ?? 'offline'}</Text>
                </View>
              </View>

              <View style={styles.messageArea}>
                {activeStudentMessages.length === 0 ? (
                  <View style={styles.emptyMessageCard}>
                    <Text style={styles.emptyMessageText}>No messages yet.</Text>
                  </View>
                ) : (
                  <ScrollView contentContainerStyle={styles.messagesScroll}>
                    {activeStudentMessages.map((message) => {
                      const mine = message.author === 'student';
                      return (
                        <View key={message.id} style={[styles.messageBubble, mine && styles.messageBubbleMine]}>
                          <Text style={[styles.messageText, mine && styles.messageTextMine]}>{message.body}</Text>
                          <Text style={[styles.messageTime, mine && styles.messageTimeMine]}>{message.sentAt}</Text>
                        </View>
                      );
                    })}
                  </ScrollView>
                )}
              </View>

              <View style={styles.replyWrap}>
                <View style={styles.replyHead}>
                  <View>
                    <Text style={styles.replyOverline}>Reply</Text>
                    <Text style={styles.replyHint}>Message your teacher about this week&apos;s lesson.</Text>
                  </View>
                </View>
                <TextInput
                  multiline
                  value={draft}
                  onChangeText={setDraft}
                  placeholder="Write a message..."
                  placeholderTextColor={palette.textMuted}
                  style={styles.replyInput}
                />
                <View style={styles.replyActions}>
                  <Pressable
                    style={[styles.primaryAction, draft.trim().length === 0 && styles.primaryActionDisabled]}
                    disabled={draft.trim().length === 0}>
                    <Text style={styles.primaryActionText}>SEND</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}
    </AppShell>
  );
}

const createStyles = (palette: ReturnType<typeof useAppTheme>['palette'], mode: 'light' | 'dark') =>
  StyleSheet.create({
    pageHeader: {
      marginBottom: 14,
    },
    pageOverline: {
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
    workspaceCard: {
      borderRadius: 20,
      backgroundColor: palette.surface,
      borderWidth: 1,
      borderColor: palette.border,
      padding: 14,
      marginBottom: 28,
    },
    workspaceTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderBottomColor: palette.border,
      paddingBottom: 12,
      marginBottom: 12,
      gap: 14,
    },
    workspaceTopPhone: {
      flexDirection: 'column',
      alignItems: 'flex-start',
    },
    sectionTitle: {
      fontSize: 34,
      fontWeight: '600',
      color: palette.text,
    },
    sectionSubtitle: {
      marginTop: 4,
      color: palette.textMuted,
      fontSize: 14,
    },
    statusHint: {
      color: palette.textMuted,
      letterSpacing: 2.3,
      fontSize: 11,
      textTransform: 'uppercase',
    },
    workspaceBody: {
      flexDirection: 'row',
      gap: 12,
      minHeight: 520,
    },
    workspaceBodyPhone: {
      flexDirection: 'column',
      minHeight: 0,
    },
    leftRail: {
      width: 270,
      gap: 12,
    },
    leftRailPhone: {
      width: '100%',
    },
    railCard: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.surfaceSoft,
      padding: 12,
    },
    railOverline: {
      color: palette.textMuted,
      letterSpacing: 3.2,
      fontSize: 11,
      textTransform: 'uppercase',
      fontWeight: '600',
      marginBottom: 10,
    },
    railHeadRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    railCount: {
      color: palette.textMuted,
      fontSize: 12,
      fontWeight: '600',
    },
    currentRecipientCard: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.surface,
      padding: 10,
      marginBottom: 10,
    },
    currentRecipientLabel: {
      color: palette.textMuted,
      letterSpacing: 2.3,
      fontSize: 10,
      textTransform: 'uppercase',
      marginBottom: 6,
    },
    currentRecipientName: {
      color: palette.text,
      fontSize: 30,
      fontWeight: '600',
      lineHeight: 34,
    },
    currentRecipientMeta: {
      color: palette.textMuted,
      fontSize: 13,
      marginTop: 2,
    },
    ghostButton: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: palette.borderStrong,
      backgroundColor: palette.surface,
      alignItems: 'center',
      paddingVertical: 9,
    },
    ghostButtonText: {
      color: palette.textMuted,
      fontSize: 12,
      letterSpacing: 2.6,
      fontWeight: '700',
    },
    threadList: {
      gap: 8,
    },
    threadRow: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.surface,
      paddingHorizontal: 10,
      paddingVertical: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    threadRowActive: {
      borderColor: palette.primary,
      backgroundColor: palette.surfaceSoft,
    },
    threadRowMain: {
      flex: 1,
    },
    threadName: {
      color: palette.text,
      fontSize: 14,
      fontWeight: '600',
    },
    threadNameActive: {
      color: palette.primary,
    },
    threadMeta: {
      color: palette.textMuted,
      fontSize: 12,
      marginTop: 2,
    },
    unreadBadge: {
      minWidth: 22,
      height: 22,
      borderRadius: 999,
      paddingHorizontal: 7,
      backgroundColor: palette.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    unreadBadgeText: {
      color: '#fff',
      fontSize: 11,
      fontWeight: '700',
    },
    conversationCard: {
      flex: 1,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.surfaceSoft,
      overflow: 'hidden',
      minHeight: 420,
    },
    conversationTop: {
      backgroundColor: mode === 'dark' ? 'rgba(71, 64, 58, 0.55)' : '#dceaf8',
      borderBottomWidth: 1,
      borderBottomColor: palette.border,
      paddingHorizontal: 14,
      paddingVertical: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 10,
    },
    conversationOverline: {
      color: palette.textMuted,
      letterSpacing: 3.2,
      fontSize: 11,
      textTransform: 'uppercase',
      marginBottom: 4,
    },
    conversationName: {
      color: palette.text,
      fontSize: 22,
      fontWeight: '600',
      lineHeight: 26,
    },
    statusPill: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: palette.borderStrong,
      backgroundColor: palette.surface,
      paddingHorizontal: 14,
      paddingVertical: 6,
    },
    statusPillText: {
      color: palette.textMuted,
      fontSize: 12,
      letterSpacing: 2.4,
      textTransform: 'uppercase',
      fontWeight: '700',
    },
    messageArea: {
      flex: 1,
      padding: 14,
      minHeight: 220,
    },
    emptyMessageCard: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: palette.border,
      borderStyle: 'dashed',
      backgroundColor: palette.surface,
      minHeight: 70,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 12,
    },
    emptyMessageText: {
      color: palette.textMuted,
      fontSize: 14,
      textAlign: 'center',
    },
    messagesScroll: {
      gap: 8,
      paddingBottom: 8,
    },
    messageBubble: {
      alignSelf: 'flex-start',
      maxWidth: '84%',
      borderRadius: 14,
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.surface,
      paddingHorizontal: 11,
      paddingVertical: 8,
    },
    messageBubbleMine: {
      alignSelf: 'flex-end',
      backgroundColor: palette.primary,
      borderColor: palette.primary,
    },
    messageText: {
      color: palette.text,
      fontSize: 14,
      lineHeight: 20,
    },
    messageTextMine: {
      color: '#fff',
    },
    messageTime: {
      color: palette.textMuted,
      fontSize: 11,
      marginTop: 4,
    },
    messageTimeMine: {
      color: 'rgba(255,255,255,0.84)',
      textAlign: 'right',
    },
    replyWrap: {
      borderTopWidth: 1,
      borderTopColor: palette.border,
      backgroundColor: mode === 'dark' ? 'rgba(71, 64, 58, 0.55)' : '#e8f3ff',
      padding: 12,
      gap: 8,
    },
    replyHead: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 8,
    },
    replyOverline: {
      color: palette.textMuted,
      letterSpacing: 3.2,
      fontSize: 11,
      textTransform: 'uppercase',
      marginBottom: 4,
    },
    replyHint: {
      color: palette.textMuted,
      fontSize: 14,
    },
    replyInput: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.surface,
      paddingHorizontal: 12,
      paddingVertical: 10,
      minHeight: 78,
      textAlignVertical: 'top',
      color: palette.text,
      fontSize: 14,
    },
    replyActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    primaryAction: {
      borderRadius: 999,
      backgroundColor: palette.primary,
      borderWidth: 1,
      borderColor: palette.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    primaryActionDisabled: {
      opacity: 0.45,
    },
    primaryActionText: {
      color: '#fff',
      fontSize: 12,
      letterSpacing: 1.9,
      fontWeight: '700',
    },
  });
