import { StyleSheet, Text, View } from 'react-native';
import { palette, spacing } from '@/constants/theme';

export function EmptyState({ title, message }: { title: string; message?: string }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingVertical: 36, alignItems: 'center', gap: 8 },
  title: { fontSize: 16, fontWeight: '700', color: palette.text },
  message: { color: palette.muted, textAlign: 'center' },
});
