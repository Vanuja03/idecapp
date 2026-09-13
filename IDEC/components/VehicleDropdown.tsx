import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Modal, Portal } from 'react-native-paper';
import { Vehicle } from '@/types';
import { palette, radius, spacing } from '@/constants/theme';

type Props = {
  vehicles: Vehicle[];
  value?: string;
  onChange: (vehicleId: string) => void;
  error?: string;
  disabled?: boolean;
};

export function VehicleDropdown({ vehicles, value, onChange, error, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const selected = vehicles.find((vehicle) => vehicle._id === value);

  return (
    <View>
      <Pressable
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={[styles.field, error ? styles.invalid : null, disabled && styles.disabled]}
      >
        <Text style={styles.label}>Vehicle</Text>
        <Text style={selected ? styles.value : styles.placeholder}>
          {selected ? selected.vehicleNumber : 'Select a truck'}
        </Text>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Portal>
        <Modal visible={open} onDismiss={() => setOpen(false)} contentContainerStyle={styles.modal}>
          <Text style={styles.modalTitle}>Select vehicle</Text>
          <FlatList
            data={vehicles}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <Pressable
                style={styles.option}
                onPress={() => {
                  onChange(item._id);
                  setOpen(false);
                }}
              >
                <Text style={styles.optionNumber}>{item.vehicleNumber}</Text>
                <Text style={styles.optionDesc}>{item.description}</Text>
              </Pressable>
            )}
            ListEmptyComponent={<Text style={styles.placeholder}>No active vehicles</Text>}
          />
          <Button onPress={() => setOpen(false)}>Close</Button>
        </Modal>
      </Portal>
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
  },
  invalid: { borderColor: palette.error },
  disabled: { opacity: 0.6 },
  label: { color: palette.muted, fontSize: 12, marginBottom: 4 },
  value: { color: palette.text, fontWeight: '700', fontSize: 16 },
  placeholder: { color: palette.muted },
  error: { color: palette.error, marginTop: 4 },
  modal: {
    backgroundColor: palette.card,
    margin: 20,
    borderRadius: radius.lg,
    padding: spacing.lg,
    maxHeight: '70%',
  },
  modalTitle: { fontWeight: '700', fontSize: 18, marginBottom: spacing.md, color: palette.text },
  option: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  optionNumber: { fontWeight: '700', color: palette.text, fontSize: 16 },
  optionDesc: { color: palette.muted },
});
