import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { AppShell } from '@/components/app-shell';
import { useAppTheme } from '@/components/theme/app-theme-provider';
import { getMenusForRole, getRoleFromUser } from '@/constants/menus';

type Priority = 'Critical' | 'High' | 'Normal';
type TicketStatus = 'Open' | 'In Progress' | 'Waiting';

type SupportTicket = {
  id: string;
  subject: string;
  account: string;
  opened: string;
  priority: Priority;
  status: TicketStatus;
  summary: string;
};

const tickets: SupportTicket[] = [
  {
    id: 'SUP-4222',
    subject: 'Loving the platform and sharing feedback',
    account: 'Bright Keys Studio',
    opened: '10:02 AM',
    priority: 'Normal',
    status: 'Open',
    summary: 'Teacher shared positive feedback about student engagement and asked for a quote format to feature.',
  },
  {
    id: 'SUP-4221',
    subject: 'Teacher certification pathway question',
    account: 'Northstar Piano Co.',
    opened: '9:37 AM',
    priority: 'High',
    status: 'Open',
    summary: 'Teacher requested guidance on certification milestones, recommended sequence, and timing.',
  },
  {
    id: 'SUP-4218',
    subject: 'Clarify billing cycle for multi-student households',
    account: 'Ava Chen Studio',
    opened: '9:12 AM',
    priority: 'High',
    status: 'Open',
    summary: 'Teacher asked for wording to explain monthly billing when siblings are enrolled together.',
  },
  {
    id: 'SUP-4216',
    subject: 'Parent praise and referral note',
    account: 'Rivera Music Lab',
    opened: '8:44 AM',
    priority: 'Normal',
    status: 'In Progress',
    summary: 'Parent shared strong progress feedback and requested a short testimonial format to publish.',
  },
  {
    id: 'SUP-4213',
    subject: 'Question about weekly practice expectations',
    account: 'Patel Piano Studio',
    opened: 'Yesterday',
    priority: 'Normal',
    status: 'Waiting',
    summary: 'Teacher asked for recommended language to align student practice goals across beginner levels.',
  },
  {
    id: 'SUP-4209',
    subject: 'Celebrate student milestone in newsletter',
    account: 'Scott Keys',
    opened: 'Yesterday',
    priority: 'Normal',
    status: 'Open',
    summary: 'Teacher requested a featured-highlight template for a student who completed a full level.',
  },
];

