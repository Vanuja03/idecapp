import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { palette } from '@/constants/theme';

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <View style={styles.wrap}>
      <ActivityIndicator color={palette.navy} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingVertical: 40, alignItems: 'center', gap: 12 },
  label: { color: palette.muted },
});
