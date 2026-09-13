import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '@/store/auth';
import { palette } from '@/constants/theme';

export default function AppLayout() {
  const { user, bootstrapping } = useAuth();

  if (bootstrapping) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={palette.navy} />
      </View>
    );
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
