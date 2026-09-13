import { Redirect, Stack } from 'expo-router';
import { BrandSplash } from '@/components/BrandSplash';
import { useAuth } from '@/store/auth';

export default function AppLayout() {
  const { user, bootstrapping } = useAuth();

  if (bootstrapping) {
    return <BrandSplash />;
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="jobs/create" options={{ title: 'Create Job' }} />
      <Stack.Screen name="jobs/[id]" options={{ title: 'Job details' }} />
      <Stack.Screen name="vehicles/index" options={{ title: 'Vehicles' }} />
      <Stack.Screen name="users/index" options={{ title: 'Users' }} />
    </Stack>
  );
}
