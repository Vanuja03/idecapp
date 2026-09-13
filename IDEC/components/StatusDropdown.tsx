import { Pressable, StyleSheet, Text, View } from 'react-native';
import { JobStatus } from '@/types';
import { palette, radius, spacing, statusTokens } from '@/constants/theme';

const options: JobStatus[] = ['PENDING', 'COMPLETED', 'CANCELED'];

type Props = {
  value: JobStatus;
  onChange: (status: JobStatus) => void;
  disabled?: boolean;
};

export function StatusDropdown({ value, onChange, disabled }: Props) {
  return (
    <View>
      <Text style={styles.label}>Status</Text>
      <View style={styles.row}>
        {options.map((status) => {
          const token = statusTokens[status];
          const selected = value === status;
          return (
            <Pressable
              key={status}
              disabled={disabled}
              onPress={() => onChange(status)}
              style={[
                styles.chip,
                { borderColor: token.color },
                selected && { backgroundColor: token.background },
                disabled && styles.disabled,
              ]}
            >
              <Text style={[styles.chipText, { color: token.color }]}>{token.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { color: palette.muted, marginBottom: spacing.sm, fontWeight: '600' },
  row: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  chip: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
    minHeight: 44,
    justifyContent: 'center',
  },
  chipText: { fontWeight: '700' },
  disabled: { opacity: 0.5 },
});
