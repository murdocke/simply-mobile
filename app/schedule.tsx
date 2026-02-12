import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { AppShell } from '@/components/app-shell';
import { useAppTheme } from '@/components/theme/app-theme-provider';
import { getMenusForRole, getRoleFromUser } from '@/constants/menus';

type Lesson = {
  student: string;
  time: string;
  type: string;
  durationMinutes: number;
};

type ScheduleRow =
  | {
      kind: 'lesson';
      lesson: Lesson;
    }
  | {
      kind: 'gap';
      minutes: number;
      key: string;
    }
  | {
      kind: 'end';
      endTime: string;
      key: string;
    };

const todayLessons = [
  { student: 'Eli', time: '6:00 PM', type: 'Individual · Level 4', durationMinutes: 30 },
  { student: 'Ayaan', time: '7:00 PM', type: 'Individual · Level 3', durationMinutes: 30 },
  { student: 'Josh', time: '8:00 PM', type: 'Individual · Level 2', durationMinutes: 30 },
] satisfies Lesson[];
const lessonsByWeekday: Record<number, Lesson[]> = {
  0: [{ student: 'Mia', time: '4:00 PM', type: 'Individual · Level 1', durationMinutes: 30 }],
  1: [
    { student: 'Luca', time: '3:30 PM', type: 'Individual · Level 2', durationMinutes: 30 },
    { student: 'Nora', time: '5:00 PM', type: 'Individual · Level 3', durationMinutes: 45 },
  ],
  2: [
    { student: 'Dani', time: '5:15 PM', type: 'Individual · Level 2', durationMinutes: 30 },
    { student: 'Remy', time: '6:15 PM', type: 'Individual · Level 4', durationMinutes: 30 },
  ],
  3: todayLessons,
  4: [
    { student: 'Sage', time: '4:30 PM', type: 'Individual · Level 3', durationMinutes: 30 },
    { student: 'Noah', time: '6:00 PM', type: 'Individual · Level 2', durationMinutes: 30 },
    { student: 'Ivy', time: '7:00 PM', type: 'Individual · Level 5', durationMinutes: 45 },
  ],
  5: [{ student: 'Eden', time: '2:00 PM', type: 'Individual · Level 1', durationMinutes: 30 }],
  6: [],
};
const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const weekDotOffsets = [-3, -2, -1, 0, 1, 2, 3];

const parseTimeToMinutes = (time: string) => {
  const [rawHour, rawMinute] = time.split(':');
  const [minutePart, periodPart] = rawMinute.split(' ');
  const period = periodPart.toUpperCase();
  const hour = Number(rawHour);
  const minute = Number(minutePart);

  const normalizedHour = hour % 12;
  const offset = period === 'PM' ? 12 : 0;
  return normalizedHour * 60 + minute + offset * 60;
};

const formatMinutesToTime = (minutes: number) => {
  const normalizedMinutes = ((minutes % 1440) + 1440) % 1440;
  const hours24 = Math.floor(normalizedMinutes / 60);
  const mins = normalizedMinutes % 60;
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hour12 = hours24 % 12 || 12;
  const paddedMinutes = String(mins).padStart(2, '0');

  return `${hour12}:${paddedMinutes} ${period}`;
};

const normalizeDate = (value?: Date | string | number) => {
  const parsed = value instanceof Date ? value : new Date(value ?? Date.now());
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

const addDays = (date: Date, days: number) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
};

const isSameDay = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const formatFullDate = (date: Date) =>
  date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

const formatMonthLabel = (date: Date) =>
  date
    .toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    })
    .toUpperCase();

const getLessonsForDate = (date: Date) => lessonsByWeekday[date.getDay()] ?? [];

const buildMonthGrid = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const firstWeekday = firstDayOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const cells: { date: Date; inCurrentMonth: boolean }[] = [];

  for (let index = 0; index < 42; index += 1) {
    if (index < firstWeekday) {
      const day = daysInPrevMonth - firstWeekday + index + 1;
      cells.push({ date: new Date(year, month - 1, day), inCurrentMonth: false });
      continue;
    }

    if (index < firstWeekday + daysInMonth) {
      const day = index - firstWeekday + 1;
      cells.push({ date: new Date(year, month, day), inCurrentMonth: true });
      continue;
    }

    const day = index - (firstWeekday + daysInMonth) + 1;
    cells.push({ date: new Date(year, month + 1, day), inCurrentMonth: false });
  }

  return Array.from({ length: 6 }, (_, weekIndex) => cells.slice(weekIndex * 7, weekIndex * 7 + 7));
};

