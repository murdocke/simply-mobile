import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { AppShell } from '@/components/app-shell';
import { useMetronome, type TimeSignature } from '@/components/metronome/metronome-provider';
import { useAppTheme } from '@/components/theme/app-theme-provider';
import { getMenusForRole, getRoleFromUser } from '@/constants/menus';

const MIN_BPM = 40;
const MAX_BPM = 220;
const TAP_TEMPO_RESET_MS = 2500;
const TAP_TEMPO_MAX_SAMPLES = 8;
const TAP_TEMPO_MIN_TAPS_FOR_UPDATE = 3;
const TIME_SIGNATURES = ['4/4', '3/4', '2/4', '6/8'] as const;
type MetronomePreset = {
  id: string;
  name: string;
  bpm: number;
  timeSignature: TimeSignature;
  accentOn: boolean;
};

type SongPreset = {
  id: string;
  title: string;
  bpm: number;
  timeSignature: TimeSignature;
};

const SONG_PRESETS: SongPreset[] = [
  { id: 'dreams-come-true', title: 'Dreams Come True', bpm: 105, timeSignature: '4/4' },
  { id: 'night-storm', title: 'Night Storm', bpm: 122, timeSignature: '4/4' },
  { id: 'alma-mater-blues', title: 'Alma Mater Blues', bpm: 117, timeSignature: '4/4' },
  { id: 'greensleeves', title: 'Greensleeves', bpm: 73, timeSignature: '6/8' },
];

