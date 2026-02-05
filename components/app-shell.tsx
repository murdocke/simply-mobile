import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LeftMenuPanel, type MenuItem } from '@/components/menus/left-menu-panel';
import { QuickActionsMenu, type QuickActionItem } from '@/components/menus/quick-actions-menu';
import { RightPanel } from '@/components/menus/right-panel';
import { menuPalette } from '@/components/menus/menu-theme';

type AppShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  menuItems: MenuItem[];
  quickActions: QuickActionItem[];
  user?: string;
  rightPanelTitle?: string;
  rightPanelContent?: ReactNode;
};

export function AppShell({
  title,
  subtitle,
  children,
  menuItems,
  quickActions,
  user,
  rightPanelTitle = 'Details',
  rightPanelContent,
}: AppShellProps) {
  const [leftOpen, setLeftOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const leftAnim = useRef(new Animated.Value(0)).current;
  const quickAnim = useRef(new Animated.Value(0)).current;
  const rightAnim = useRef(new Animated.Value(0)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  const leftTranslateX = leftAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-260, 0],
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
    outputRange: [260, 0],
  });

  useEffect(() => {
    const shouldShow = leftOpen || rightOpen || quickOpen;
    Animated.timing(overlayAnim, {
      toValue: shouldShow ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [leftOpen, rightOpen, quickOpen, overlayAnim]);

  const showLeftMenu = (open: boolean) => {
    setLeftOpen(open);
    Animated.timing(leftAnim, {
      toValue: open ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  };

  const showQuickMenu = (open: boolean) => {
    setQuickOpen(open);
    Animated.timing(quickAnim, {
      toValue: open ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const showRightPanel = (open: boolean) => {
    setRightOpen(open);
    Animated.timing(rightAnim, {
      toValue: open ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  };

  const subtitleLine = useMemo(() => subtitle?.trim(), [subtitle]);
  const userParam = user ? { user } : undefined;

  return (
    <View style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView
          style={styles.contentScroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.body}>{children}</View>
        </ScrollView>

        <Pressable
          onPress={() => showLeftMenu(!leftOpen)}
          style={({ pressed }) => [styles.topFab, pressed && styles.topFabPressed]}>
          <Text style={styles.topFabIcon}>{leftOpen ? '‹' : '≡'}</Text>
        </Pressable>

        <Pressable
          onPress={() => showQuickMenu(!quickOpen)}
          style={({ pressed }) => [styles.bottomFab, pressed && styles.bottomFabPressed]}>
          <Text style={styles.bottomFabIcon}>{quickOpen ? '×' : '+'}</Text>
        </Pressable>

        <Pressable
          onPress={() => showRightPanel(!rightOpen)}
          style={({ pressed }) => [styles.rightTab, pressed && styles.rightTabPressed]}>
          <Text style={styles.rightTabIcon}>{rightOpen ? '›' : '‹'}</Text>
        </Pressable>

        {(leftOpen || rightOpen || quickOpen) ? (
          <Animated.View
            style={[
              styles.screenOverlay,
              { opacity: overlayAnim, top: -insets.top, bottom: -insets.bottom },
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
            {
              transform: [{ translateX: leftTranslateX }],
            },
          ]}>
          <LeftMenuPanel
            items={menuItems}
            onSelect={(route) => {
              showLeftMenu(false);
              router.replace({ pathname: route, params: userParam });
            }}
          />
        </Animated.View>

        <Animated.View
          pointerEvents={rightOpen ? 'auto' : 'none'}
          style={[
            styles.rightPanel,
            {
              transform: [{ translateX: rightTranslateX }],
            },
          ]}>
          <RightPanel title={rightPanelTitle}>
            {rightPanelContent ?? (
              <Text style={styles.rightBodyText}>Right-side panel content goes here.</Text>
            )}
          </RightPanel>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: menuPalette.background,
  },
  container: {
    flex: 1,
    backgroundColor: menuPalette.background,
  },
  contentScroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  body: {
    paddingTop: 60,
  },
  topFab: {
    position: 'absolute',
    top: 136,
    left: -8,
    width: 36,
    height: 76,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    backgroundColor: menuPalette.glass,
    borderWidth: 1,
    borderColor: menuPalette.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 4, height: 4 },
    zIndex: 12,
    elevation: 12,
  },
  topFabPressed: {
    opacity: 0.9,
  },
  topFabIcon: {
    color: menuPalette.muted,
    fontSize: 22,
    fontWeight: '600',
  },
  bottomFab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: menuPalette.glass,
    borderWidth: 1,
    borderColor: menuPalette.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  bottomFabPressed: {
    opacity: 0.9,
  },
  bottomFabIcon: {
    color: menuPalette.muted,
    fontSize: 26,
    fontWeight: '600',
    lineHeight: 28,
  },
  rightTab: {
    position: 'absolute',
    right: -8,
    top: 280,
    width: 36,
    height: 76,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
    backgroundColor: menuPalette.glass,
    borderWidth: 1,
    borderColor: menuPalette.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: -4, height: 4 },
    zIndex: 12,
    elevation: 12,
  },
  rightTabPressed: {
    opacity: 0.9,
  },
  rightTabIcon: {
    fontSize: 22,
    color: menuPalette.muted,
    fontWeight: '600',
  },
  screenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: menuPalette.overlay,
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
    zIndex: 6,
    elevation: 6,
  },
  quickMenu: {
    position: 'absolute',
    right: 46,
    bottom: 60,
    width: 200,
  },
  rightPanel: {
    position: 'absolute',
    top: 220,
    bottom: 110,
    right: 16,
    width: 260,
    zIndex: 6,
    elevation: 6,
  },
  rightBodyText: {
    fontSize: 14,
    color: menuPalette.muted,
  },
});
