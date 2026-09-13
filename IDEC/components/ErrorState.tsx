import { StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import { palette, radius, spacing } from '@/constants/theme';

type Props = {
  title: string;
  message?: string;
  onRetry?: () => void;
};

export function ErrorState({ title, message, onRetry }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {onRetry ? <Button mode="contained" onPress={onRetry}>Try again</Button> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: spacing.xl,
    backgroundColor: palette.errorBg,
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  title: { fontWeight: '700', color: palette.error, fontSize: 16 },
  message: { color: palette.text },
});