export default function MetronomeScreen() {
  const { palette } = useAppTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const { width } = useWindowDimensions();
  const isPhone = width < 640;
  const { user } = useLocalSearchParams<{ user?: string }>();
  const role = getRoleFromUser(user);
  const { menu, quick } = getMenusForRole(role);
  const {
    bpm,
    setBpm,
    isPlaying,
    setIsPlaying,
    accentOn,
    setAccentOn,
    volume,
    setVolume,
    timeSignature,
    setTimeSignature,
    beatPulse,
  } = useMetronome();

  const [presets, setPresets] = useState<MetronomePreset[]>([]);
  const [songsModalOpen, setSongsModalOpen] = useState(false);
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
  const [songSearchQuery, setSongSearchQuery] = useState('');
  const [trackWidth, setTrackWidth] = useState(1);
  const [trackPageX, setTrackPageX] = useState(0);
  const [volumeTrackWidth, setVolumeTrackWidth] = useState(1);
  const [volumeTrackPageX, setVolumeTrackPageX] = useState(0);
  const sliderRef = useRef<View | null>(null);
  const volumeSliderRef = useRef<View | null>(null);
  const beatFlashOpacity = useRef(new Animated.Value(0)).current;
  const beatPulseScale = useRef(new Animated.Value(1)).current;
  const beatGlowOpacity = useRef(new Animated.Value(0)).current;
  const beatGlowScale = useRef(new Animated.Value(1)).current;
  const tapPulseScale = useRef(new Animated.Value(1)).current;
  const tapPulseOpacity = useRef(new Animated.Value(0)).current;
  const tapTempoTimesRef = useRef<number[]>([]);
  const tapTempoResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const applyingSongPresetRef = useRef(false);

  const triggerBeatFlash = useCallback(
    (isAccentedBeat: boolean) => {
      const accentFlash = isAccentedBeat;
      const flashPeak = accentFlash ? 0.34 : 0.18;
      const pulsePeak = accentFlash ? 1.04 : 1.02;
      const glowPeak = accentFlash ? 0.5 : 0.28;
      const glowScalePeak = accentFlash ? 1.08 : 1.05;

      beatFlashOpacity.stopAnimation();
      beatPulseScale.stopAnimation();
      beatGlowOpacity.stopAnimation();
      beatGlowScale.stopAnimation();

      Animated.parallel([
        Animated.sequence([
          Animated.timing(beatFlashOpacity, {
            toValue: flashPeak,
            duration: 55,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(beatFlashOpacity, {
            toValue: 0,
            duration: 140,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(beatPulseScale, {
            toValue: pulsePeak,
            duration: 55,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(beatPulseScale, {
            toValue: 1,
            duration: 140,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(beatGlowOpacity, {
            toValue: glowPeak,
            duration: 70,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(beatGlowOpacity, {
            toValue: 0,
            duration: 180,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(beatGlowScale, {
            toValue: glowScalePeak,
            duration: 70,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(beatGlowScale, {
            toValue: 1,
            duration: 180,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    },
    [beatFlashOpacity, beatGlowOpacity, beatGlowScale, beatPulseScale]
  );

  useEffect(() => {
    if (!isPlaying) {
      beatFlashOpacity.stopAnimation();
      beatPulseScale.stopAnimation();
      beatGlowOpacity.stopAnimation();
      beatGlowScale.stopAnimation();
      beatFlashOpacity.setValue(0);
      beatPulseScale.setValue(1);
      beatGlowOpacity.setValue(0);
      beatGlowScale.setValue(1);
    }
  }, [beatFlashOpacity, beatGlowOpacity, beatGlowScale, beatPulseScale, isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      triggerBeatFlash(beatPulse.accented);
    }
  }, [beatPulse.accented, beatPulse.tick, isPlaying, triggerBeatFlash]);

  const bpmToX = (value: number) => ((value - MIN_BPM) / (MAX_BPM - MIN_BPM)) * trackWidth;
  const volumeToX = (value: number) => Math.min(1, Math.max(0, value)) * volumeTrackWidth;

  const updateBpmFromPageX = useCallback(
    (pageX: number) => {
      const touchX = pageX - trackPageX;
      const ratio = Math.min(1, Math.max(0, touchX / trackWidth));
      const next = Math.round(MIN_BPM + ratio * (MAX_BPM - MIN_BPM));
      const clamped = Math.min(MAX_BPM, Math.max(MIN_BPM, next));
      setBpm((prev) => (prev === clamped ? prev : clamped));
    },
    [trackPageX, trackWidth]
  );

  const measureSlider = useCallback(() => {
    if (!sliderRef.current) return;
    sliderRef.current.measureInWindow((x, _y, width) => {
      setTrackPageX(x);
      setTrackWidth(Math.max(1, width));
    });
  }, []);

  const handleSliderLayout = useCallback((event: LayoutChangeEvent) => {
    setTrackWidth(Math.max(1, event.nativeEvent.layout.width));
    requestAnimationFrame(measureSlider);
  }, [measureSlider]);

  const updateVolumeFromPageX = useCallback(
    (pageX: number) => {
      const touchX = pageX - volumeTrackPageX;
      const ratio = Math.min(1, Math.max(0, touchX / volumeTrackWidth));
      setVolume((prev) => (Math.abs(prev - ratio) < 0.001 ? prev : ratio));
    },
    [setVolume, volumeTrackPageX, volumeTrackWidth]
  );

  const measureVolumeSlider = useCallback(() => {
    if (!volumeSliderRef.current) return;
    volumeSliderRef.current.measureInWindow((x, _y, width) => {
      setVolumeTrackPageX(x);
      setVolumeTrackWidth(Math.max(1, width));
    });
  }, []);

  const handleVolumeSliderLayout = useCallback(
    (event: LayoutChangeEvent) => {
      setVolumeTrackWidth(Math.max(1, event.nativeEvent.layout.width));
      requestAnimationFrame(measureVolumeSlider);
    },
    [measureVolumeSlider]
  );

  useEffect(() => {
    requestAnimationFrame(measureSlider);
  }, [measureSlider, width]);

  useEffect(() => {
    requestAnimationFrame(measureVolumeSlider);
  }, [measureVolumeSlider, width]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          updateBpmFromPageX(event.nativeEvent.pageX);
        },
        onPanResponderMove: (event) => {
          updateBpmFromPageX(event.nativeEvent.pageX);
        },
      }),
    [updateBpmFromPageX]
  );

  const volumePanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          updateVolumeFromPageX(event.nativeEvent.pageX);
        },
        onPanResponderMove: (event) => {
          updateVolumeFromPageX(event.nativeEvent.pageX);
        },
      }),
    [updateVolumeFromPageX]
  );

  const fillWidth = Math.max(0, bpmToX(bpm));
  const thumbLeft = Math.max(0, fillWidth - 12);
  const volumeFillWidth = Math.max(0, volumeToX(volume));
  const volumeThumbLeft = Math.max(0, volumeFillWidth - 10);
  const selectedSongPreset = useMemo(
    () => SONG_PRESETS.find((song) => song.id === selectedSongId) ?? null,
    [selectedSongId]
  );
  const filteredSongPresets = useMemo(() => {
    const query = songSearchQuery.trim().toLowerCase();
    if (!query) return SONG_PRESETS;
    return SONG_PRESETS.filter((song) => song.title.toLowerCase().includes(query));
  }, [songSearchQuery]);

  const scheduleTapTempoReset = useCallback(() => {
    if (tapTempoResetTimerRef.current) {
      clearTimeout(tapTempoResetTimerRef.current);
    }
    tapTempoResetTimerRef.current = setTimeout(() => {
      tapTempoTimesRef.current = [];
      tapTempoResetTimerRef.current = null;
    }, TAP_TEMPO_RESET_MS);
  }, []);

  const handleTapTempo = useCallback(() => {
    tapPulseScale.stopAnimation();
    tapPulseOpacity.stopAnimation();
    Animated.parallel([
      Animated.sequence([
        Animated.timing(tapPulseScale, {
          toValue: 1.08,
          duration: 70,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(tapPulseScale, {
          toValue: 1,
          duration: 120,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(tapPulseOpacity, {
          toValue: 0.28,
          duration: 70,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(tapPulseOpacity, {
          toValue: 0,
          duration: 120,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    const now = Date.now();
    const taps = tapTempoTimesRef.current;
    const lastTap = taps[taps.length - 1];

    if (lastTap && now - lastTap > TAP_TEMPO_RESET_MS) {
      tapTempoTimesRef.current = [now];
      scheduleTapTempoReset();
      return;
    }

    const nextTaps = [...taps, now].slice(-TAP_TEMPO_MAX_SAMPLES);
    tapTempoTimesRef.current = nextTaps;
    scheduleTapTempoReset();

    if (nextTaps.length < TAP_TEMPO_MIN_TAPS_FOR_UPDATE) return;

    const intervals = nextTaps.slice(1).map((tap, index) => tap - nextTaps[index]);
    const avgInterval = intervals.reduce((sum, value) => sum + value, 0) / intervals.length;
    if (avgInterval <= 0) return;

    const nextBpm = Math.round(60000 / avgInterval);
    const clampedBpm = Math.max(MIN_BPM, Math.min(MAX_BPM, nextBpm));
    setBpm((prev) => (prev === clampedBpm ? prev : clampedBpm));
  }, [scheduleTapTempoReset, setBpm, tapPulseOpacity, tapPulseScale]);

  useEffect(
    () => () => {
      if (tapTempoResetTimerRef.current) {
        clearTimeout(tapTempoResetTimerRef.current);
      }
    },
    []
  );

  useEffect(() => {
    if (!selectedSongPreset) return;

    if (applyingSongPresetRef.current) {
      if (bpm === selectedSongPreset.bpm && timeSignature === selectedSongPreset.timeSignature) {
        applyingSongPresetRef.current = false;
      }
      return;
    }

    if (bpm !== selectedSongPreset.bpm || timeSignature !== selectedSongPreset.timeSignature) {
      setSelectedSongId(null);
    }
  }, [bpm, selectedSongPreset, timeSignature]);

  const applySongPreset = useCallback((song: SongPreset) => {
    applyingSongPresetRef.current = true;
    setBpm(song.bpm);
    setTimeSignature(song.timeSignature);
    setAccentOn(true);
    setSelectedSongId(song.id);
    setSongSearchQuery('');
    setSongsModalOpen(false);
  }, [setAccentOn, setBpm, setTimeSignature]);

  const savePreset = useCallback(() => {
    setPresets((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: `Preset ${prev.length + 1}`,
        bpm,
        timeSignature,
        accentOn,
      },
    ]);
  }, [accentOn, bpm, timeSignature]);

  return (
    <AppShell
      title="Metronome"
      subtitle="Adjust BPM and press Start."
      menuItems={menu}
      quickActions={quick}
      user={user}>
      <View style={styles.header}>
        <Text style={styles.overline}>TOOLS</Text>
        <Text style={[styles.title, isPhone && styles.titlePhone]}>Metronome</Text>
        <Text style={styles.subtitle}>Set your tempo and keep steady time while practicing.</Text>
      </View>

      <View style={styles.songPresetRow}>
        <View style={styles.songPresetButton}>
          <Pressable style={styles.songPresetMainTouchable} onPress={() => setSongsModalOpen(true)}>
            <Text style={styles.songPresetText}>
              {selectedSongPreset?.title ?? 'SELECT SONG PRESET'}
            </Text>
          </Pressable>
          {selectedSongPreset ? (
            <Pressable style={styles.songPresetClear} onPress={() => setSelectedSongId(null)}>
              <Text style={styles.songPresetClearText}>CLEAR</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <View style={[styles.card, isPhone && styles.cardPhone]}>
        <View style={styles.tempoHead}>
          <Text style={styles.label}>Tempo</Text>
          <Animated.View style={[styles.tapTempoWrap, { transform: [{ scale: tapPulseScale }] }]}>
            <Animated.View pointerEvents="none" style={[styles.tapTempoPulse, { opacity: tapPulseOpacity }]} />
            <Pressable style={styles.tapTempoButton} onPress={handleTapTempo}>
              <Text style={styles.tapTempoText}>TAP</Text>
            </Pressable>
          </Animated.View>
        </View>
        <Text style={styles.bpmValue}>{bpm} BPM</Text>

        <View
          ref={sliderRef}
          style={styles.sliderWrap}
          onLayout={handleSliderLayout}
          {...panResponder.panHandlers}>
          <View style={styles.sliderTrack} pointerEvents="none" />
          <View style={[styles.sliderFill, { width: fillWidth }]} pointerEvents="none" />
          <View style={[styles.sliderThumb, { left: thumbLeft }]} pointerEvents="none" />
        </View>

        <View style={styles.rangeRow}>
          <Text style={styles.rangeText}>{MIN_BPM}</Text>
          <Text style={styles.rangeText}>{MAX_BPM}</Text>
        </View>

        <View style={styles.volumeSection}>
          <View style={styles.volumeHead}>
            <Text style={styles.signatureLabel}>Volume</Text>
            <Text style={styles.rangeText}>{Math.round(volume * 100)}%</Text>
          </View>
          <View
            ref={volumeSliderRef}
            style={styles.volumeSliderWrap}
            onLayout={handleVolumeSliderLayout}
            {...volumePanResponder.panHandlers}>
            <View style={styles.volumeTrack} pointerEvents="none" />
            <View style={[styles.volumeFill, { width: volumeFillWidth }]} pointerEvents="none" />
            <View style={[styles.volumeThumb, { left: volumeThumbLeft }]} pointerEvents="none" />
          </View>
        </View>

        <View style={styles.buttonRow}>
          <Pressable
            style={[styles.nudgeButton, bpm <= MIN_BPM && styles.disabledButton]}
            onPress={() => setBpm((prev) => Math.max(MIN_BPM, prev - 1))}
            disabled={bpm <= MIN_BPM}>
            <Text style={styles.nudgeText}>-1</Text>
          </Pressable>
          <Animated.View style={[styles.playButtonWrap, { transform: [{ scale: beatPulseScale }] }]}>
            <Animated.View
              pointerEvents="none"
              style={[
                styles.playButtonGlow,
                { opacity: beatGlowOpacity, transform: [{ scale: beatGlowScale }] },
              ]}
            />
            <Pressable
              style={[styles.playButton, isPlaying && styles.playButtonActive]}
              onPress={() => setIsPlaying((prev) => !prev)}>
              <Animated.View
                pointerEvents="none"
                style={[styles.playButtonFlash, { opacity: beatFlashOpacity }]}
              />
              <Text style={styles.playText}>{isPlaying ? 'Stop' : 'Start'}</Text>
            </Pressable>
          </Animated.View>
          <Pressable
            style={[styles.nudgeButton, bpm >= MAX_BPM && styles.disabledButton]}
            onPress={() => setBpm((prev) => Math.min(MAX_BPM, prev + 1))}
            disabled={bpm >= MAX_BPM}>
            <Text style={styles.nudgeText}>+1</Text>
          </Pressable>
        </View>

        <View style={styles.signatureSection}>
          <Text style={styles.signatureLabel}>Time Signature</Text>
          <View style={styles.signatureRow}>
            {TIME_SIGNATURES.map((sig) => (
              <Pressable
                key={sig}
                style={[
                  styles.signatureButton,
                  timeSignature === sig && styles.signatureButtonActive,
                ]}
                onPress={() => setTimeSignature(sig)}>
                <Text
                  style={[
                    styles.signatureText,
                    timeSignature === sig && styles.signatureTextActive,
                  ]}>
                  {sig}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Accent</Text>
          <Pressable
            style={[styles.togglePill, accentOn && styles.togglePillActive]}
            onPress={() => setAccentOn((prev) => !prev)}>
            <Text style={[styles.toggleText, accentOn && styles.toggleTextActive]}>
              {accentOn ? 'On' : 'Off'}
            </Text>
          </Pressable>
        </View>

        <Pressable style={styles.savePresetButton} onPress={savePreset}>
          <Text style={styles.savePresetText}>Save Preset</Text>
        </Pressable>

        {presets.length > 0 ? (
          <View style={styles.presetsSection}>
            <Text style={styles.presetsLabel}>Presets</Text>
            <View style={styles.presetsList}>
              {presets.map((preset) => (
                <View key={preset.id} style={styles.presetItem}>
                  <Pressable
                    style={styles.presetLoadArea}
                    onPress={() => {
                      setBpm(preset.bpm);
                      setTimeSignature(preset.timeSignature);
                      setAccentOn(preset.accentOn);
                    }}>
                    <Text style={styles.presetTitle}>{preset.name}</Text>
                    <Text style={styles.presetMeta}>
                      {preset.bpm} BPM • {preset.timeSignature} • Accent {preset.accentOn ? 'On' : 'Off'}
                    </Text>
                  </Pressable>
                  <Pressable
                    style={styles.presetDeleteButton}
                    onPress={() => setPresets((prev) => prev.filter((item) => item.id !== preset.id))}>
                    <Text style={styles.presetDeleteText}>X</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </View>

      <Modal
        visible={songsModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setSongsModalOpen(false)}>
        <View style={styles.songsModalBackdrop}>
          <Pressable
            style={styles.songsModalDismiss}
            onPress={() => {
              setSongSearchQuery('');
              setSongsModalOpen(false);
            }}
          />
          <View style={styles.songsModalCard}>
            <Text style={styles.songsModalTitle}>Song Presets</Text>
            <View style={styles.songSearchRow}>
              <TextInput
                value={songSearchQuery}
                onChangeText={setSongSearchQuery}
                placeholder="Search Songs"
                placeholderTextColor={palette.textMuted}
                style={styles.songSearchInput}
              />
              <Pressable style={styles.songSearchButton}>
                <Text style={styles.songSearchButtonText}>SEARCH</Text>
              </Pressable>
            </View>
            <View style={styles.songsModalList}>
              {filteredSongPresets.map((song) => (
                <Pressable
                  key={song.id}
                  style={[
                    styles.songOptionRow,
                    selectedSongId === song.id && styles.songOptionRowActive,
                  ]}
                  onPress={() => applySongPreset(song)}>
                  <Text style={styles.songOptionTitle}>{song.title}</Text>
                  <Text style={styles.songOptionMeta}>
                    {song.bpm} BPM • {song.timeSignature}
                  </Text>
                </Pressable>
              ))}
              {filteredSongPresets.length === 0 ? (
                <View style={styles.songSearchEmpty}>
                  <Text style={styles.songSearchEmptyText}>No songs found.</Text>
                </View>
              ) : null}
            </View>
            <Pressable
              style={styles.songsModalClose}
              onPress={() => {
                setSongSearchQuery('');
                setSongsModalOpen(false);
              }}>
              <Text style={styles.songsModalCloseText}>CLOSE</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </AppShell>
  );
}

const createStyles = (palette: ReturnType<typeof useAppTheme>['palette']) =>
  StyleSheet.create({
    header: {
      marginBottom: 16,
    },
    overline: {
      color: '#c13b3f',
      fontSize: 12,
      letterSpacing: 5,
    },
    title: {
      marginTop: 8,
      color: palette.text,
      fontSize: 42,
      fontWeight: '600',
    },
    titlePhone: {
      fontSize: 34,
      marginTop: 6,
    },
    subtitle: {
      marginTop: 8,
      fontSize: 15,
      color: palette.textMuted,
    },
    songPresetRow: {
      marginBottom: 12,
    },
    songPresetButton: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: palette.borderStrong,
      backgroundColor: palette.surface,
      paddingVertical: 12,
      paddingHorizontal: 14,
      paddingRight: 90,
      minHeight: 48,
      justifyContent: 'center',
      position: 'relative',
    },
    songPresetMainTouchable: {
      minHeight: 24,
      justifyContent: 'center',
    },
    songPresetText: {
      color: palette.text,
      fontSize: 13,
      letterSpacing: 1.4,
      fontWeight: '600',
    },
    songPresetClear: {
      position: 'absolute',
      right: 8,
      top: 8,
      bottom: 8,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.surfaceSoft,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 10,
    },
    songPresetClearText: {
      color: palette.textMuted,
      fontSize: 10,
      letterSpacing: 1.6,
      fontWeight: '700',
    },
    card: {
      borderRadius: 16,
      backgroundColor: palette.background,
      borderWidth: 1,
      borderColor: palette.border,
      padding: 18,
      marginBottom: 28,
    },
    cardPhone: {
      padding: 14,
      marginBottom: 20,
    },
    label: {
      fontSize: 13,
      letterSpacing: 3,
      color: palette.textMuted,
    },
    tempoHead: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 8,
    },
    tapTempoButton: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: palette.borderStrong,
      backgroundColor: palette.surface,
      paddingHorizontal: 24,
      paddingVertical: 14,
    },
    tapTempoWrap: {
      position: 'relative',
      overflow: 'visible',
    },
    tapTempoPulse: {
      position: 'absolute',
      top: -5,
      bottom: -5,
      left: -5,
      right: -5,
      borderRadius: 999,
      backgroundColor: palette.primary,
      shadowColor: palette.shadow,
      shadowOpacity: 0.35,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 0 },
    },
    tapTempoText: {
      color: palette.textMuted,
      fontSize: 16,
      letterSpacing: 2.2,
      fontWeight: '700',
    },
    bpmValue: {
      marginTop: 8,
      fontSize: 44,
      fontWeight: '700',
      color: palette.text,
    },
    sliderWrap: {
      marginTop: 20,
      height: 28,
      justifyContent: 'center',
    },
    sliderTrack: {
      height: 8,
      borderRadius: 999,
      backgroundColor: palette.borderStrong,
    },
    sliderFill: {
      position: 'absolute',
      left: 0,
      height: 8,
      borderRadius: 999,
      backgroundColor: palette.primary,
    },
    sliderThumb: {
      position: 'absolute',
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: palette.surface,
      borderWidth: 2,
      borderColor: palette.primary,
    },
    rangeRow: {
      marginTop: 8,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    rangeText: {
      color: palette.textMuted,
      fontSize: 12,
    },
    volumeSection: {
      marginTop: 12,
    },
    volumeHead: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    volumeSliderWrap: {
      marginTop: 8,
      height: 24,
      justifyContent: 'center',
    },
    volumeTrack: {
      height: 6,
      borderRadius: 999,
      backgroundColor: palette.borderStrong,
    },
    volumeFill: {
      position: 'absolute',
      left: 0,
      height: 6,
      borderRadius: 999,
      backgroundColor: palette.primary,
    },
    volumeThumb: {
      position: 'absolute',
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: palette.surface,
      borderWidth: 2,
      borderColor: palette.primary,
    },
    buttonRow: {
      marginTop: 18,
      flexDirection: 'row',
      gap: 10,
    },
    nudgeButton: {
      flex: 1,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: palette.borderStrong,
      backgroundColor: palette.surface,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
    },
    nudgeText: {
      fontSize: 16,
      fontWeight: '600',
      color: palette.text,
    },
    playButton: {
      flex: 2,
      borderRadius: 999,
      backgroundColor: palette.primary,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      overflow: 'hidden',
    },
    playButtonWrap: {
      flex: 2,
      position: 'relative',
      justifyContent: 'center',
      overflow: 'visible',
    },
    playButtonGlow: {
      position: 'absolute',
      top: -4,
      bottom: -4,
      left: -4,
      right: -4,
      borderRadius: 999,
      backgroundColor: palette.primary,
      shadowColor: palette.shadow,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.45,
      shadowRadius: 16,
      elevation: 6,
    },
    playButtonFlash: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: '#fff',
    },
    playButtonActive: {
      opacity: 0.85,
    },
    playText: {
      fontSize: 16,
      fontWeight: '700',
      color: '#fff',
      letterSpacing: 1,
    },
    disabledButton: {
      opacity: 0.45,
    },
    signatureSection: {
      marginTop: 14,
    },
    signatureLabel: {
      color: palette.textMuted,
      fontSize: 14,
      letterSpacing: 0.5,
      marginBottom: 8,
    },
    signatureRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    signatureButton: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: palette.borderStrong,
      backgroundColor: palette.surface,
      paddingHorizontal: 14,
      paddingVertical: 8,
      minWidth: 66,
      alignItems: 'center',
    },
    signatureButtonActive: {
      backgroundColor: palette.primary,
      borderColor: palette.primary,
    },
    signatureText: {
      fontSize: 13,
      fontWeight: '600',
      color: palette.text,
      letterSpacing: 0.4,
    },
    signatureTextActive: {
      color: '#fff',
    },
    toggleRow: {
      marginTop: 14,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    toggleLabel: {
      color: palette.textMuted,
      fontSize: 14,
      letterSpacing: 0.5,
    },
    togglePill: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: palette.borderStrong,
      backgroundColor: palette.surface,
      paddingHorizontal: 14,
      paddingVertical: 8,
      minWidth: 62,
      alignItems: 'center',
    },
    togglePillActive: {
      backgroundColor: palette.primary,
      borderColor: palette.primary,
    },
    toggleText: {
      fontSize: 13,
      fontWeight: '600',
      color: palette.text,
    },
    toggleTextActive: {
      color: '#fff',
    },
    savePresetButton: {
      marginTop: 14,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: palette.primary,
      backgroundColor: palette.primary,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 11,
    },
    savePresetText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    presetsSection: {
      marginTop: 14,
      borderTopWidth: 1,
      borderTopColor: palette.border,
      paddingTop: 12,
    },
    presetsLabel: {
      color: palette.textMuted,
      fontSize: 13,
      letterSpacing: 2,
      textTransform: 'uppercase',
    },
    presetsEmpty: {
      marginTop: 8,
      color: palette.textMuted,
      fontSize: 14,
    },
    presetsList: {
      marginTop: 8,
      gap: 8,
    },
    presetItem: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.surfaceSoft,
      paddingLeft: 12,
      paddingRight: 8,
      paddingVertical: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    presetLoadArea: {
      flex: 1,
    },
    presetTitle: {
      color: palette.text,
      fontSize: 15,
      fontWeight: '600',
    },
    presetMeta: {
      marginTop: 4,
      color: palette.textMuted,
      fontSize: 13,
    },
    presetDeleteButton: {
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: palette.borderStrong,
      backgroundColor: palette.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    presetDeleteText: {
      color: palette.text,
      fontSize: 12,
      fontWeight: '700',
      lineHeight: 14,
    },
    songsModalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.38)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 22,
    },
    songsModalDismiss: {
      ...StyleSheet.absoluteFillObject,
    },
    songsModalCard: {
      width: '100%',
      maxWidth: 420,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.surface,
      padding: 16,
      gap: 12,
    },
    songsModalTitle: {
      color: palette.text,
      fontSize: 20,
      fontWeight: '700',
    },
    songSearchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    songSearchInput: {
      flex: 1,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.surfaceSoft,
      color: palette.text,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 14,
    },
    songSearchButton: {
      borderRadius: 10,
      borderWidth: 1,
      borderColor: palette.borderStrong,
      backgroundColor: palette.surfaceSoft,
      paddingHorizontal: 12,
      paddingVertical: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    songSearchButtonText: {
      color: palette.textMuted,
      fontSize: 11,
      letterSpacing: 1.4,
      fontWeight: '700',
    },
    songsModalList: {
      gap: 8,
    },
    songOptionRow: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.surfaceSoft,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    songOptionRowActive: {
      borderColor: palette.primary,
      backgroundColor: palette.surface,
    },
    songOptionTitle: {
      color: palette.text,
      fontSize: 15,
      fontWeight: '600',
    },
    songOptionMeta: {
      marginTop: 4,
      color: palette.textMuted,
      fontSize: 12,
      letterSpacing: 1,
    },
    songSearchEmpty: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.surfaceSoft,
      paddingVertical: 12,
      paddingHorizontal: 10,
    },
    songSearchEmptyText: {
      color: palette.textMuted,
      fontSize: 12,
      textAlign: 'center',
    },
    songsModalClose: {
      alignSelf: 'flex-end',
      borderRadius: 999,
      borderWidth: 1,
      borderColor: palette.borderStrong,
      backgroundColor: palette.surfaceSoft,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    songsModalCloseText: {
      color: palette.textMuted,
      fontSize: 11,
      letterSpacing: 2,
      fontWeight: '700',
    },
  });
