import { StyleSheet, Text, View } from 'react-native';
import { palette, spacing } from '@/constants/theme';
import { useNetworkStatus } from '@/hooks/use-network-status';

export function OfflineBanner() {
  const isConnected = useNetworkStatus();
  if (isConnected) return null;
  return (
    <View style={styles.banner}>
      <Text style={styles.text}>No internet connection</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: palette.error,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  text: { color: '#fff', textAlign: 'center', fontWeight: '700' },
});
