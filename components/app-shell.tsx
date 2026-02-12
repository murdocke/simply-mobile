import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, usePathname } from 'expo-router';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMetronome } from '@/components/metronome/metronome-provider';
import { useAppTheme } from '@/components/theme/app-theme-provider';
import { LeftMenuPanel, type MenuItem } from '@/components/menus/left-menu-panel';
import { QuickActionsMenu, type QuickActionItem } from '@/components/menus/quick-actions-menu';
import { RightPanel } from '@/components/menus/right-panel';
import { useMenuPalette } from '@/components/menus/menu-theme';
import { consumeLeftMenuNudgeForNextShell } from '@/components/navigation/menu-nudge-session';

type RightPanelAutoOpenMode = 'none' | 'always' | 'once-per-app-open';
type RightPanelNudgeMode = 'none' | 'first-visit' | 'every-visit';

type AppShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  menuItems: MenuItem[];
  quickActions: QuickActionItem[];
  user?: string;
  rightPanelTitle?: string;
  rightPanelContent?: ReactNode;
  showRightPanelWhenEmpty?: boolean;
  rightPanelAutoOpen?: RightPanelAutoOpenMode;
  rightPanelNudgeOnFirstVisit?: boolean;
  rightPanelNudgeMode?: RightPanelNudgeMode;
  rightPanelVisitKey?: string;
};

const PANEL_PEEK_WIDTH = 10;
const PANEL_SIDE_INSET = 16;
const PANEL_WIDTH = 260;
const EDGE_SWIPE_ZONE_WIDTH = 32;
const EDGE_SWIPE_TRIGGER = 28;
const EDGE_SWIPE_ACTIVATE = 8;
const rightPanelVisitedKeys = new Set<string>();
const rightPanelNudgedKeys = new Set<string>();

