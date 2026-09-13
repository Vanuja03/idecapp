import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { palette, radius, spacing } from '@/constants/theme';
import { addDays, formatDisplayDate, parseBusinessDate, toBusinessDate } from '@/utils/dates';

type Props = {
  value: string;
  onChange: (date: string) => void;
};

export function DateSelector({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);

  const onPick = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS !== 'ios') setOpen(false);
    if (event.type === 'dismissed') return;
    if (selected) onChange(toBusinessDate(selected));
  };

  return (
    <View style={styles.wrap}>
      <Pressable style={styles.arrow} onPress={() => onChange(addDays(value, -1))}>
        <Text style={styles.arrowText}>‹</Text>
      </Pressable>
      <Pressable style={styles.date} onPress={() => setOpen(true)}>
        <Text style={styles.dateText}>{formatDisplayDate(value)}</Text>
        <Text style={styles.hint}>Tap to open calendar</Text>
      </Pressable>
      <Pressable style={styles.arrow} onPress={() => onChange(addDays(value, 1))}>
        <Text style={styles.arrowText}>›</Text>
      </Pressable>
      {open ? (
        <DateTimePicker
          value={parseBusinessDate(value)}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={onPick}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  arrow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: palette.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: { color: '#fff', fontSize: 28, lineHeight: 30, fontWeight: '700' },
  date: {
    flex: 1,
    backgroundColor: palette.card,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: palette.border,
    minHeight: 48,
    justifyContent: 'center',
  },
  dateText: { fontWeight: '700', color: palette.text, fontSize: 16 },
  hint: { color: palette.muted, fontSize: 12, marginTop: 2 },
});
