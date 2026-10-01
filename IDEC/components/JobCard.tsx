import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Job, VehicleSource } from '@/types';
import { formatDateTime, userName } from '@/utils/dates';
import { StatusBadge } from '@/components/StatusBadge';
import { palette, radius, spacing } from '@/constants/theme';

type Props = {
  job: Job;
  onPress?: () => void;
};

export function JobCard({ job, onPress }: Props) {
  const isOther = job.vehicleSource === VehicleSource.OTHER;
  const vendor = isOther ? job.notes?.trim() : '';

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.row}>
        <View style={styles.vehicleRow}>
          <Text style={styles.vehicle}>{job.vehicleNumberSnapshot}</Text>
          {isOther ? (
            <View style={styles.otherTag}>
              <Text style={styles.otherTagText}>Other lorry</Text>
            </View>
          ) : null}
        </View>
        <StatusBadge status={job.status} />
      </View>
      <Text style={styles.destination}>{job.destination}</Text>
      {vendor ? <Text style={styles.vendor}>Vendor: {vendor}</Text> : null}
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
  vehicleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexShrink: 1 },
  vehicle: { fontSize: 18, fontWeight: '700', color: palette.text },
  otherTag: {
    backgroundColor: '#FFF1E6',
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  otherTagText: { color: palette.accent, fontSize: 11, fontWeight: '800' },
  destination: { fontSize: 15, color: palette.steel, fontWeight: '600' },
  vendor: { fontSize: 13, color: palette.text },
  meta: { fontSize: 12, color: palette.muted },
});
