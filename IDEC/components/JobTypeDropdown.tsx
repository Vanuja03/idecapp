import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View, type LayoutRectangle } from 'react-native';
import { palette, radius, spacing } from '@/constants/theme';
import { JobType } from '@/types';

const OPTIONS: JobType[] = [JobType.IM, JobType.EX];

type Props = {
  value: JobType;
  onChange: (value: JobType) => void;
  error?: string;
  disabled?: boolean;
};

export function JobTypeDropdown({ value, onChange, error, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<LayoutRectangle | null>(null);
  const fieldRef = useRef<View>(null);

  const openDropdown = () => {
    if (disabled) return;
    fieldRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
      setOpen(true);
    });
  };

  const close = () => setOpen(false);

  return (
    <View>
      <View ref={fieldRef} collapsable={false}>
        <Pressable
          disabled={disabled}
          onPress={openDropdown}
          style={[styles.field, error ? styles.invalid : null, disabled && styles.disabled]}
          accessibilityRole="button"
          accessibilityLabel={`Type ${value}`}
        >
          <View style={styles.fieldText}>
            <Text style={styles.label}>Type</Text>
            <Text style={styles.value}>{value}</Text>
          </View>
          <MaterialCommunityIcons name={open ? 'chevron-up' : 'chevron-down'} size={22} color={palette.muted} />
        </Pressable>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={close} />
          {anchor ? (
            <View style={[styles.dropdown, { top: anchor.y + anchor.height + 4, left: anchor.x, width: anchor.width }]}>
              {OPTIONS.map((option, index) => {
                const isSelected = option === value;
                return (
                  <Pressable
                    key={option}
                    style={[
                      styles.option,
                      index < OPTIONS.length - 1 && styles.optionDivider,
                      isSelected && styles.optionSelected,
                    ]}
                    onPress={() => {
                      onChange(option);
                      close();
                    }}
                  >
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{option}</Text>
                    {isSelected ? <MaterialCommunityIcons name="check" size={18} color={palette.navy} /> : null}
                  </Pressable>
                );
              })}
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldText: { flex: 1 },
  invalid: { borderColor: palette.error },
  disabled: { opacity: 0.6 },
  label: { color: palette.muted, fontSize: 12, marginBottom: 4 },
  value: { color: palette.text, fontWeight: '700', fontSize: 16 },
  error: { color: palette.error, marginTop: 4 },
  overlay: { flex: 1, backgroundColor: 'rgba(18, 38, 58, 0.25)' },
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  optionDivider: { borderBottomWidth: 1, borderBottomColor: palette.border },
  optionSelected: { backgroundColor: palette.infoBg },
  optionText: { fontWeight: '700', color: palette.text, fontSize: 16 },
  optionTextSelected: { color: palette.navy },
});
