import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { OfflineBanner } from '@/components/OfflineBanner';
import { paperLightTheme } from '@/constants/theme';
import { AuthProvider } from '@/store/auth';

export default function RootLayout() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, staleTime: 15_000 },
        },
      }),
  );

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <PaperProvider theme={paperLightTheme}>
          <AuthProvider>
            <OfflineBanner />
            <Stack screenOptions={{ headerShown: false }} />
            <StatusBar style="dark" />
          </AuthProvider>
        </PaperProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