export default function SupportScreen() {
  const { palette } = useAppTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const { width } = useWindowDimensions();
  const isPhone = width < 780;
  const { user } = useLocalSearchParams<{ user?: string }>();
  const role = getRoleFromUser(user);
  const { menu, quick } = getMenusForRole(role);
  const [selectedId, setSelectedId] = useState(tickets[0]?.id ?? '');
  const [reply, setReply] = useState('');

  const selectedTicket = tickets.find((ticket) => ticket.id === selectedId) ?? tickets[0];
  const openCount = tickets.filter((ticket) => ticket.status === 'Open').length;
  const progressCount = tickets.filter((ticket) => ticket.status === 'In Progress').length;
  const waitingCount = tickets.filter((ticket) => ticket.status === 'Waiting').length;

  return (
    <AppShell
      title="Support"
      subtitle="Help center and support requests."
      menuItems={menu}
      quickActions={quick}
      user={user}>
      <View style={styles.pageHeader}>
        <Text style={styles.overline}>COMPANY</Text>
        <Text style={styles.pageTitle}>Support</Text>
        <Text style={styles.pageSubtitle}>Track incoming requests and coordinate fast responses.</Text>
      </View>

      <View style={[styles.statsGrid, isPhone && styles.statsGridPhone]}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>OPEN</Text>
          <Text style={styles.statValue}>{openCount}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>IN PROGRESS</Text>
          <Text style={styles.statValue}>{progressCount}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>WAITING</Text>
          <Text style={styles.statValue}>{waitingCount}</Text>
        </View>
      </View>

      <View style={[styles.workspace, isPhone && styles.workspacePhone]}>
        <View style={[styles.queueCard, isPhone && styles.queueCardPhone]}>
          <View style={styles.queueHead}>
            <Text style={styles.queueTitle}>Support Queue</Text>
            <Text style={styles.queueMeta}>{tickets.length} tickets</Text>
          </View>
          <ScrollView contentContainerStyle={styles.ticketList}>
            {tickets.map((ticket) => {
              const active = ticket.id === selectedTicket?.id;
              return (
                <Pressable
                  key={ticket.id}
                  style={[styles.ticketRow, active && styles.ticketRowActive]}
                  onPress={() => setSelectedId(ticket.id)}>
                  <View style={styles.ticketRowTop}>
                    <Text style={[styles.ticketId, active && styles.ticketIdActive]}>{ticket.id}</Text>
                    <Text style={styles.ticketOpened}>{ticket.opened}</Text>
                  </View>
                  <Text style={styles.ticketSubject}>{ticket.subject}</Text>
                  <Text style={styles.ticketAccount}>{ticket.account}</Text>
                  <View style={styles.ticketTags}>
                    <View
                      style={[
                        styles.tagPill,
                        ticket.priority === 'Critical'
                          ? styles.tagCritical
                          : ticket.priority === 'High'
                            ? styles.tagHigh
                            : styles.tagNormal,
                      ]}>
                      <Text style={styles.tagText}>{ticket.priority}</Text>
                    </View>
                    <View style={styles.tagPillNeutral}>
                      <Text style={styles.tagTextNeutral}>{ticket.status}</Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.detailCard}>
          <View style={styles.detailHead}>
            <View>
              <Text style={styles.detailOverline}>Ticket</Text>
              <Text style={styles.detailTitle}>{selectedTicket?.subject}</Text>
            </View>
            <View style={styles.detailMetaWrap}>
              <Text style={styles.detailMeta}>{selectedTicket?.id}</Text>
              <Text style={styles.detailMeta}>{selectedTicket?.account}</Text>
            </View>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Summary</Text>
            <Text style={styles.summaryBody}>{selectedTicket?.summary}</Text>
          </View>

          <View style={styles.actionsRow}>
            <Pressable style={styles.actionPill}>
              <Text style={styles.actionPillText}>ASSIGN OWNER</Text>
            </Pressable>
            <Pressable style={styles.actionPill}>
              <Text style={styles.actionPillText}>MARK RESOLVED</Text>
            </Pressable>
          </View>

          <View style={styles.replyCard}>
            <Text style={styles.replyLabel}>Response</Text>
            <TextInput
              multiline
              value={reply}
              onChangeText={setReply}
              placeholder="Write an update to the teacher account..."
              placeholderTextColor={palette.textMuted}
              style={styles.replyInput}
            />
            <View style={styles.replyActions}>
              <Pressable style={[styles.sendButton, !reply.trim() && styles.sendButtonDisabled]} disabled={!reply.trim()}>
                <Text style={styles.sendButtonText}>SEND UPDATE</Text>
              </Pressable>
            </View>
          </View>
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
    workspace: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 28,
    },
    workspacePhone: {
      flexDirection: 'column',
    },
    queueCard: {
      width: 340,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.surface,
      padding: 12,
    },
    queueCardPhone: {
      width: '100%',
    },
    queueHead: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    queueTitle: {
      color: palette.text,
      fontSize: 24,
      fontWeight: '600',
    },
    queueMeta: {
      color: palette.textMuted,
      fontSize: 12,
      letterSpacing: 1.4,
    },
    ticketList: {
      gap: 8,
    },
    ticketRow: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.surfaceSoft,
      padding: 10,
    },
    ticketRowActive: {
      borderColor: palette.primary,
      backgroundColor: palette.surface,
    },
    ticketRowTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    ticketId: {
      color: palette.textMuted,
      fontSize: 11,
      letterSpacing: 1.8,
      fontWeight: '700',
    },
    ticketIdActive: {
      color: palette.primary,
    },
    ticketOpened: {
      color: palette.textMuted,
      fontSize: 12,
    },
    ticketSubject: {
      marginTop: 6,
      color: palette.text,
      fontSize: 16,
      fontWeight: '600',
    },
    ticketAccount: {
      marginTop: 3,
      color: palette.textMuted,
      fontSize: 13,
    },
    ticketTags: {
      marginTop: 8,
      flexDirection: 'row',
      gap: 6,
      flexWrap: 'wrap',
    },
    tagPill: {
      borderRadius: 999,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderWidth: 1,
    },
    tagCritical: {
      backgroundColor: '#fce7e7',
      borderColor: '#e6a0a0',
    },
    tagHigh: {
      backgroundColor: '#fff3df',
      borderColor: '#e5c18c',
    },
    tagNormal: {
      backgroundColor: '#e7f4eb',
      borderColor: '#9ac9a6',
    },
    tagText: {
      fontSize: 10,
      letterSpacing: 1.4,
      fontWeight: '700',
      color: '#5f5a54',
    },
    tagPillNeutral: {
      borderRadius: 999,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderWidth: 1,
      borderColor: palette.borderStrong,
      backgroundColor: palette.surface,
    },
    tagTextNeutral: {
      fontSize: 10,
      letterSpacing: 1.4,
      fontWeight: '700',
      color: palette.textMuted,
    },
    detailCard: {
      flex: 1,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.surface,
      padding: 14,
      gap: 10,
    },
    detailHead: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 8,
      flexWrap: 'wrap',
    },
    detailOverline: {
      color: '#c13b3f',
      fontSize: 10,
      letterSpacing: 2.2,
      fontWeight: '700',
    },
    detailTitle: {
      marginTop: 6,
      color: palette.text,
      fontSize: 28,
      fontWeight: '600',
    },
    detailMetaWrap: {
      alignItems: 'flex-end',
    },
    detailMeta: {
      color: palette.textMuted,
      fontSize: 12,
    },
    summaryCard: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.surfaceSoft,
      padding: 12,
    },
    summaryLabel: {
      color: palette.textMuted,
      fontSize: 11,
      letterSpacing: 1.8,
      marginBottom: 6,
    },
    summaryBody: {
      color: palette.text,
      fontSize: 14,
      lineHeight: 21,
    },
    actionsRow: {
      flexDirection: 'row',
      gap: 8,
      flexWrap: 'wrap',
    },
    actionPill: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: palette.borderStrong,
      backgroundColor: palette.surfaceSoft,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    actionPillText: {
      color: palette.textMuted,
      fontSize: 11,
      letterSpacing: 1.8,
      fontWeight: '700',
    },
    replyCard: {
      marginTop: 4,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.surfaceSoft,
      padding: 12,
    },
    replyLabel: {
      color: palette.textMuted,
      fontSize: 11,
      letterSpacing: 2.1,
      marginBottom: 8,
    },
    replyInput: {
      minHeight: 110,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.surface,
      color: palette.text,
      textAlignVertical: 'top',
      fontSize: 14,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    replyActions: {
      marginTop: 8,
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    sendButton: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: palette.primary,
      backgroundColor: palette.primary,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    sendButtonDisabled: {
      opacity: 0.45,
    },
    sendButtonText: {
      color: '#fff',
      fontSize: 11,
      letterSpacing: 2,
      fontWeight: '700',
    },
  });
