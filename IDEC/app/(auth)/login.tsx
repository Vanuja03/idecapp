import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Dimensions,
  Image,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { loginSchema, LoginForm } from '@/schemas/forms';
import { useAuth } from '@/store/auth';
import { palette, spacing } from '@/constants/theme';
import { getErrorMessage } from '@/utils/errors';

const logoImage = require('../../assets/images/idec-logo.jpg');
const heroImage = require('../../assets/images/logistics-hero.jpg');
const HERO_HEIGHT = Dimensions.get('window').height * 0.40;

export default function LoginScreen() {
  const { login } = useAuth();
  const insets = useSafeAreaInsets();
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const keyboardOpen = keyboardHeight > 0;

  useEffect(() => {
    // Android edge-to-edge doesn't resize the window, so offset by the keyboard ourselves
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    });
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

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
    <LinearGradient colors={['#0A2A4D', '#1F4E79', '#4FA3D1']} style={styles.root}>
      <View style={[styles.heroFrame, { right: insets.right + 0,left: insets.left + 0, height: HERO_HEIGHT }]}>
        <Image source={heroImage} style={styles.heroImage} resizeMode="cover" />
        <LinearGradient
          colors={['rgba(10,42,77,0.15)', 'rgba(10,42,77,0.45)']}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <View style={styles.flex}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[
            styles.scroll,
            {
              paddingTop: insets.top + (keyboardOpen ? 12 : 24),
              paddingBottom: keyboardOpen ? keyboardHeight + 12 : Math.max(insets.bottom, 16) + 8,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.topSpace, keyboardOpen && styles.topSpaceCompact]} />

          <View style={styles.card}>
            <LinearGradient
              colors={['#0F3D6E', '#2E6FA8']}
              style={[styles.waveHeader, keyboardOpen && styles.waveHeaderCompact]}
            >
              {keyboardOpen ? null : <Image source={logoImage} style={styles.logo} resizeMode="cover" />}
              <Text style={styles.brand}>Idec</Text>
              <Text style={styles.brandSub}>Logistics & Trading Co.</Text>
              <View style={styles.waveCurve} />
            </LinearGradient>

            <View style={styles.form}>
              <Text style={styles.welcome}>
                <Text style={styles.welcomeBold}>Welcome</Text>
                <Text style={styles.welcomeLight}> back !</Text>
              </Text>

              <Controller
                control={control}
                name="username"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.inputWrap}>
                    <TextInput
                      placeholder="Username"
                      mode="flat"
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      error={Boolean(errors.username)}
                      style={styles.input}
                      underlineColor="transparent"
                      activeUnderlineColor="transparent"
                      placeholderTextColor="#9AA6B2"
                      contentStyle={styles.inputContent}
                      theme={{ roundness: 999 }}
                    />
                  </View>
                )}
              />
              {errors.username ? <Text style={styles.error}>{errors.username.message}</Text> : null}

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.inputWrap}>
                    <TextInput
                      placeholder="Password"
                      mode="flat"
                      secureTextEntry={!showPassword}
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      error={Boolean(errors.password)}
                      style={styles.input}
                      underlineColor="transparent"
                      activeUnderlineColor="transparent"
                      placeholderTextColor="#9AA6B2"
                      contentStyle={styles.inputContent}
                      theme={{ roundness: 999 }}
                      right={
                        <TextInput.Icon
                          icon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                          onPress={() => setShowPassword((prev) => !prev)}
                          forceTextInputFocus={false}
                        />
                      }
                    />
                  </View>
                )}
              />
              {errors.password ? <Text style={styles.error}>{errors.password.message}</Text> : null}
              {formError ? <Text style={styles.error}>{formError}</Text> : null}

              <Button
                mode="outlined"
                onPress={onSubmit}
                loading={isSubmitting}
                disabled={isSubmitting}
                textColor={palette.navy}
                style={styles.loginButton}
                contentStyle={styles.loginButtonContent}
                labelStyle={styles.loginButtonLabel}
              >
                Login
              </Button>

              <Text style={styles.footerHint}>Authorized company staff only</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  flex: { flex: 1 },
  heroFrame: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderRadius: 28,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'flex-end',
  },
  topSpace: {
    flexGrow: 1,
    minHeight: 160,
  },
  topSpaceCompact: {
    minHeight: 0,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 32,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    shadowColor: '#0A2A4D',
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  waveHeader: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl + 22,
    position: 'relative',
  },
  waveHeaderCompact: {
    paddingTop: spacing.md,
    paddingBottom: spacing.lg + 18,
  },
  waveCurve: {
    position: 'absolute',
    bottom: -30,
    width: '140%',
    height: 60,
    borderRadius: 999,
    backgroundColor: '#fff',
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: '#fff',
    marginBottom: spacing.sm,
  },
  brand: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  brandSub: {
    color: '#D7E8F7',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  form: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  welcome: {
    textAlign: 'center',
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  welcomeBold: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1B2430',
  },
  welcomeLight: {
    fontSize: 24,
    fontWeight: '500',
    color: '#7A8794',
  },
  inputWrap: {
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: '#EEF2F6',
    marginBottom: 2,
  },
  input: {
    backgroundColor: '#EEF2F6',
    borderRadius: 999,
    height: 52,
  },
  inputContent: {
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  error: {
    color: palette.error,
    marginLeft: spacing.md,
    marginBottom: 4,
  },
  loginButton: {
    marginTop: spacing.md,
    borderRadius: 999,
    borderColor: palette.navy,
    borderWidth: 1.5,
    backgroundColor: '#fff',
  },
  loginButtonContent: {
    minHeight: 52,
  },
  loginButtonLabel: {
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.4,
  },
  footerHint: {
    textAlign: 'center',
    color: '#9AA6B2',
    fontSize: 12,
    marginTop: spacing.sm,
  },
});
