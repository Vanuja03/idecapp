import { Redirect } from 'expo-router';
import type { Href } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '@/store/auth';
import { palette } from '@/constants/theme';

export default function Index() {
  const { user, bootstrapping } = useAuth();
  if (bootstrapping) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.surface }}>
        <ActivityIndicator color={palette.navy} />
      </View>
    );
  }
  return <Redirect href={(user ? '/(app)/(tabs)' : '/(auth)/login') as Href} />;
}
