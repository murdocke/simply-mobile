import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/components/theme/app-theme-provider';

type RegionClock = {
  label: string;
  timeZone: string;
};

const REGION_CLOCKS: RegionClock[] = [
  { label: 'Melbourne', timeZone: 'Australia/Melbourne' },
  { label: 'Sacramento', timeZone: 'America/Los_Angeles' },
];

export function LiveRegionClocks() {
  const { palette, mode } = useAppTheme();
  const styles = useMemo(() => createStyles(palette, mode), [palette, mode]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Live Clocks</Text>
      <View style={styles.grid}>
        {REGION_CLOCKS.map((region) => {
          const date = new Intl.DateTimeFormat('en-US', {
            timeZone: region.timeZone,
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }).format(now);
          const time = new Intl.DateTimeFormat('en-US', {
            timeZone: region.timeZone,
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
          }).format(now);

          return (
            <View key={region.timeZone} style={styles.clockCard}>
              <Text style={styles.regionLabel}>{region.label.toUpperCase()}</Text>
              <Text style={styles.clockTime}>{time}</Text>
              <Text style={styles.clockDate}>{date}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (
  palette: ReturnType<typeof useAppTheme>['palette'],
  mode: 'light' | 'dark'
) =>
  StyleSheet.create({
    wrap: {
      minWidth: 290,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: mode === 'light' ? '#eef4fb' : 'rgba(54, 48, 43, 0.55)',
      padding: 10,
      gap: 8,
    },
    title: {
      color: palette.textMuted,
      fontSize: 10,
      letterSpacing: 2.4,
      textTransform: 'uppercase',
      fontWeight: '700',
    },
    grid: {
      flexDirection: 'row',
      gap: 8,
      flexWrap: 'wrap',
    },
    clockCard: {
      flexGrow: 1,
      minWidth: 130,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: mode === 'light' ? '#f8fbff' : 'rgba(34, 30, 27, 0.65)',
      paddingHorizontal: 10,
      paddingVertical: 8,
    },
    regionLabel: {
      color: '#c13b3f',
      fontSize: 10,
      letterSpacing: 2.2,
      fontWeight: '700',
    },
    clockTime: {
      marginTop: 6,
      color: palette.text,
      fontSize: 18,
      fontWeight: '700',
    },
    clockDate: {
      marginTop: 2,
      color: palette.textMuted,
      fontSize: 12,
    },
  });