const getDateForTime = (baseDateInput: Date | string | number, time: string) => {
  const now = normalizeDate(baseDateInput);
  const totalMinutes = parseTimeToMinutes(time);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const target = new Date(now);
  target.setHours(hours, minutes, 0, 0);

  return target;
};

const getNextLessonCountdown = (
  lessons: Lesson[],
  selectedDateInput: Date | string | number,
  nowInput?: Date | string | number
) => {
  if (lessons.length === 0) {
    return { show: false, prefix: 'STARTS IN', secondsUntilStart: 0 };
  }

  const selectedDate = normalizeDate(selectedDateInput);
  const now = normalizeDate(nowInput);
  const selectedDayStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (selectedDayStart.getTime() < todayStart.getTime()) {
    return { show: false, prefix: 'STARTS IN', secondsUntilStart: 0 };
  }

  const lessonStarts = lessons.map((lesson) => getDateForTime(selectedDate, lesson.time));
  const nowMs = now.getTime();
  const firstLessonStartMs = lessonStarts[0].getTime();
  const lastLessonStartMs = lessonStarts[lessonStarts.length - 1].getTime();

  if (nowMs < firstLessonStartMs) {
    return {
      show: true,
      prefix: 'STARTS IN',
      secondsUntilStart: Math.floor((firstLessonStartMs - nowMs) / 1000),
    };
  }

  if (nowMs >= lastLessonStartMs) {
    return { show: false, prefix: 'STARTS IN', secondsUntilStart: 0 };
  }

  const nextLessonIndex = lessonStarts.findIndex((start) => start.getTime() > nowMs);
  if (nextLessonIndex < 0) {
    return { show: false, prefix: 'STARTS IN', secondsUntilStart: 0 };
  }

  const secondsUntilStart = Math.floor((lessonStarts[nextLessonIndex].getTime() - nowMs) / 1000);
  const prefix = nextLessonIndex === 0 ? 'STARTS IN' : 'NEXT LESSON IN';

  return { show: true, prefix, secondsUntilStart };
};

const formatCountdownLabel = (prefix: string, secondsUntilStart: number) => {
  const hours = Math.floor(secondsUntilStart / 3600);
  const minutes = Math.floor((secondsUntilStart % 3600) / 60);
  const seconds = secondsUntilStart % 60;
  const paddedSeconds = String(seconds).padStart(2, '0');

  if (hours > 0 && minutes > 0) {
    return `${prefix} ${hours}H ${minutes}M ${paddedSeconds}S`;
  }

  if (hours > 0) {
    return `${prefix} ${hours}H 00M ${paddedSeconds}S`;
  }

  return `${prefix} ${minutes}M ${paddedSeconds}S`;
};

const buildScheduleRows = (lessons: Lesson[]): ScheduleRow[] => {
  const rows: ScheduleRow[] = [];

  if (lessons.length === 0) {
    return rows;
  }

  lessons.forEach((lesson, index) => {
    rows.push({ kind: 'lesson', lesson });

    const nextLesson = lessons[index + 1];
    if (!nextLesson) {
      return;
    }

    const lessonStart = parseTimeToMinutes(lesson.time);
    const lessonEnd = lessonStart + lesson.durationMinutes;
    const nextLessonStart = parseTimeToMinutes(nextLesson.time);
    const gapMinutes = nextLessonStart - lessonEnd;

    if (gapMinutes > 0) {
      rows.push({
        kind: 'gap',
        minutes: gapMinutes,
        key: `${lesson.student}-${nextLesson.student}-${gapMinutes}`,
      });
    }
  });

  const lastLesson = lessons[lessons.length - 1];
  const lastLessonEnd = parseTimeToMinutes(lastLesson.time) + lastLesson.durationMinutes;
  rows.push({
    kind: 'end',
    endTime: formatMinutesToTime(lastLessonEnd),
    key: `${lastLesson.student}-end`,
  });

  return rows;
};

