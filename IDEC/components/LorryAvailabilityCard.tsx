import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { palette, radius, spacing } from '@/constants/theme';

type Props = {
  total: number;
  inJob: number;
  loading?: boolean;
};

export function LorryAvailabilityCard({ total, inJob, loading }: Props) {
  const available = Math.max(0, total - inJob);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="truck" size={18} color={palette.navy} />
        <Text style={styles.title}>Lorries today</Text>
        {loading ? <ActivityIndicator size="small" color={palette.navy} style={styles.spinner} /> : null}
      </View>
      <View style={styles.stats}>
        <View style={[styles.stat, styles.availableStat]}>
          <Text style={[styles.value, styles.availableText]}>{available}</Text>
          <Text style={[styles.label, styles.availableText]}>Available</Text>
        </View>
        <View style={[styles.stat, styles.inJobStat]}>
          <Text style={[styles.value, styles.inJobText]}>{inJob}</Text>
          <Text style={[styles.label, styles.inJobText]}>In Job</Text>
        </View>
        <View style={[styles.stat, styles.totalStat]}>
          <Text style={[styles.value, styles.totalText]}>{total}</Text>
          <Text style={[styles.label, styles.totalText]}>Total</Text>
        </View>
      </View>
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
    gap: spacing.md,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { fontSize: 16, fontWeight: '700', color: palette.text },
  spinner: { marginLeft: 'auto' },
  stats: { flexDirection: 'row', gap: spacing.sm },
  stat: { flex: 1, borderRadius: radius.md, paddingVertical: spacing.md, alignItems: 'center' },
  availableStat: { backgroundColor: palette.successBg },
  inJobStat: { backgroundColor: palette.warningBg },
  totalStat: { backgroundColor: palette.infoBg },
  value: { fontSize: 24, fontWeight: '800' },
  label: { fontSize: 12, fontWeight: '700', marginTop: 2 },
  availableText: { color: palette.success },
  inJobText: { color: palette.warning },
  totalText: { color: palette.navy },
});
