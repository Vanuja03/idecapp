import { useState } from 'react';
import { LayoutChangeEvent, ScrollView, StyleSheet, Text, View } from 'react-native';
import { TruckCompletedCount } from '@/types';
import { palette, radius, spacing } from '@/constants/theme';

type Props = {
  trucks: TruckCompletedCount[];
};

// Space taken by the value text above and the vehicle label below each bar
const LABEL_SPACE = 52;
const MIN_PLOT_HEIGHT = 60;
const MAX_PLOT_HEIGHT = 190;
const MIN_SLOT_WIDTH = 44;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function TruckCompletedBarChart({ trucks }: Props) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== size.width || height !== size.height) setSize({ width, height });
  };

  if (trucks.length === 0) {
    return <Text style={styles.empty}>No trucks to display.</Text>;
  }

  const max = Math.max(1, ...trucks.map((truck) => truck.completed));
  const plotHeight = clamp((size.height - LABEL_SPACE) * 0.75, MIN_PLOT_HEIGHT, MAX_PLOT_HEIGHT);
  const innerWidth = Math.max(0, size.width - spacing.md * 2);
  const slotWidth = Math.max(MIN_SLOT_WIDTH, innerWidth / trucks.length);
  const barThickness = clamp(slotWidth * 0.45, 14, 26);

  return (
    <View style={styles.fill} onLayout={onLayout}>
      {size.height > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {trucks.map((truck) => {
            const barH =
              truck.completed === 0 ? 4 : Math.max((truck.completed / max) * plotHeight, 6);
            return (
              <View key={truck.vehicleNumber} style={[styles.item, { width: slotWidth }]}>
                <Text style={styles.value}>{truck.completed}</Text>
                <View style={[styles.track, { height: plotHeight, width: barThickness }]}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barH,
                        width: barThickness,
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
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, justifyContent: 'center' },
  row: {
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  item: { alignItems: 'center' },
  value: { fontSize: 12, fontWeight: '800', color: palette.navy, marginBottom: 4 },
  track: {
    justifyContent: 'flex-end',
    backgroundColor: palette.surface,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  bar: {
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
