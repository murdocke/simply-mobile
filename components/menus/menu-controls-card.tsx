import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useMetronome } from '@/components/metronome/metronome-provider';
import { useAppTheme } from '@/components/theme/app-theme-provider';
import { useMenuPalette } from '@/components/menus/menu-theme';

type MenuControlsCardProps = {
  onOpenMetronome: () => void;
};

export function MenuControlsCard({ onOpenMetronome }: MenuControlsCardProps) {
  const { mode, setMode } = useAppTheme();
  const { bpm, setBpm, isPlaying, setIsPlaying } = useMetronome();
  const menuPalette = useMenuPalette();
  const styles = useMemo(() => createStyles(menuPalette, mode), [menuPalette, mode]);

  return (
    <View style={styles.wrap}>
      <View style={styles.themeRow}>
        <Pressable
          style={[styles.themeBtn, mode === 'light' && styles.themeBtnActiveLight]}
          onPress={() => setMode('light')}>
          <Text style={[styles.themeBtnText, mode === 'light' && styles.themeBtnTextActive]}>Light</Text>
        </Pressable>
        <Pressable
          style={[styles.themeBtn, mode === 'dark' && styles.themeBtnActiveDark]}
          onPress={() => setMode('dark')}>
          <Text style={[styles.themeBtnText, mode === 'dark' && styles.themeBtnTextActive]}>Dark</Text>
        </Pressable>
      </View>
      <View style={styles.divider} />

      <View style={styles.metHeadRow}>
        <Pressable onPress={onOpenMetronome} style={styles.metOpenLabelButton}>
          <Text style={styles.metOpenLabelText}>Metronome</Text>
        </Pressable>
        <Pressable
          style={[styles.playBtn, isPlaying && styles.playBtnActive]}
          onPress={() => setIsPlaying((prev) => !prev)}>
          <Text style={[styles.playBtnText, isPlaying && styles.playBtnTextActive]}>
            {isPlaying ? 'Stop' : 'Start'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.bpmRow}>
        <Pressable style={styles.stepBtn} onPress={() => setBpm((prev) => Math.max(30, prev - 1))}>
          <Text style={styles.stepBtnText}>-</Text>
        </Pressable>
        <Text style={styles.bpmText}>{bpm} BPM</Text>
        <Pressable style={styles.stepBtn} onPress={() => setBpm((prev) => Math.min(260, prev + 1))}>
          <Text style={styles.stepBtnText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const createStyles = (menuPalette: ReturnType<typeof useMenuPalette>, mode: 'light' | 'dark') =>
  StyleSheet.create({
    wrap: {
      marginTop: 12,
      marginBottom: 4,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: menuPalette.glassBorder,
      backgroundColor: menuPalette.itemBackground,
      padding: 10,
      gap: 10,
    },
    label: {
      color: menuPalette.text,
      fontSize: 11,
      letterSpacing: 1.2,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    themeRow: {
      flexDirection: 'row',
      gap: 8,
    },
    themeBtn: {
      flex: 1,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: menuPalette.glassBorder,
      paddingVertical: 8,
      alignItems: 'center',
      backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.3)',
    },
    themeBtnActiveLight: {
      backgroundColor: '#5a6270',
      borderColor: '#5a6270',
    },
    themeBtnActiveDark: {
      backgroundColor: '#14161a',
      borderColor: '#14161a',
    },
    themeBtnText: {
      color: menuPalette.text,
      fontSize: 13,
      fontWeight: '600',
    },
    themeBtnTextActive: {
      color: '#fff',
    },
    divider: {
      height: 1,
      backgroundColor: menuPalette.glassBorder,
      opacity: 0.8,
      marginTop: 2,
      marginBottom: 2,
    },
    metHeadRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 2,
    },
    metOpenLabelButton: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: menuPalette.glassBorder,
      backgroundColor: menuPalette.itemBackground,
      paddingVertical: 6,
      paddingHorizontal: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    metOpenLabelText: {
      color: menuPalette.text,
      fontSize: 11,
      letterSpacing: 1.2,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    playBtn: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: menuPalette.glassBorder,
      backgroundColor: menuPalette.itemBackground,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    playBtnActive: {
      backgroundColor: menuPalette.primary,
      borderColor: menuPalette.primary,
    },
    playBtnText: {
      color: menuPalette.text,
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    playBtnTextActive: {
      color: '#ffffff',
    },
    bpmRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    stepBtn: {
      width: 34,
      height: 30,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: menuPalette.glassBorder,
      backgroundColor: menuPalette.itemBackground,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepBtnText: {
      color: menuPalette.text,
      fontSize: 16,
      fontWeight: '700',
      marginTop: -1,
    },
    bpmText: {
      color: menuPalette.text,
      fontSize: 14,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
  });
