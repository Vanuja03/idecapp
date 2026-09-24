import { Redirect, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandSplash } from '@/components/BrandSplash';
import { palette } from '@/constants/theme';
import { useAuth } from '@/store/auth';

export default function AppLayout() {
  const { user, bootstrapping } = useAuth();
  const insets = useSafeAreaInsets();

  if (bootstrapping) {
    return <BrandSplash />;
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: palette.surface,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      }}
    >
      {/* Tabs apply their own insets via the tab bar */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false, contentStyle: {} }} />
      <Stack.Screen name="jobs/create" options={{ title: 'Create Job' }} />
      <Stack.Screen name="jobs/[id]" options={{ title: 'Job details' }} />
      <Stack.Screen name="vehicles/index" options={{ title: 'Vehicles' }} />
      <Stack.Screen name="users/index" options={{ title: 'Users' }} />
    </Stack>
  );
}
