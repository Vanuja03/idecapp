import { Redirect, Stack } from 'expo-router';
import type { Href } from 'expo-router';
import { useAuth } from '@/store/auth';

export default function AuthLayout() {
  const { user, bootstrapping } = useAuth();
  if (!bootstrapping && user) {
    return <Redirect href={'/(app)/(tabs)' as Href} />;
  }
  return <Stack screenOptions={{ headerShown: false }} />;
}
