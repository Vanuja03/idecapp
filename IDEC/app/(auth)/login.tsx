import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { loginSchema, LoginForm } from '@/schemas/forms';
import { useAuth } from '@/store/auth';
import { palette, spacing } from '@/constants/theme';
import { getErrorMessage } from '@/utils/errors';
import { useState } from 'react';

export default function LoginScreen() {
  const { login } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await login(values.username.trim(), values.password);
    } catch (error) {
      setFormError(getErrorMessage(error, 'Unable to log in. Check your username and password.'));
    }
  });

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.card}>
        <Text style={styles.kicker}>IDEC TRANSPORT</Text>
        <Text style={styles.title}>LOGISTICS MANAGEMENT</Text>
        <Text style={styles.subtitle}>Authorized staff only</Text>

        <Controller
          control={control}
          name="username"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Username"
              mode="outlined"
              autoCapitalize="none"
              autoCorrect={false}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={Boolean(errors.username)}
              style={styles.input}
            />
          )}
        />
        {errors.username ? <Text style={styles.error}>{errors.username.message}</Text> : null}

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Password"
              mode="outlined"
              secureTextEntry
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={Boolean(errors.password)}
              style={styles.input}
            />
          )}
        />
        {errors.password ? <Text style={styles.error}>{errors.password.message}</Text> : null}
        {formError ? <Text style={styles.error}>{formError}</Text> : null}

        <Button mode="contained" onPress={onSubmit} loading={isSubmitting} disabled={isSubmitting} style={styles.button}>
          Login
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.navyDark,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    backgroundColor: palette.card,
    borderRadius: 16,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  kicker: { color: palette.accent, fontWeight: '800', letterSpacing: 1.2 },
  title: { fontSize: 24, fontWeight: '800', color: palette.navy },
  subtitle: { color: palette.muted, marginBottom: spacing.md },
  input: { backgroundColor: palette.card },
  error: { color: palette.error },
  button: { marginTop: spacing.md, minHeight: 48, justifyContent: 'center' },
});
