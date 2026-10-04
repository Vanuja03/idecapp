import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Control, Controller, FieldErrors, useWatch } from 'react-hook-form';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import { VehicleDropdown } from '@/components/VehicleDropdown';
import { palette, radius } from '@/constants/theme';
import { JobForm } from '@/schemas/forms';
import { Vehicle, VehicleSource } from '@/types';

const SOURCE_OPTIONS = [
  { value: VehicleSource.OWN, label: 'IDEC Lorry', icon: 'truck' },
  { value: VehicleSource.OTHER, label: 'Other Lorry', icon: 'truck-outline' },
] as const;

type Props = {
  control: Control<JobForm>;
  errors: FieldErrors<JobForm>;
  vehicles: Vehicle[];
  disabled?: boolean;
  sourceLocked?: boolean;
  inJobVehicleIds?: string[];
};

export function JobVehicleFields({
  control,
  errors,
  vehicles,
  disabled,
  sourceLocked,
  inJobVehicleIds,
}: Props) {
  const source = useWatch({ control, name: 'vehicleSource' });

  return (
    <View style={styles.wrap}>
      {sourceLocked ? (
        <View style={styles.lockedRow}>
          <Text style={styles.lockedLabel}>Lorry type</Text>
          <View style={[styles.lockedTag, source === VehicleSource.OTHER && styles.lockedTagOther]}>
            <Text style={[styles.lockedTagText, source === VehicleSource.OTHER && styles.lockedTagTextOther]}>
              {source === VehicleSource.OTHER ? 'Other lorry' : 'Our lorry'}
            </Text>
          </View>
        </View>
      ) : (
        <Controller
          control={control}
          name="vehicleSource"
          render={({ field: { value, onChange } }) => (
            <View style={[styles.segment, disabled && styles.segmentDisabled]}>
              {SOURCE_OPTIONS.map((option, index) => {
                const selected = value === option.value;
                const color = selected ? '#FFFFFF' : palette.navy;
                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole="button"
                    accessibilityState={{ selected, disabled }}
                    disabled={disabled}
                    onPress={() => onChange(option.value)}
                    style={({ pressed }) => [
                      styles.segmentButton,
                      index > 0 && styles.segmentDivider,
                      selected && styles.segmentButtonSelected,
                      pressed && !selected && styles.segmentButtonPressed,
                    ]}
                  >
                    <MaterialCommunityIcons name={option.icon} size={16} color={color} />
                    <Text style={[styles.segmentLabel, { color }]}>{option.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        />
      )}

      {source === VehicleSource.OTHER ? (
        <View>
          <Controller
            control={control}
            name="otherVehicleNumber"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                label="Lorry number"
                placeholder="e.g. LB-4521"
                mode="outlined"
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={32}
                value={value ?? ''}
                onBlur={onBlur}
                onChangeText={onChange}
                error={Boolean(errors.otherVehicleNumber)}
                disabled={disabled}
              />
            )}
          />
          {errors.otherVehicleNumber ? (
            <Text style={styles.error}>{errors.otherVehicleNumber.message}</Text>
          ) : (
            <Text style={styles.hint}>Temporary lorries are not counted in Analytics.</Text>
          )}
        </View>
      ) : (
        <Controller
          control={control}
          name="vehicleId"
          render={({ field: { value, onChange } }) => (
            <VehicleDropdown
              vehicles={vehicles}
              value={value}
              onChange={onChange}
              error={errors.vehicleId?.message}
              disabled={disabled}
              inJobVehicleIds={inJobVehicleIds}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  segment: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: palette.navy,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: palette.card,
  },
  segmentDisabled: { opacity: 0.6 },
  segmentButton: {
    flex: 1,
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  segmentDivider: { borderLeftWidth: 1.5, borderLeftColor: palette.navy },
  segmentButtonSelected: { backgroundColor: palette.navy },
  segmentButtonPressed: { backgroundColor: palette.infoBg },
  segmentLabel: { fontSize: 14, fontWeight: '600' },
  lockedRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  lockedLabel: { color: palette.muted, fontSize: 13, fontWeight: '600' },
  lockedTag: {
    backgroundColor: palette.infoBg,
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  lockedTagOther: { backgroundColor: '#FFF1E6' },
  lockedTagText: { color: palette.navy, fontSize: 12, fontWeight: '800' },
  lockedTagTextOther: { color: palette.accent },
  error: { color: palette.error, marginTop: 4 },
  hint: { color: palette.muted, fontSize: 12, marginTop: 4 },
});
