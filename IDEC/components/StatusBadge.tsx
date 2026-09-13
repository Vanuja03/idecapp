import { StyleSheet, Text, View } from 'react-native';
import { JobStatus } from '@/types';
import { statusTokens } from '@/constants/theme';

export function StatusBadge({ status }: { status: JobStatus }) {
  const token = statusTokens[status];
  return (
    <View style={[styles.badge, { backgroundColor: token.background }]}>
      <Text style={[styles.label, { color: token.color }]}>{token.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
});