export function AppShell({
  title,
  subtitle,
  children,
  menuItems,
  quickActions,
  user,
  rightPanelTitle = 'Details',
  rightPanelContent,
  showRightPanelWhenEmpty = false,
  rightPanelAutoOpen = 'none',
  rightPanelNudgeOnFirstVisit = false,
  rightPanelNudgeMode = 'none',
  rightPanelVisitKey,
}: AppShellProps) {
  const menuPalette = useMenuPalette();
  const { mode } = useAppTheme();
  const styles = useMemo(() => createStyles(menuPalette, mode), [menuPalette, mode]);
  const [leftOpen, setLeftOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [leftMenuNudging, setLeftMenuNudging] = useState(false);
  const [rightPanelNudging, setRightPanelNudging] = useState(false);
  const [topPanel, setTopPanel] = useState<'left' | 'right'>('left');
  const leftAnim = useRef(new Animated.Value(0)).current;
  const quickAnim = useRef(new Animated.Value(0)).current;
  const rightAnim = useRef(new Animated.Value(0)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const miniGlowOpacity = useRef(new Animated.Value(0)).current;
  const miniPulseScale = useRef(new Animated.Value(1)).current;
  const [miniVolumeTrackWidth, setMiniVolumeTrackWidth] = useState(1);
  const [miniVolumeTrackPageX, setMiniVolumeTrackPageX] = useState(0);
  const miniVolumeSliderRef = useRef<View | null>(null);
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const { bpm, isPlaying, setIsPlaying, beatPulse, volume, setVolume } = useMetronome();
  const showMiniMetronome = isPlaying && pathname !== '/metronome';
  const hasRightPanelContent = rightPanelContent != null;
  const canUseRightPanel = hasRightPanelContent || showRightPanelWhenEmpty;
  const panelVisitKey = rightPanelVisitKey ?? pathname;
  const lastNudgedVisitKeyRef = useRef<string | null>(null);

  const leftTranslateX = leftAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-(PANEL_WIDTH + PANEL_SIDE_INSET - PANEL_PEEK_WIDTH), 0],
  });
  const quickTranslateY = quickAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [24, 0],
  });
  const quickOpacity = quickAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const rightTranslateX = rightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [PANEL_WIDTH + PANEL_SIDE_INSET - PANEL_PEEK_WIDTH, 0],
  });

  useEffect(() => {
    if (!canUseRightPanel && rightOpen) {
      setRightOpen(false);
      Animated.timing(rightAnim, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }).start();
    }
  }, [canUseRightPanel, rightAnim, rightOpen]);

  useEffect(() => {
    const shouldShow = leftOpen || rightOpen || quickOpen;
    Animated.timing(overlayAnim, {
      toValue: shouldShow ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [leftOpen, rightOpen, quickOpen, overlayAnim]);

  useEffect(() => {
    if (!showMiniMetronome) {
      miniGlowOpacity.stopAnimation();
      miniPulseScale.stopAnimation();
      miniGlowOpacity.setValue(0);
      miniPulseScale.setValue(1);
      return;
    }

    const accentPulse = beatPulse.accented;
    const glowPeak = accentPulse ? 0.45 : 0.24;
    const scalePeak = accentPulse ? 1.06 : 1.03;

    miniGlowOpacity.stopAnimation();
    miniPulseScale.stopAnimation();

    Animated.parallel([
      Animated.sequence([
        Animated.timing(miniGlowOpacity, {
          toValue: glowPeak,
          duration: 65,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(miniGlowOpacity, {
          toValue: 0,
          duration: 180,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(miniPulseScale, {
          toValue: scalePeak,
          duration: 65,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(miniPulseScale, {
          toValue: 1,
          duration: 180,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [beatPulse.accented, beatPulse.tick, miniGlowOpacity, miniPulseScale, showMiniMetronome]);

  const measureMiniVolumeSlider = useCallback(() => {
    if (!miniVolumeSliderRef.current) return;
    miniVolumeSliderRef.current.measureInWindow((x, _y, width) => {
      setMiniVolumeTrackPageX(x);
      setMiniVolumeTrackWidth(Math.max(1, width));
    });
  }, []);

  useEffect(() => {
    if (showMiniMetronome) {
      requestAnimationFrame(measureMiniVolumeSlider);
    }
  }, [measureMiniVolumeSlider, showMiniMetronome]);

  const updateMiniVolumeFromPageX = useCallback(
    (pageX: number) => {
      const touchX = pageX - miniVolumeTrackPageX;
      const ratio = Math.min(1, Math.max(0, touchX / miniVolumeTrackWidth));
      setVolume((prev) => (Math.abs(prev - ratio) < 0.001 ? prev : ratio));
    },
    [miniVolumeTrackPageX, miniVolumeTrackWidth, setVolume]
  );

  const miniVolumePanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          updateMiniVolumeFromPageX(event.nativeEvent.pageX);
        },
        onPanResponderMove: (event) => {
          updateMiniVolumeFromPageX(event.nativeEvent.pageX);
        },
      }),
    [updateMiniVolumeFromPageX]
  );

  const miniVolumeFillWidth = Math.max(0, Math.min(1, volume) * miniVolumeTrackWidth);
  const miniVolumeThumbLeft = Math.max(0, miniVolumeFillWidth - 7);

  const showLeftMenu = useCallback((open: boolean) => {
    if (open) {
      setTopPanel('left');
    }
    setLeftOpen(open);
    Animated.timing(leftAnim, {
      toValue: open ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [leftAnim]);

  const showQuickMenu = useCallback((open: boolean) => {
    if (open) {
      if (leftOpen) {
        setLeftOpen(false);
        Animated.timing(leftAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }).start();
      }
      if (rightOpen) {
        setRightOpen(false);
        Animated.timing(rightAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }).start();
      }
    }
    setQuickOpen(open);
    Animated.timing(quickAnim, {
      toValue: open ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [leftAnim, leftOpen, quickAnim, rightAnim, rightOpen]);

  const showRightPanel = useCallback((open: boolean) => {
    if (!canUseRightPanel) return;
    if (open) {
      setTopPanel('right');
    }
    setRightOpen(open);
    Animated.timing(rightAnim, {
      toValue: open ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [canUseRightPanel, rightAnim]);

  const playLeftMenuNudge = useCallback(() => {
    setLeftMenuNudging(true);
    setTopPanel('left');
    leftAnim.stopAnimation();
    setLeftOpen(false);
    leftAnim.setValue(0);
    requestAnimationFrame(() => {
      setLeftOpen(true);
      Animated.sequence([
        Animated.delay(220),
        Animated.timing(leftAnim, {
          toValue: 1,
          duration: 360,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.delay(420),
        Animated.timing(leftAnim, {
          toValue: 0.92,
          duration: 95,
          useNativeDriver: true,
        }),
        Animated.timing(leftAnim, {
          toValue: 1,
          duration: 82,
          useNativeDriver: true,
        }),
        Animated.delay(180),
        Animated.timing(leftAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setLeftMenuNudging(false);
        setLeftOpen(false);
      });
    });
  }, [leftAnim]);

  useEffect(() => {
    if (consumeLeftMenuNudgeForNextShell()) {
      playLeftMenuNudge();
    }
  }, [playLeftMenuNudge]);

  const playRightPanelNudge = useCallback(() => {
    if (!canUseRightPanel) return;
    setRightPanelNudging(true);
    setTopPanel('right');
    rightAnim.stopAnimation();
    setRightOpen(false);
    rightAnim.setValue(0);
    requestAnimationFrame(() => {
      setRightOpen(true);
      Animated.sequence([
        Animated.delay(900),
        Animated.timing(rightAnim, {
          toValue: 0.5,
          duration: 420,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.delay(560),
        Animated.timing(rightAnim, {
          toValue: 0.44,
          duration: 86,
          useNativeDriver: true,
        }),
        Animated.timing(rightAnim, {
          toValue: 0.5,
          duration: 72,
          useNativeDriver: true,
        }),
        Animated.timing(rightAnim, {
          toValue: 0.41,
          duration: 109,
          useNativeDriver: true,
        }),
        Animated.timing(rightAnim, {
          toValue: 0.48,
          duration: 67,
          useNativeDriver: true,
        }),
        Animated.timing(rightAnim, {
          toValue: 0.5,
          duration: 93,
          useNativeDriver: true,
        }),
        Animated.delay(240),
        Animated.timing(rightAnim, {
          toValue: 0,
          duration: 320,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        setRightPanelNudging(false);
        setRightOpen(false);
        if (!finished) {
          rightAnim.setValue(0);
        }
      });
    });
  }, [canUseRightPanel, rightAnim]);

  useEffect(() => {
    if (!canUseRightPanel) return;

    const isFirstVisit = !rightPanelVisitedKeys.has(panelVisitKey);
    if (isFirstVisit) {
      rightPanelVisitedKeys.add(panelVisitKey);
    }

    const effectiveNudgeMode: RightPanelNudgeMode =
      rightPanelNudgeMode !== 'none'
        ? rightPanelNudgeMode
        : rightPanelNudgeOnFirstVisit
          ? 'first-visit'
          : 'none';

    if (
      effectiveNudgeMode === 'every-visit' &&
      lastNudgedVisitKeyRef.current !== panelVisitKey
    ) {
      lastNudgedVisitKeyRef.current = panelVisitKey;
      playRightPanelNudge();
      return;
    }

    if (
      effectiveNudgeMode === 'first-visit' &&
      isFirstVisit &&
      !rightPanelNudgedKeys.has(panelVisitKey)
    ) {
      rightPanelNudgedKeys.add(panelVisitKey);
      playRightPanelNudge();
      return;
    }

    if (rightPanelAutoOpen === 'always') {
      showRightPanel(true);
      return;
    }

    if (rightPanelAutoOpen === 'once-per-app-open' && isFirstVisit) {
      showRightPanel(true);
    }
  }, [
    canUseRightPanel,
    panelVisitKey,
    playRightPanelNudge,
    rightPanelAutoOpen,
    rightPanelNudgeMode,
    rightPanelNudgeOnFirstVisit,
    showRightPanel,
  ]);

  const leftEdgeSwipeResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_event, gestureState) => {
          if (quickOpen || rightOpen) return false;
          const absDx = Math.abs(gestureState.dx);
          const absDy = Math.abs(gestureState.dy);
          if (absDx < EDGE_SWIPE_ACTIVATE || absDx <= absDy) return false;

          if (leftOpen) {
            return gestureState.dx < 0;
          }

          return gestureState.dx > 0;
        },
        onPanResponderRelease: (_event, gestureState) => {
          if (leftOpen) {
            if (gestureState.dx <= -EDGE_SWIPE_TRIGGER) {
              showLeftMenu(false);
            }
            return;
          }

          if (gestureState.dx >= EDGE_SWIPE_TRIGGER) {
            showLeftMenu(true);
          }
        },
      }),
    [leftOpen, quickOpen, rightOpen, showLeftMenu]
  );

  const rightEdgeSwipeResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_event, gestureState) => {
          if (!canUseRightPanel || quickOpen || leftOpen) return false;
          const absDx = Math.abs(gestureState.dx);
          const absDy = Math.abs(gestureState.dy);
          if (absDx < EDGE_SWIPE_ACTIVATE || absDx <= absDy) return false;

          if (rightOpen) {
            return gestureState.dx > 0;
          }

          return gestureState.dx < 0;
        },
        onPanResponderRelease: (_event, gestureState) => {
          if (rightOpen) {
            if (gestureState.dx >= EDGE_SWIPE_TRIGGER) {
              showRightPanel(false);
            }
            return;
          }

          if (gestureState.dx <= -EDGE_SWIPE_TRIGGER) {
            showRightPanel(true);
          }
        },
      }),
    [canUseRightPanel, leftOpen, quickOpen, rightOpen, showRightPanel]
  );

  const subtitleLine = useMemo(() => subtitle?.trim(), [subtitle]);

  return (
    <View style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView
          style={styles.contentScroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.body}>{children}</View>
        </ScrollView>

        {showMiniMetronome ? (
          <Animated.View
            style={[
              styles.miniMetronomeWrap,
              { bottom: Math.max(insets.bottom + 18, 28), transform: [{ scale: miniPulseScale }] },
            ]}>
            <Animated.View
              pointerEvents="none"
              style={[styles.miniMetronomeGlow, { opacity: miniGlowOpacity }]}
            />
            <View style={styles.miniMetronomeCard}>
              <View style={styles.miniMetronomeHead}>
                <Text style={styles.miniMetronomeOverline}>METRONOME</Text>
                <Text style={styles.miniMetronomeTempo}>{bpm} BPM</Text>
              </View>
              <View
                ref={miniVolumeSliderRef}
                style={styles.miniVolumeWrap}
                onLayout={measureMiniVolumeSlider}
                {...miniVolumePanResponder.panHandlers}>
                <View style={styles.miniVolumeTrack} pointerEvents="none" />
                <View style={[styles.miniVolumeFill, { width: miniVolumeFillWidth }]} pointerEvents="none" />
                <View style={[styles.miniVolumeThumb, { left: miniVolumeThumbLeft }]} pointerEvents="none" />
              </View>
              <View style={styles.miniMetronomeActions}>
                <Pressable
                  onPress={() => setIsPlaying(false)}
                  style={({ pressed }) => [styles.miniStopButton, pressed && styles.miniButtonPressed]}>
                  <Text style={styles.miniStopText}>Stop</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    const target = user
                      ? `/metronome?user=${encodeURIComponent(user)}`
                      : '/metronome';
                    router.replace(target as never);
                  }}
                  style={({ pressed }) => [styles.miniOpenButton, pressed && styles.miniButtonPressed]}>
                  <Text style={styles.miniOpenText}>Open</Text>
                </Pressable>
              </View>
            </View>
          </Animated.View>
        ) : null}

        <Pressable
          onPress={() => showLeftMenu(!leftOpen)}
          style={({ pressed }) => [
            styles.topFab,
            mode === 'light' && !leftOpen && styles.closedPeekStrong,
            pressed && styles.topFabPressed,
          ]}>
          <Text style={styles.topFabIcon}>{leftOpen ? '‹' : '≡'}</Text>
        </Pressable>

        <View
          pointerEvents="box-only"
          style={[styles.edgeSwipeZone, styles.edgeSwipeZoneLeft]}
          {...leftEdgeSwipeResponder.panHandlers}
        />

        <Pressable
          onPress={() => showQuickMenu(!quickOpen)}
          style={({ pressed }) => [
            styles.bottomFab,
            mode === 'light' && !quickOpen && styles.bottomFabClosedLight,
            pressed && styles.bottomFabPressed,
          ]}>
          <BlurView
            pointerEvents="none"
            intensity={mode === 'light' ? 18 : 22}
            tint="default"
            experimentalBlurMethod="dimezisBlurView"
            style={styles.bottomFabBlur}
          />
          <Text style={styles.bottomFabIcon}>{quickOpen ? '×' : '+'}</Text>
        </Pressable>

        {canUseRightPanel ? (
          <>
            <Pressable
              onPress={() => showRightPanel(!rightOpen)}
              style={({ pressed }) => [
                styles.rightTab,
                mode === 'light' && !rightOpen && styles.closedPeekStrong,
                pressed && styles.rightTabPressed,
              ]}>
              <Text style={styles.rightTabIcon}>{rightOpen ? '›' : '‹'}</Text>
            </Pressable>

            <View
              pointerEvents="box-only"
              style={[styles.edgeSwipeZone, styles.edgeSwipeZoneRight]}
              {...rightEdgeSwipeResponder.panHandlers}
            />
          </>
        ) : null}

        {(leftOpen || rightOpen || quickOpen) ? (
          <Animated.View
            style={[
              styles.screenOverlay,
              {
                opacity: overlayAnim,
                top: -insets.top,
                bottom: -insets.bottom,
                backgroundColor: leftMenuNudging || rightPanelNudging
                  ? 'transparent'
                  : quickOpen
                  ? menuPalette.overlay
                  : mode === 'light'
                    ? 'rgba(20, 24, 30, 0.12)'
                    : 'rgba(0, 0, 0, 0.32)',
              },
            ]}
            pointerEvents={leftOpen || rightOpen || quickOpen ? 'auto' : 'none'}>
            <Pressable
              style={styles.leftOverlayPressable}
              onPress={() => {
                showLeftMenu(false);
                showRightPanel(false);
                showQuickMenu(false);
              }}
            />
          </Animated.View>
        ) : null}

        <Animated.View
          pointerEvents={quickOpen ? 'auto' : 'none'}
          style={[
            styles.quickMenu,
            {
              opacity: quickOpacity,
              transform: [{ translateY: quickTranslateY }],
            },
          ]}>
          <QuickActionsMenu actions={quickActions} />
        </Animated.View>

        <Animated.View
          pointerEvents={leftOpen ? 'auto' : 'none'}
          style={[
            styles.leftPanel,
            mode === 'light' && !leftOpen && styles.closedPanelPeekLight,
            topPanel === 'left' ? styles.leftPanelTop : styles.leftPanelBase,
            {
              transform: [{ translateX: leftTranslateX }],
            },
          ]}>
          <LeftMenuPanel
            items={menuItems}
            user={user}
            onLogout={() => {
              showLeftMenu(false);
              router.replace('/login');
            }}
            onSelect={(route) => {
              showLeftMenu(false);
              const target = user
                ? `${route}${route.includes('?') ? '&' : '?'}user=${encodeURIComponent(user)}`
                : route;
              router.replace(target as never);
            }}
          />
        </Animated.View>

        {canUseRightPanel ? (
          <Animated.View
            pointerEvents={rightOpen ? 'auto' : 'none'}
            style={[
              styles.rightPanel,
              mode === 'light' && !rightOpen && styles.closedPanelPeekLight,
              topPanel === 'right' ? styles.rightPanelTop : styles.rightPanelBase,
              {
                transform: [{ translateX: rightTranslateX }],
              },
            ]}>
            <RightPanel title={rightPanelTitle}>
              {hasRightPanelContent ? (
                rightPanelContent
              ) : (
                <Text style={styles.rightBodyText}>Right-side panel content goes here.</Text>
              )}
            </RightPanel>
          </Animated.View>
        ) : null}
      </View>
    </View>
  );
}

const createStyles = (menuPalette: ReturnType<typeof useMenuPalette>, mode: 'light' | 'dark') =>
  StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: mode === 'light' ? '#e9ebee' : menuPalette.background,
  },
  container: {
    flex: 1,
    backgroundColor: mode === 'light' ? '#e9ebee' : menuPalette.background,
  },
  contentScroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 35,
  },
  body: {
    paddingTop: 60,
  },
  topFab: {
    position: 'absolute',
    top: 161,
    left: -8,
    width: 36,
    height: 76,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    backgroundColor: menuPalette.itemBackground,
    borderWidth: 0.9,
    borderColor: mode === 'light' ? 'rgba(150, 160, 176, 0.285)' : 'rgba(155, 145, 134, 0.345)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: menuPalette.shadow,
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    zIndex: 12,
    elevation: 0,
  },
  topFabPressed: {
    opacity: 0.9,
  },
  topFabIcon: {
    color: menuPalette.text,
    fontSize: 22,
    fontWeight: '800',
  },
  bottomFab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: mode === 'light' ? 'rgba(255, 255, 255, 0.62)' : 'rgba(48, 42, 38, 0.62)',
    borderWidth: 0.9,
    borderColor: mode === 'light' ? 'rgba(150, 160, 176, 0.285)' : 'rgba(155, 145, 134, 0.345)',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: menuPalette.shadow,
    shadowOpacity: 0.24,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    zIndex: 13,
    elevation: 5,
  },
  bottomFabPressed: {
    opacity: 0.9,
  },
  bottomFabIcon: {
    color: menuPalette.text,
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 28,
  },
  bottomFabBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  bottomFabClosedLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.62)',
    borderColor: 'rgba(150, 160, 176, 0.285)',
    shadowOpacity: 0.34,
  },
  rightTab: {
    position: 'absolute',
    right: -8,
    top: 280,
    width: 36,
    height: 76,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
    backgroundColor: menuPalette.itemBackground,
    borderWidth: 0.9,
    borderColor: mode === 'light' ? 'rgba(150, 160, 176, 0.285)' : 'rgba(155, 145, 134, 0.345)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: menuPalette.shadow,
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    zIndex: 12,
    elevation: 0,
  },
  rightTabPressed: {
    opacity: 0.9,
  },
  rightTabIcon: {
    fontSize: 22,
    color: menuPalette.text,
    fontWeight: '800',
  },
  edgeSwipeZone: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: EDGE_SWIPE_ZONE_WIDTH,
    zIndex: 5,
  },
  edgeSwipeZoneLeft: {
    left: 0,
  },
  edgeSwipeZoneRight: {
    right: 0,
  },
  closedPeekStrong: {
    backgroundColor: '#f7f8fa',
    borderColor: mode === 'light' ? 'rgba(150, 160, 176, 0.285)' : 'rgba(155, 145, 134, 0.345)',
    shadowOpacity: 0.34,
  },
  closedPanelPeekLight: {
    backgroundColor: '#ffffff',
    borderRadius: 32,
  },
  screenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.14)',
  },
  leftOverlayPressable: {
    flex: 1,
  },
  leftPanel: {
    position: 'absolute',
    top: 70,
    left: 16,
    width: 260,
    maxHeight: '75%',
  },
  leftPanelBase: {
    zIndex: 6,
    elevation: 6,
  },
  leftPanelTop: {
    zIndex: 8,
    elevation: 8,
  },
  quickMenu: {
    position: 'absolute',
    right: 46,
    bottom: 60,
    width: 200,
  },
  miniMetronomeWrap: {
    position: 'absolute',
    left: 18,
    width: 190,
    zIndex: 9,
    elevation: 9,
  },
  miniMetronomeGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
    backgroundColor: menuPalette.primary,
    shadowColor: menuPalette.shadow,
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
  },
  miniMetronomeCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: menuPalette.itemBorder,
    backgroundColor: menuPalette.itemBackground,
    paddingHorizontal: 12,
    paddingVertical: 10,
    overflow: 'hidden',
  },
  miniMetronomeHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  miniMetronomeOverline: {
    color: menuPalette.muted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.3,
  },
  miniMetronomeTempo: {
    color: menuPalette.primary,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  miniMetronomeActions: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 8,
  },
  miniVolumeWrap: {
    marginTop: 8,
    height: 16,
    justifyContent: 'center',
  },
  miniVolumeTrack: {
    height: 4,
    borderRadius: 999,
    backgroundColor: menuPalette.itemBorder,
  },
  miniVolumeFill: {
    position: 'absolute',
    left: 0,
    height: 4,
    borderRadius: 999,
    backgroundColor: menuPalette.primary,
  },
  miniVolumeThumb: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: menuPalette.primary,
    backgroundColor: menuPalette.glass,
  },
  miniStopButton: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: menuPalette.glassBorder,
    backgroundColor: menuPalette.itemBackground,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniOpenButton: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: menuPalette.primary,
    backgroundColor: menuPalette.primary,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniStopText: {
    color: menuPalette.text,
    fontSize: 12,
    fontWeight: '700',
  },
  miniOpenText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  miniButtonPressed: {
    opacity: 0.88,
  },
  rightPanel: {
    position: 'absolute',
    top: 220,
    right: 16,
    width: 260,
    maxHeight: '70%',
  },
  rightPanelBase: {
    zIndex: 6,
    elevation: 6,
  },
  rightPanelTop: {
    zIndex: 8,
    elevation: 8,
  },
  rightBodyText: {
    fontSize: 14,
    color: menuPalette.muted,
  },
});
