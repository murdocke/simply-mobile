import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { ResizeMode, Video } from 'expo-av';
import { CameraView, useCameraPermissions } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams } from 'expo-router';

import { AppShell } from '@/components/app-shell';
import { useAppTheme } from '@/components/theme/app-theme-provider';
import { getMenusForRole, getRoleFromUser } from '@/constants/menus';

const videos = [
  { id: '3.1.3', title: 'RH A Section & Rhythm' },
  { id: '3.1.4', title: 'BH & Rhythm' },
  { id: '3.1.5', title: 'BH B Section' },
  { id: '3.1.6', title: 'Reference Book & Order' },
];

const practiceDays = [
  { day: 'SUN', date: '2/8' },
  { day: 'MON', date: '2/9' },
  { day: 'TUE', date: '2/10' },
  { day: 'WED', date: '2/11' },
  { day: 'THU', date: '2/12' },
  { day: 'FRI', date: '2/13' },
  { day: 'SAT', date: '2/14' },
];

type SavedVideo = {
  id: string;
  uri: string;
  createdAt: string;
};

export default function CurrentLessonScreen() {
  const { palette } = useAppTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const { user } = useLocalSearchParams<{ user?: string }>();
  const { width } = useWindowDimensions();
  const role = getRoleFromUser(user);
  const { menu, quick } = getMenusForRole(role);
  const isWide = width >= 980;
  const isTablet = width < 980;
  const isPhone = width < 560;
  const cameraRef = useRef<CameraView | null>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [savedVideos, setSavedVideos] = useState<SavedVideo[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [cameraFacing, setCameraFacing] = useState<'back' | 'front'>('back');
  const videoStorageKey = `current-lesson-recordings:${user?.toLowerCase() ?? 'default'}`;

  useEffect(() => {
    let active = true;
    const loadSavedVideos = async () => {
      try {
        const raw = await AsyncStorage.getItem(videoStorageKey);
        const parsed = raw ? (JSON.parse(raw) as SavedVideo[]) : [];
        if (!active) return;
        setSavedVideos(parsed);
        setSelectedVideoId((prev) => prev ?? parsed[0]?.id ?? null);
      } catch {
        if (!active) return;
        setSavedVideos([]);
      }
    };
    void loadSavedVideos();
    return () => {
      active = false;
    };
  }, [videoStorageKey]);

  const handleStartRecording = async () => {
    const permission = cameraPermission?.granted
      ? cameraPermission
      : await requestCameraPermission();
    if (!permission?.granted || !cameraRef.current || isRecording) return;
    try {
      setIsRecording(true);
      const result = await cameraRef.current.recordAsync({
        maxDuration: 180,
      });
      if (result?.uri) {
        const newVideo: SavedVideo = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          uri: result.uri,
          createdAt: new Date().toISOString(),
        };
        setSavedVideos((prev) => {
          const next = [newVideo, ...prev];
          void AsyncStorage.setItem(videoStorageKey, JSON.stringify(next));
          return next;
        });
        setSelectedVideoId(newVideo.id);
      }
    } catch {
      // keep UI responsive if capture fails
    } finally {
      setIsRecording(false);
    }
  };

  const handleStopRecording = () => {
    if (!cameraRef.current || !isRecording) return;
    cameraRef.current.stopRecording();
  };

  const handleDeleteSavedVideo = useCallback(
    (id: string) => {
      setSavedVideos((prev) => {
        const next = prev.filter((entry) => entry.id !== id);
        void AsyncStorage.setItem(videoStorageKey, JSON.stringify(next));
        setSelectedVideoId((currentSelected) => {
          if (currentSelected !== id) return currentSelected;
          return next[0]?.id ?? null;
        });
        return next;
      });
    },
    [videoStorageKey]
  );

  const selectedVideo = savedVideos.find((entry) => entry.id === selectedVideoId) ?? savedVideos[0] ?? null;

  return (
    <AppShell
      title="Current Lesson"
      subtitle="Everything you need to track this week's lesson plan."
      menuItems={menu}
      quickActions={quick}
      user={user}>
      <View style={[styles.topHeader, isPhone && styles.topHeaderPhone]}>
        <Text style={styles.pageOverline}>STUDENTS</Text>
        <Text style={[styles.pageTitle, isPhone && styles.pageTitlePhone]}>Current Lesson</Text>
        <Text style={styles.pageSubtitle}>Everything you need to track this week's lesson plan.</Text>
      </View>

      <View style={[styles.mainCard, isPhone && styles.mainCardPhone]}>
        <View style={[styles.planRow, !isWide && styles.planRowStacked]}>
          <View>
            <Text style={styles.sectionOverline}>THIS WEEK</Text>
            <Text style={[styles.planTitle, isPhone && styles.planTitlePhone]}>Quinn's Lesson Plan</Text>
          </View>
          <View>
            <Text style={styles.planMeta}>LESSON DATE 2026-02-09</Text>
            <Text style={styles.planMeta}>APPLIES 2026-02-06 -> 2026-02-12</Text>
          </View>
        </View>

        <View style={[styles.practicePill, isPhone && styles.practicePillPhone]}>
          <Text style={styles.practicePillText}>20 minutes of practice every other day</Text>
        </View>

        <View style={styles.lessonShell}>
          <Text style={[styles.lessonTitle, isPhone && styles.lessonTitlePhone]}>Level 3 - "The Pipes"</Text>
          <View style={[styles.lessonColumns, !isWide && styles.lessonColumnsStacked]}>
            <View style={styles.leftColumn}>
              <Text style={styles.columnHeading}>VIDEOS TO WATCH</Text>
              {videos.map((video) => (
                <View key={video.id} style={[styles.videoRow, isPhone && styles.videoRowPhone]}>
                  <View style={styles.videoMeta}>
                    <Text style={styles.videoId}>{video.id}</Text>
                    <Text style={styles.videoName}>{video.title}</Text>
                  </View>
                  <View style={[styles.videoActions, isPhone && styles.videoActionsPhone]}>
                    <Pressable style={[styles.actionButton, isPhone && styles.actionButtonPhone]}>
                      <Text style={styles.actionIcon}>◉</Text>
                      <Text style={styles.actionText}>PLAY</Text>
                    </Pressable>
                    <Pressable
                      style={[
                        styles.actionButton,
                        styles.actionButtonMuted,
                        isPhone && styles.actionButtonPhone,
                      ]}>
                      <Text style={[styles.actionIcon, styles.mutedText]}>○</Text>
                      <Text style={[styles.actionText, styles.mutedText]}>WATCHED</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.rightColumn}>
              <View style={styles.rightCard}>
                <Text style={styles.columnHeading}>MARK PRACTICE DAYS</Text>
                <View style={styles.dayGrid}>
                  {practiceDays.map((entry) => (
                    <Pressable
                      key={`${entry.day}-${entry.date}`}
                      style={[styles.dayPill, isTablet && styles.dayPillTablet, isPhone && styles.dayPillPhone]}>
                      <Text style={styles.dayTop}>{entry.day}</Text>
                      <Text style={[styles.dayBottom, isPhone && styles.dayBottomPhone]}>{entry.date}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.rightCard}>
                <Text style={styles.columnHeading}>ASK A QUESTION</Text>
                <Text style={styles.threadLabel}>THREAD SUBJECT: THE PIPES</Text>
                <TextInput
                  multiline
                  editable={false}
                  placeholder="Message your teacher about this lesson..."
                  placeholderTextColor={palette.textMuted}
                  style={styles.textArea}
                />
                <Pressable style={styles.sendButton}>
                  <Text style={styles.sendText}>SEND TO TEACHER</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </View>

      {role === 'student' ? (
        <View style={styles.captureCard}>
          <Text style={styles.sectionOverline}>RECORD PRACTICE VIDEO</Text>
          <Text style={styles.captureTitle}>Capture your current lesson performance</Text>
          <View style={[styles.captureMediaWrap, isPhone && styles.captureMediaWrapPhone]}>
            <CameraView
              ref={cameraRef}
              mode="video"
              facing={cameraFacing}
              style={[styles.cameraPreview, isPhone && styles.cameraPreviewPhone]}
            />
            <View style={styles.facingRow}>
              <Pressable
                style={[
                  styles.facingButton,
                  cameraFacing === 'back' && styles.facingButtonActive,
                  isRecording && styles.captureButtonDisabled,
                ]}
                onPress={() => setCameraFacing('back')}
                disabled={isRecording}>
                <Text
                  style={[
                    styles.facingButtonText,
                    cameraFacing === 'back' && styles.facingButtonTextActive,
                  ]}>
                  Back Camera
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.facingButton,
                  cameraFacing === 'front' && styles.facingButtonActive,
                  isRecording && styles.captureButtonDisabled,
                ]}
                onPress={() => setCameraFacing('front')}
                disabled={isRecording}>
                <Text
                  style={[
                    styles.facingButtonText,
                    cameraFacing === 'front' && styles.facingButtonTextActive,
                  ]}>
                  Front Camera
                </Text>
              </Pressable>
            </View>
            <View style={styles.captureActions}>
              <Pressable
                style={[styles.captureButton, styles.captureButtonPrimary, isRecording && styles.captureButtonDisabled]}
                onPress={handleStartRecording}
                disabled={isRecording}>
                <Text style={styles.captureButtonText}>{isRecording ? 'Recording...' : 'Record Video'}</Text>
              </Pressable>
              <Pressable
                style={[styles.captureButton, isRecording ? styles.captureButtonDanger : styles.captureButtonDisabled]}
                onPress={handleStopRecording}
                disabled={!isRecording}>
                <Text style={styles.captureButtonText}>Stop</Text>
              </Pressable>
            </View>
            {selectedVideo ? (
              <View style={styles.savedVideoWrap}>
                <Text style={styles.savedVideoLabel}>Saved Videos</Text>
                <Video
                  style={[styles.savedVideoPlayer, isPhone && styles.savedVideoPlayerPhone]}
                  source={{ uri: selectedVideo.uri }}
                  useNativeControls
                  resizeMode={ResizeMode.COVER}
                />
                <View style={styles.savedVideoList}>
                  {savedVideos.map((entry, index) => {
                    const isActive = entry.id === selectedVideo.id;
                    const labelDate = new Date(entry.createdAt).toLocaleString();
                    return (
                      <View key={entry.id} style={[styles.savedVideoItem, isActive && styles.savedVideoItemActive]}>
                        <Pressable style={styles.savedVideoSelect} onPress={() => setSelectedVideoId(entry.id)}>
                          <Text style={[styles.savedVideoItemTitle, isActive && styles.savedVideoItemTitleActive]}>
                            Recording {savedVideos.length - index}
                          </Text>
                          <Text style={styles.savedVideoItemMeta}>{labelDate}</Text>
                        </Pressable>
                        <Pressable
                          style={styles.savedVideoDeleteButton}
                          onPress={() => handleDeleteSavedVideo(entry.id)}>
                          <Text style={styles.savedVideoDeleteText}>X</Text>
                        </Pressable>
                      </View>
                    );
                  })}
                </View>
              </View>
            ) : (
              <Text style={styles.savedVideoHint}>
                Record and stop to save videos. Saved recordings will appear below.
              </Text>
            )}
          </View>
        </View>
      ) : null}
    </AppShell>
  );
}

const createStyles = (
  palette: ReturnType<typeof useAppTheme>['palette']
) =>
  StyleSheet.create({
  topHeader: {
    marginBottom: 20,
  },
  topHeaderPhone: {
    marginBottom: 14,
  },
  pageOverline: {
    color: '#c13b3f',
    fontSize: 12,
    letterSpacing: 6,
  },
  pageTitle: {
    marginTop: 8,
    color: palette.text,
    fontSize: 44,
    fontWeight: '500',
  },
  pageTitlePhone: {
    fontSize: 34,
    marginTop: 6,
  },
  pageSubtitle: {
    marginTop: 8,
    color: palette.textMuted,
    fontSize: 15,
  },
  mainCard: {
    borderRadius: 16,
    backgroundColor: palette.background,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 24,
    marginBottom: 36,
  },
  mainCardPhone: {
    padding: 14,
    marginBottom: 24,
  },
  captureCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surfaceSoft,
    padding: 14,
    marginBottom: 14,
  },
  captureTitle: {
    marginTop: 8,
    color: palette.text,
    fontSize: 22,
    fontWeight: '500',
  },
  captureMediaWrap: {
    marginTop: 12,
  },
  captureMediaWrapPhone: {
    marginTop: 10,
  },
  cameraPreview: {
    width: '100%',
    height: 240,
    borderRadius: 14,
    overflow: 'hidden',
  },
  cameraPreviewPhone: {
    height: 190,
  },
  captureActions: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
  },
  facingRow: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
  },
  facingButton: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    backgroundColor: palette.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  facingButtonActive: {
    borderColor: palette.primary,
    backgroundColor: palette.primary,
  },
  facingButtonText: {
    color: palette.text,
    fontSize: 12,
    fontWeight: '600',
  },
  facingButtonTextActive: {
    color: '#fff',
  },
  captureButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    backgroundColor: palette.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  captureButtonPrimary: {
    backgroundColor: palette.primary,
    borderColor: palette.primary,
  },
  captureButtonDanger: {
    backgroundColor: '#8b2b2f',
    borderColor: '#8b2b2f',
  },
  captureButtonDisabled: {
    opacity: 0.45,
  },
  captureButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  savedVideoWrap: {
    marginTop: 12,
  },
  savedVideoLabel: {
    color: palette.textMuted,
    letterSpacing: 2.4,
    fontSize: 11,
    marginBottom: 8,
  },
  savedVideoPlayer: {
    width: '100%',
    height: 220,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  savedVideoPlayerPhone: {
    height: 180,
  },
  savedVideoHint: {
    marginTop: 12,
    color: palette.textMuted,
    fontSize: 13,
  },
  savedVideoList: {
    marginTop: 10,
    gap: 8,
  },
  savedVideoItem: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    paddingHorizontal: 10,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  savedVideoSelect: {
    flex: 1,
  },
  savedVideoItemActive: {
    borderColor: palette.primary,
    backgroundColor: palette.surfaceSoft,
  },
  savedVideoItemTitle: {
    color: palette.text,
    fontSize: 13,
    fontWeight: '600',
  },
  savedVideoItemTitleActive: {
    color: palette.primary,
  },
  savedVideoItemMeta: {
    marginTop: 2,
    color: palette.textMuted,
    fontSize: 11,
  },
  savedVideoDeleteButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedVideoDeleteText: {
    color: palette.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  planRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 18,
  },
  planRowStacked: {
    flexDirection: 'column',
  },
  sectionOverline: {
    color: '#c13b3f',
    letterSpacing: 5,
    fontSize: 12,
  },
  planTitle: {
    marginTop: 10,
    fontSize: 39,
    color: palette.text,
    fontWeight: '500',
  },
  planTitlePhone: {
    fontSize: 28,
    marginTop: 8,
  },
  planMeta: {
    color: palette.textMuted,
    letterSpacing: 3.5,
    fontSize: 12,
    marginTop: 4,
  },
  practicePill: {
    marginTop: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surfaceSoft,
    paddingVertical: 13,
    paddingHorizontal: 16,
  },
  practicePillPhone: {
    marginTop: 14,
    paddingVertical: 11,
    paddingHorizontal: 12,
  },
  practicePillText: {
    color: palette.textMuted,
    fontSize: 15,
  },
  lessonShell: {
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 16,
    backgroundColor: palette.background,
  },
  lessonTitle: {
    fontSize: 24,
    color: palette.text,
    fontWeight: '500',
    marginBottom: 14,
  },
  lessonTitlePhone: {
    fontSize: 20,
    marginBottom: 10,
  },
  lessonColumns: {
    flexDirection: 'row',
    gap: 16,
  },
  lessonColumnsStacked: {
    flexDirection: 'column',
  },
  leftColumn: {
    flex: 1.15,
  },
  rightColumn: {
    flex: 1,
    gap: 12,
  },
  columnHeading: {
    color: palette.textMuted,
    letterSpacing: 5,
    fontSize: 12,
    marginBottom: 12,
  },
  videoRow: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surfaceSoft,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  videoRowPhone: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  videoMeta: {
    flex: 1,
  },
  videoId: {
    fontSize: 17,
    color: palette.text,
  },
  videoName: {
    marginTop: 4,
    fontSize: 12,
    letterSpacing: 3,
    color: palette.textMuted,
  },
  videoActions: {
    flexDirection: 'row',
    gap: 8,
  },
  videoActionsPhone: {
    width: '100%',
  },
  actionButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    backgroundColor: palette.surface,
    minWidth: 120,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  actionButtonPhone: {
    minWidth: 0,
    flex: 1,
    paddingHorizontal: 8,
  },
  actionButtonMuted: {
    minWidth: 130,
  },
  actionIcon: {
    fontSize: 13,
    color: palette.text,
  },
  actionText: {
    fontSize: 13,
    letterSpacing: 3,
    color: palette.text,
  },
  mutedText: {
    color: palette.textMuted,
  },
  rightCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surfaceSoft,
    padding: 12,
  },
  dayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  dayPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    backgroundColor: palette.surface,
    minWidth: 120,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayPillTablet: {
    flexBasis: '31%',
    flexGrow: 1,
    minWidth: 96,
  },
  dayPillPhone: {
    flexBasis: '47%',
    minWidth: 0,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  dayTop: {
    color: palette.textMuted,
    fontSize: 11,
    letterSpacing: 3,
  },
  dayBottom: {
    marginTop: 3,
    color: palette.text,
    fontSize: 25,
    fontWeight: '600',
  },
  dayBottomPhone: {
    fontSize: 18,
  },
  threadLabel: {
    color: palette.textMuted,
    fontSize: 11,
    letterSpacing: 3,
    marginBottom: 10,
  },
  textArea: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    backgroundColor: palette.surface,
    minHeight: 86,
    padding: 12,
    color: palette.textMuted,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  sendButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    backgroundColor: palette.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sendText: {
    color: palette.textMuted,
    fontSize: 12,
    letterSpacing: 4,
  },
});
