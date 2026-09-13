import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { TruckCompletedCount } from '@/types';
import { palette, radius, spacing } from '@/constants/theme';

type Props = {
  trucks: TruckCompletedCount[];
};

export function TruckCompletedBarChart({ trucks }: Props) {
  const { height, width } = useWindowDimensions();
  const chartHeight = Math.max(160, Math.min(height - 170, 280));
  const max = Math.max(1, ...trucks.map((truck) => truck.completed));
  const barWidth = trucks.length > 10 ? 48 : 56;

  if (trucks.length === 0) {
    return <Text style={styles.empty}>No trucks to display.</Text>;
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={styles.row}>
      {trucks.map((truck) => {
        const barH = Math.max(truck.completed === 0 ? 4 : (truck.completed / max) * (chartHeight - 36), 4);
        return (
          <View key={truck.vehicleNumber} style={[styles.item, { width: barWidth }]}>
            <Text style={styles.value}>{truck.completed}</Text>
            <View style={[styles.track, { height: chartHeight - 36 }]}>
              <View
                style={[
                  styles.bar,
                  {
                    height: barH,
                    backgroundColor: truck.completed === 0 ? palette.border : palette.navy,
                  },
                ]}
              />
            </View>
            <Text style={styles.label} numberOfLines={1}>
              {truck.vehicleNumber}
            </Text>
          </View>
        );
      })}
      {width < 400 ? <View style={{ width: spacing.md }} /> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: 8,
  },
  item: { alignItems: 'center' },
  value: { fontSize: 12, fontWeight: '800', color: palette.navy, marginBottom: 4 },
  track: {
    width: 28,
    justifyContent: 'flex-end',
    backgroundColor: palette.surface,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  bar: {
    width: 28,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  label: {
    marginTop: 6,
    fontSize: 10,
    fontWeight: '700',
    color: palette.muted,
    width: '100%',
    textAlign: 'center',
  },
  empty: { color: palette.muted, textAlign: 'center', padding: spacing.lg },
});
