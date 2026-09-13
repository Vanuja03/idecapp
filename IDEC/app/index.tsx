import { Redirect } from 'expo-router';
import type { Href } from 'expo-router';
import { BrandSplash } from '@/components/BrandSplash';
import { useAuth } from '@/store/auth';

export default function Index() {
  const { user, bootstrapping } = useAuth();
  if (bootstrapping) {
    return <BrandSplash />;
  }
  return <Redirect href={(user ? '/(app)/(tabs)' : '/(auth)/login') as Href} />;
}
