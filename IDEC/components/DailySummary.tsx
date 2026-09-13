import { StyleSheet, Text, View } from 'react-native';
import { DailyView } from '@/types';
import { dayStatusTokens, palette, radius, spacing } from '@/constants/theme';
import { formatDateTime } from '@/utils/dates';

export function DailySummary({ day }: { day: DailyView }) {
  const token = dayStatusTokens[day.status];
  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <Text style={styles.total}>Total Jobs: {day.counts.total}</Text>
        <View style={[styles.badge, { backgroundColor: token.background }]}>
          <Text style={[styles.badgeText, { color: token.color }]}>{token.label}</Text>
        </View>
      </View>
      <View style={styles.counts}>
        <Text style={styles.count}>Pending: {day.counts.pending}</Text>
        <Text style={styles.count}>Completed: {day.counts.completed}</Text>
        <Text style={styles.count}>Canceled: {day.counts.canceled}</Text>
      </View>
      {day.status === 'FINALIZED' ? (
        <Text style={styles.meta}>
          Finalized by: {day.finalizedByName ?? 'Unknown'}
          {'\n'}
          Finalized at: {formatDateTime(day.finalizedAt)}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.card,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: palette.border,
    gap: spacing.sm,
  },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  total: { fontSize: 16, fontWeight: '700', color: palette.text },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontWeight: '800', fontSize: 12 },
  counts: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  count: { color: palette.muted, fontWeight: '600' },
  meta: { color: palette.muted, lineHeight: 20 },
});
