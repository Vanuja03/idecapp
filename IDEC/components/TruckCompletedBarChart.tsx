import { useState } from 'react';
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { TruckCompletedCount } from '@/types';
import { palette, radius, spacing } from '@/constants/theme';

type Props = {
  trucks: TruckCompletedCount[];
  periodLabel?: string;
};

// Space taken by the value text above and the vehicle label below each bar
const LABEL_SPACE = 52;
const MIN_PLOT_HEIGHT = 60;
const MAX_PLOT_HEIGHT = 190;
const MIN_SLOT_WIDTH = 44;
const POPUP_WIDTH = 170;
const POPUP_GAP = 8;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function TruckCompletedBarChart({ trucks, periodLabel }: Props) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [scrollX, setScrollX] = useState(0);
  const [selectedNumber, setSelectedNumber] = useState<string | null>(null);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== size.width || height !== size.height) setSize({ width, height });
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrollX(e.nativeEvent.contentOffset.x);
  };

  if (trucks.length === 0) {
    return <Text style={styles.empty}>No trucks to display.</Text>;
  }

  const max = Math.max(1, ...trucks.map((truck) => truck.completed));
  const totalCompleted = trucks.reduce((sum, truck) => sum + truck.completed, 0);
  const plotHeight = clamp((size.height - LABEL_SPACE) * 0.75, MIN_PLOT_HEIGHT, MAX_PLOT_HEIGHT);
  const innerWidth = Math.max(0, size.width - spacing.md * 2);
  const slotWidth = Math.max(MIN_SLOT_WIDTH, innerWidth / trucks.length);
  const barThickness = clamp(slotWidth * 0.45, 14, 26);

  const selectedIndex = trucks.findIndex((truck) => truck.vehicleNumber === selectedNumber);
  const selected = selectedIndex >= 0 ? trucks[selectedIndex] : null;

  const popupLeft = (() => {
    if (selectedIndex < 0) return 0;
    const barCenter = spacing.md + selectedIndex * slotWidth + slotWidth / 2 - scrollX;
    const rightSide = barCenter + barThickness / 2 + POPUP_GAP;
    const leftSide = barCenter - barThickness / 2 - POPUP_GAP - POPUP_WIDTH;
    const preferred = rightSide + POPUP_WIDTH <= size.width - 4 ? rightSide : leftSide;
    return clamp(preferred, 4, Math.max(4, size.width - POPUP_WIDTH - 4));
  })();

  const share = selected && totalCompleted > 0 ? Math.round((selected.completed / totalCompleted) * 100) : 0;

  return (
    <Pressable style={styles.fill} onLayout={onLayout} onPress={() => setSelectedNumber(null)}>
      {size.height > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
          onScroll={onScroll}
          scrollEventThrottle={16}
        >
          {trucks.map((truck) => {
            const isSelected = truck.vehicleNumber === selectedNumber;
            const barH =
              truck.completed === 0 ? 4 : Math.max((truck.completed / max) * plotHeight, 6);
            const barColor = isSelected
              ? palette.accent
              : truck.completed === 0
                ? palette.border
                : palette.navy;
            return (
              <Pressable
                key={truck.vehicleNumber}
                style={[styles.item, { width: slotWidth }]}
                onPress={() => setSelectedNumber(isSelected ? null : truck.vehicleNumber)}
                accessibilityRole="button"
                accessibilityLabel={`${truck.vehicleNumber}, ${truck.completed} completed jobs`}
              >
                <Text style={[styles.value, isSelected && styles.valueSelected]}>{truck.completed}</Text>
                <View style={[styles.track, { height: plotHeight, width: barThickness }]}>
                  <View style={[styles.bar, { height: barH, width: barThickness, backgroundColor: barColor }]} />
                </View>
                <Text style={[styles.label, isSelected && styles.labelSelected]} numberOfLines={1}>
                  {truck.vehicleNumber}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}

      {selected ? (
        <Pressable style={[styles.popup, { left: popupLeft }]} onPress={() => setSelectedNumber(null)}>
          <Text style={styles.popupTitle} numberOfLines={1}>
            {selected.vehicleNumber}
          </Text>
          <View style={styles.popupRow}>
            <Text style={styles.popupLabel}>Completed jobs</Text>
            <Text style={styles.popupValue}>{selected.completed}</Text>
          </View>
          <View style={styles.popupRow}>
            <Text style={styles.popupLabel}>Share</Text>
            <Text style={styles.popupValue}>{share}%</Text>
          </View>
          {periodLabel ? (
            <Text style={styles.popupPeriod} numberOfLines={1}>
              {periodLabel}
            </Text>
          ) : null}
        </Pressable>
      ) : (
        <Text style={styles.hint}>Tap a bar to see details</Text>
      )}
    </Pressable>
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
  valueSelected: { color: palette.accent },
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
  labelSelected: { color: palette.accent },
  popup: {
    position: 'absolute',
    top: spacing.sm,
    width: POPUP_WIDTH,
    backgroundColor: palette.navy,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: 4,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  popupTitle: { color: '#fff', fontSize: 15, fontWeight: '800', marginBottom: 2 },
  popupRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  popupLabel: { color: '#fff', opacity: 0.8, fontSize: 12, fontWeight: '600' },
  popupValue: { color: '#fff', fontSize: 14, fontWeight: '800' },
  popupPeriod: { color: '#fff', opacity: 0.7, fontSize: 11, marginTop: 2 },
  hint: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.md,
    color: palette.muted,
    fontSize: 11,
    fontWeight: '600',
  },
  empty: { color: palette.muted, textAlign: 'center', padding: spacing.lg },
});
