import { useFocusEffect } from '@react-navigation/native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useCallback, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SegmentedButtons } from 'react-native-paper';
import { ErrorState } from '@/components/ErrorState';
import { LoadingState } from '@/components/LoadingState';
import { TruckCompletedBarChart } from '@/components/TruckCompletedBarChart';
import { palette, radius, spacing } from '@/constants/theme';
import { useCompletedByVehicle } from '@/hooks/use-logistics';
import {
  formatMonthYear,
  formatWeekRange,
  monthRangeContaining,
  shiftPeriod,
  todayBusinessDate,
  weekRangeContaining,
} from '@/utils/dates';
import { getErrorMessage } from '@/utils/errors';

export default function AnalyticsScreen() {
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const [date, setDate] = useState(todayBusinessDate());
  const { data, isLoading, isError, error, refetch } = useCompletedByVehicle(period, date);

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'web') {
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      }
      return () => {
        if (Platform.OS !== 'web') {
          ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        }
      };
    }, []),
  );

  const range =
    period === 'week' ? weekRangeContaining(date) : monthRangeContaining(date);
  const periodLabel =
    period === 'week' ? formatWeekRange(range.from, range.to) : formatMonthYear(range.from);

  return (
    <View style={styles.screen}>
      <View style={styles.toolbar}>
        <SegmentedButtons
          value={period}
          onValueChange={(value) => setPeriod(value as 'week' | 'month')}
          density="small"
          buttons={[
            { value: 'week', label: 'Week' },
            { value: 'month', label: 'Month' },
          ]}
          style={styles.segment}
        />
        <View style={styles.hiresCard}>
          <Text style={styles.hiresLabel}>No. of hires</Text>
          <Text style={styles.hiresValue}>{data?.hires ?? '—'}</Text>
        </View>
      </View>

      <View style={styles.periodNav}>
        <Pressable style={styles.arrow} onPress={() => setDate(shiftPeriod(date, period, -1))}>
          <Text style={styles.arrowText}>‹</Text>
        </Pressable>
        <View style={styles.periodLabelWrap}>
          <Text style={styles.periodKind}>{period === 'week' ? 'Monday to Sunday' : 'Month'}</Text>
          <Text style={styles.periodLabel}>{periodLabel}</Text>
        </View>
        <Pressable style={styles.arrow} onPress={() => setDate(shiftPeriod(date, period, 1))}>
          <Text style={styles.arrowText}>›</Text>
        </Pressable>
      </View>

      {isLoading ? <LoadingState label="Loading analytics…" /> : null}
      {isError ? (
        <ErrorState
          title="Unable to load analytics."
          message={getErrorMessage(error, 'Please check your connection.')}
          onRetry={() => refetch()}
        />
      ) : null}
      {data ? (
        <View style={styles.chart}>
          <TruckCompletedBarChart trucks={data.trucks} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.surface, paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  segment: { flex: 1, maxWidth: 280 },
  hiresCard: {
    backgroundColor: palette.navy,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minWidth: 120,
    alignItems: 'center',
  },
  hiresLabel: { color: '#fff', fontSize: 11, fontWeight: '600', opacity: 0.85 },
  hiresValue: { color: '#fff', fontSize: 22, fontWeight: '800' },
  periodNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  arrow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: { color: '#fff', fontSize: 28, lineHeight: 30, fontWeight: '700' },
  periodLabelWrap: {
    flex: 1,
    backgroundColor: palette.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 48,
    justifyContent: 'center',
  },
  periodKind: { color: palette.muted, fontSize: 11, fontWeight: '700' },
  periodLabel: { color: palette.navy, fontSize: 16, fontWeight: '800' },
  chart: { flex: 1, backgroundColor: palette.card, borderRadius: 12, borderWidth: 1, borderColor: palette.border },
});
