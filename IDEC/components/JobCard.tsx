import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Job } from '@/types';
import { formatDateTime, userName } from '@/utils/dates';
import { StatusBadge } from '@/components/StatusBadge';
import { palette, radius, spacing } from '@/constants/theme';

type Props = {
  job: Job;
  onPress?: () => void;
};

export function JobCard({ job, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.row}>
        <Text style={styles.vehicle}>{job.vehicleNumberSnapshot}</Text>
        <StatusBadge status={job.status} />
      </View>
      <Text style={styles.destination}>{job.destination}</Text>
      <Text style={styles.meta}>Created by {userName(job.createdBy)}</Text>
      <Text style={styles.meta}>Last updated {formatDateTime(job.updatedAt)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.card,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: palette.border,
    gap: 6,
  },
  pressed: { opacity: 0.85 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  vehicle: { fontSize: 18, fontWeight: '700', color: palette.text },
  destination: { fontSize: 15, color: palette.steel, fontWeight: '600' },
  meta: { fontSize: 12, color: palette.muted },
});
