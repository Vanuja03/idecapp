import { router } from 'expo-router';
import type { Href } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Button, Divider } from 'react-native-paper';
import { palette, spacing } from '@/constants/theme';
import { useAuth } from '@/store/auth';
import { canManageUsers, canViewVehiclesScreen } from '@/utils/permissions';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.screen}>
      <Text style={styles.name}>{user?.name}</Text>
      <Text style={styles.meta}>@{user?.username}</Text>
      <Text style={styles.role}>{user?.role}</Text>
      <Divider style={styles.divider} />

      {canViewVehiclesScreen(user?.role) ? (
        <Button mode="outlined" onPress={() => router.push('/(app)/vehicles' as Href)} style={styles.btn}>
          Vehicles
        </Button>
      ) : null}
      {canManageUsers(user?.role) ? (
        <Button mode="outlined" onPress={() => router.push('/(app)/users' as Href)} style={styles.btn}>
          Users
        </Button>
      ) : null}

      <Button mode="contained" onPress={() => logout()} style={styles.btn}>
        Log out
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.surface, padding: spacing.xl, gap: spacing.sm },
  name: { fontSize: 24, fontWeight: '800', color: palette.navy },
  meta: { color: palette.muted },
  role: { fontWeight: '700', color: palette.accent, marginTop: 4 },
  divider: { marginVertical: spacing.lg },
  btn: { minHeight: 48, justifyContent: 'center' },
});