export default function ScheduleScreen() {
  const { palette } = useAppTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const { user } = useLocalSearchParams<{ user?: string }>();
  const role = getRoleFromUser(user);
  const { menu, quick } = getMenusForRole(role);
  const [now, setNow] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date(2026, 1, 11));
  const lessonsForSelectedDate = useMemo(() => getLessonsForDate(selectedDate), [selectedDate]);
  const scheduleRows = useMemo(() => buildScheduleRows(lessonsForSelectedDate), [lessonsForSelectedDate]);
  const nextLessonCountdown = useMemo(
    () => getNextLessonCountdown(lessonsForSelectedDate, selectedDate, now),
    [lessonsForSelectedDate, selectedDate, now]
  );
  const weekDotDates = useMemo(
    () => weekDotOffsets.map((offset) => addDays(selectedDate, offset)),
    [selectedDate]
  );
  const selectedDateLabel = useMemo(() => formatFullDate(selectedDate), [selectedDate]);
  const isSelectedToday = useMemo(() => isSameDay(selectedDate, now), [selectedDate, now]);
  const calendarMonthLabel = useMemo(() => formatMonthLabel(selectedDate), [selectedDate]);
  const monthGrid = useMemo(() => buildMonthGrid(selectedDate), [selectedDate]);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const goToPreviousMonth = () => {
    setSelectedDate((currentDate) => {
      const targetMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      const daysInTargetMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0).getDate();
      const targetDay = Math.min(currentDate.getDate(), daysInTargetMonth);
      return new Date(targetMonth.getFullYear(), targetMonth.getMonth(), targetDay);
    });
  };

  const goToNextMonth = () => {
    setSelectedDate((currentDate) => {
      const targetMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
      const daysInTargetMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0).getDate();
      const targetDay = Math.min(currentDate.getDate(), daysInTargetMonth);
      return new Date(targetMonth.getFullYear(), targetMonth.getMonth(), targetDay);
    });
  };

  return (
    <AppShell
      title="Schedule"
      subtitle="View and manage your lesson calendar."
      menuItems={menu}
      quickActions={quick}
      user={user}>
      <View style={styles.header}>
        <Text style={styles.overline}>TEACHERS</Text>
        <Text style={styles.title}>Schedule</Text>
        <View style={styles.weekDotsRow}>
          {weekDotDates.map((date) => {
            const isSelected = isSameDay(date, selectedDate);
            const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);
            return (
              <Pressable
                key={date.toISOString()}
                onPress={() => setSelectedDate(date)}
                style={[styles.weekDot, isSelected && styles.weekDotActive]}>
                <Text style={[styles.weekDotText, isSelected && styles.weekDotTextActive]}>{dayLabel}</Text>
              </Pressable>
            );
          })}
        </View>
        {!isSelectedToday ? (
          <Pressable onPress={() => setSelectedDate(new Date(now))} style={styles.todayButton}>
            <Text style={styles.todayButtonText}>Return to Today</Text>
          </Pressable>
        ) : null}
        <Text style={styles.subtitle}>{selectedDateLabel}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardOverline}>{isSelectedToday ? 'TODAY' : 'SELECTED DAY'}</Text>
        <Text style={styles.cardTitle}>
          {`${lessonsForSelectedDate.length} ${lessonsForSelectedDate.length === 1 ? 'Lesson' : 'Lessons'}`}
        </Text>
        {nextLessonCountdown.show ? (
          <View style={styles.timerRow}>
            <Text style={styles.timerText}>
              {formatCountdownLabel(nextLessonCountdown.prefix, nextLessonCountdown.secondsUntilStart)}
            </Text>
          </View>
        ) : null}
        {scheduleRows.map((row) => {
          if (row.kind === 'gap') {
            return (
              <View key={row.key} style={styles.gapRow}>
                <Text style={styles.gapText}>{`${row.minutes} MIN GAP`}</Text>
              </View>
            );
          }

          if (row.kind === 'end') {
            return (
              <View key={row.key} style={styles.gapRow}>
                <Text style={styles.gapText}>{`ENDS AT ${row.endTime}`}</Text>
              </View>
            );
          }

          return (
            <View key={`${row.lesson.student}-${row.lesson.time}`} style={styles.row}>
              <View>
                <Text style={styles.student}>{row.lesson.student}</Text>
                <Text style={styles.meta}>{`${row.lesson.type} · ${row.lesson.durationMinutes} min`}</Text>
              </View>
              <Text style={styles.time}>{row.lesson.time}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.calendarCard}>
        <View style={styles.calendarHead}>
          <Pressable onPress={goToPreviousMonth} style={styles.monthNavButton}>
            <Text style={styles.monthNavText}>PREV</Text>
          </Pressable>
          <View style={styles.calendarHeadCenter}>
            <Text style={styles.cardOverline}>MONTH</Text>
            <Text style={styles.calendarMonthLabel}>{calendarMonthLabel}</Text>
          </View>
          <Pressable onPress={goToNextMonth} style={styles.monthNavButton}>
            <Text style={styles.monthNavText}>NEXT</Text>
          </Pressable>
        </View>

        <View style={styles.weekdayRow}>
          {weekdays.map((day) => (
            <Text key={day} style={styles.weekdayText}>
              {day}
            </Text>
          ))}
        </View>

        {monthGrid.map((week, weekIndex) => (
          <View key={`week-${weekIndex}`} style={styles.weekRow}>
            {week.map((dayCell) => {
              const isSelected = isSameDay(dayCell.date, selectedDate);
              const isCurrentMonth = dayCell.inCurrentMonth;
              return (
                <Pressable
                  key={dayCell.date.toISOString()}
                  onPress={() => setSelectedDate(dayCell.date)}
                  style={[
                    styles.dayCell,
                    !isCurrentMonth && styles.dayCellMuted,
                    isSelected && styles.dayCellActive,
                  ]}>
                  <Text
                    style={[
                      styles.dayText,
                      !isCurrentMonth && styles.dayTextMuted,
                      isSelected && styles.dayTextActive,
                    ]}>
                    {dayCell.date.getDate()}
                  </Text>
                </Pressable>
              );
            })}
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
    overline: {
      color: '#c13b3f',
      fontSize: 12,
      letterSpacing: 5.5,
    },
    title: {
      marginTop: 8,
      fontSize: 44,
      color: palette.text,
      fontWeight: '500',
    },
    subtitle: {
      marginTop: 6,
      fontSize: 15,
      color: palette.textMuted,
      textAlign: 'center',
      alignSelf: 'center',
    },
    weekDotsRow: {
      marginTop: 10,
      flexDirection: 'row',
      gap: 8,
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignSelf: 'center',
    },
    todayButton: {
      marginTop: 10,
      alignSelf: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.surface,
    },
    todayButtonText: {
      color: palette.text,
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.6,
    },
    weekDot: {
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    weekDotActive: {
      borderColor: '#c13b3f',
      backgroundColor: '#c13b3f',
    },
    weekDotText: {
      color: palette.textMuted,
      fontSize: 12,
      fontWeight: '600',
      letterSpacing: 0.4,
    },
    weekDotTextActive: {
      color: '#fff',
    },
    card: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.background,
      padding: 16,
      marginBottom: 12,
    },
    cardOverline: {
      color: '#c13b3f',
      fontSize: 11,
      letterSpacing: 4.5,
    },
    cardTitle: {
      marginTop: 8,
      fontSize: 26,
      color: palette.text,
      fontWeight: '600',
      marginBottom: 8,
    },
    row: {
      marginTop: 10,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.surfaceSoft,
      paddingHorizontal: 12,
      paddingVertical: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 8,
    },
    gapRow: {
      marginTop: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderStyle: 'dotted',
      borderColor: palette.border,
      backgroundColor: palette.surface,
      paddingHorizontal: 10,
      paddingVertical: 6,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 32,
    },
    gapText: {
      color: palette.textMuted,
      fontSize: 11,
      fontWeight: '600',
      letterSpacing: 1.4,
    },
    timerRow: {
      marginTop: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderStyle: 'dotted',
      borderColor: '#2f8f48',
      backgroundColor: '#2f8f48',
      paddingHorizontal: 10,
      paddingVertical: 6,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 32,
    },
    timerText: {
      color: '#ffffff',
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 1.4,
    },
    student: {
      color: palette.text,
      fontSize: 17,
      fontWeight: '500',
    },
    meta: {
      marginTop: 4,
      color: palette.textMuted,
      fontSize: 13,
    },
    time: {
      color: palette.text,
      fontSize: 14,
      letterSpacing: 1,
    },
    calendarCard: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.background,
      padding: 16,
      marginBottom: 24,
    },
    calendarHead: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      gap: 8,
    },
    calendarHeadCenter: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
    },
    monthNavButton: {
      minWidth: 58,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.surface,
      paddingHorizontal: 10,
      paddingVertical: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    monthNavText: {
      color: palette.text,
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.8,
    },
    calendarMonthLabel: {
      color: palette.textMuted,
      fontSize: 12,
      letterSpacing: 2.2,
    },
    weekdayRow: {
      flexDirection: 'row',
      marginBottom: 8,
    },
    weekdayText: {
      flex: 1,
      color: palette.textMuted,
      textAlign: 'center',
      fontSize: 11,
      letterSpacing: 1.6,
    },
    weekRow: {
      flexDirection: 'row',
      marginTop: 8,
      gap: 8,
    },
    dayCell: {
      flex: 1,
      minHeight: 44,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: palette.border,
      backgroundColor: palette.surfaceSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dayCellMuted: {
      backgroundColor: palette.surface,
    },
    dayCellActive: {
      borderColor: palette.primary,
      backgroundColor: palette.primary,
    },
    dayText: {
      color: palette.text,
      fontSize: 14,
      fontWeight: '600',
    },
    dayTextMuted: {
      color: palette.textMuted,
    },
    dayTextActive: {
      color: '#fff',
    },
  });
