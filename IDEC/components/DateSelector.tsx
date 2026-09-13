import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Button } from 'react-native-paper';
import { palette, radius, spacing } from '@/constants/theme';
import { addDays, formatDisplayDate, parseBusinessDate, toBusinessDate } from '@/utils/dates';

type Props = {
  value: string;
  onChange: (date: string) => void;
};

export function DateSelector({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const { width, height } = useWindowDimensions();
  const calendarWidth = Math.min(width - spacing.xl * 2, 360);

  const close = () => setOpen(false);

  const onPick = (_event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      close();
    }
    if (selected) onChange(toBusinessDate(selected));
  };

  return (
    <View>
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
      </View>

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityLabel="Close calendar" />
          <View style={[styles.sheet, { maxHeight: height * 0.85, width: Math.min(width - spacing.lg * 2, 420) }]}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Select date</Text>
              <Button mode="text" textColor={palette.navy} onPress={close} compact>
                Done
              </Button>
            </View>
            <ScrollView
              bounces={false}
              contentContainerStyle={styles.calendarScroll}
              showsVerticalScrollIndicator={false}
            >
              <DateTimePicker
                value={parseBusinessDate(value)}
                mode="date"
                display={Platform.OS === 'ios' || Platform.OS === 'web' ? 'inline' : 'calendar'}
                onChange={onPick}
                accentColor={palette.navy}
                themeVariant="light"
                style={{ width: calendarWidth, alignSelf: 'center' }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 61, 110, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  sheet: {
    backgroundColor: palette.card,
    borderRadius: radius.lg,
    paddingBottom: spacing.md,
    maxWidth: '100%',
    zIndex: 1,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  sheetTitle: { fontSize: 16, fontWeight: '800', color: palette.navy, paddingLeft: spacing.sm },
  calendarScroll: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    minHeight: 280,
  },
});
