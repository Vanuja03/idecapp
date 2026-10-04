import { useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type LayoutRectangle,
} from 'react-native';
import { Vehicle } from '@/types';
import { palette, radius, spacing } from '@/constants/theme';

type Props = {
  vehicles: Vehicle[];
  value?: string;
  onChange: (vehicleId: string) => void;
  error?: string;
  disabled?: boolean;
  /** When provided, lorries are tagged and available ones are listed first */
  inJobVehicleIds?: string[];
};

function AvailabilityTag({ inJob }: { inJob: boolean }) {
  return (
    <View style={[styles.tag, inJob ? styles.tagInJob : styles.tagAvailable]}>
      <Text style={[styles.tagText, inJob ? styles.tagTextInJob : styles.tagTextAvailable]}>
        {inJob ? 'In Job' : 'Available'}
      </Text>
    </View>
  );
}

export function VehicleDropdown({ vehicles, value, onChange, error, disabled, inJobVehicleIds }: Props) {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<LayoutRectangle | null>(null);
  const fieldRef = useRef<View>(null);
  const { height: windowHeight } = useWindowDimensions();
  const selected = vehicles.find((vehicle) => vehicle._id === value);
  const showAvailability = inJobVehicleIds !== undefined;
  const inJobSet = useMemo(() => new Set(inJobVehicleIds ?? []), [inJobVehicleIds]);
  const orderedVehicles = useMemo(
    () =>
      showAvailability
        ? [
            ...vehicles.filter((vehicle) => !inJobSet.has(vehicle._id)),
            ...vehicles.filter((vehicle) => inJobSet.has(vehicle._id)),
          ]
        : vehicles,
    [vehicles, inJobSet, showAvailability],
  );

  const openDropdown = () => {
    if (disabled) return;
    fieldRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
      setOpen(true);
    });
  };

  const close = () => setOpen(false);

  const listMaxHeight = (() => {
    if (!anchor) return 280;
    const spaceBelow = windowHeight - (anchor.y + anchor.height) - 16;
    const spaceAbove = anchor.y - 16;
    const preferBelow = spaceBelow >= 160 || spaceBelow >= spaceAbove;
    return Math.max(140, Math.min(280, preferBelow ? spaceBelow : spaceAbove));
  })();

  const dropdownStyle = (() => {
    if (!anchor) return null;
    const spaceBelow = windowHeight - (anchor.y + anchor.height) - 16;
    const spaceAbove = anchor.y - 16;
    const showBelow = spaceBelow >= 160 || spaceBelow >= spaceAbove;

    if (showBelow) {
      return {
        top: anchor.y + anchor.height + 4,
        left: anchor.x,
        width: anchor.width,
        maxHeight: listMaxHeight,
      };
    }

    return {
      top: Math.max(16, anchor.y - listMaxHeight - 4),
      left: anchor.x,
      width: anchor.width,
      maxHeight: listMaxHeight,
    };
  })();

  return (
    <View>
      <View ref={fieldRef} collapsable={false}>
        <Pressable
          disabled={disabled}
          onPress={openDropdown}
          style={[styles.field, error ? styles.invalid : null, disabled && styles.disabled]}
        >
          <Text style={styles.label}>Vehicle</Text>
          <View style={styles.valueRow}>
            <Text style={selected ? styles.value : styles.placeholder}>
              {selected ? selected.vehicleNumber : 'Select a truck'}
            </Text>
            {selected && showAvailability ? <AvailabilityTag inJob={inJobSet.has(selected._id)} /> : null}
          </View>
        </Pressable>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={close} />
          {dropdownStyle ? (
            <View style={[styles.dropdown, dropdownStyle]}>
              <FlatList
                data={orderedVehicles}
                keyExtractor={(item) => item._id}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => {
                  const isSelected = item._id === value;
                  return (
                    <Pressable
                      style={[styles.option, styles.optionRow, isSelected && styles.optionSelected]}
                      onPress={() => {
                        onChange(item._id);
                        close();
                      }}
                    >
                      <View style={styles.optionText}>
                        <Text style={styles.optionNumber}>{item.vehicleNumber}</Text>
                        <Text style={styles.optionDesc}>{item.description}</Text>
                      </View>
                      {showAvailability ? <AvailabilityTag inJob={inJobSet.has(item._id)} /> : null}
                    </Pressable>
                  );
                }}
                ListEmptyComponent={<Text style={styles.empty}>No active vehicles</Text>}
              />
            </View>
          ) : null}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 56,
    justifyContent: 'center',
  },
  invalid: { borderColor: palette.error },
  disabled: { opacity: 0.6 },
  label: { color: palette.muted, fontSize: 12, marginBottom: 4 },
  value: { color: palette.text, fontWeight: '700', fontSize: 16 },
  placeholder: { color: palette.muted },
  error: { color: palette.error, marginTop: 4 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(18, 38, 58, 0.25)',
  },
  dropdown: {
    position: 'absolute',
    backgroundColor: palette.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  option: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  optionSelected: {
    backgroundColor: palette.infoBg,
  },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  optionText: { flex: 1 },
  valueRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  tag: { borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 2 },
  tagAvailable: { backgroundColor: palette.successBg },
  tagInJob: { backgroundColor: palette.warningBg },
  tagText: { fontSize: 11, fontWeight: '800' },
  tagTextAvailable: { color: palette.success },
  tagTextInJob: { color: palette.warning },
  optionNumber: { fontWeight: '700', color: palette.text, fontSize: 16 },
  optionDesc: { color: palette.muted, marginTop: 2 },
  empty: { color: palette.muted, padding: spacing.lg, textAlign: 'center' },
});
