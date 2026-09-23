import { router } from 'expo-router';
import type { Href } from 'expo-router';
import { Image, ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Divider } from 'react-native-paper';
import { palette, radius, spacing } from '@/constants/theme';
import { useAuth } from '@/store/auth';
import { canManageUsers, canViewVehiclesScreen } from '@/utils/permissions';

const heroImage = require('../../../assets/images/logistics-hero.jpg');
const logoImage = require('../../../assets/images/idec-logo.jpg');

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ImageBackground source={heroImage} style={styles.banner} imageStyle={styles.bannerImage}>
        <View style={styles.bannerOverlay}>
          <Image source={logoImage} style={styles.avatar} resizeMode="cover" />
          <Text style={styles.bannerBrand}>IDEC Logistics</Text>
        </View>
      </ImageBackground>

      <View style={styles.card}>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.meta}>@{user?.username}</Text>
        <View style={styles.rolePill}>
          <Text style={styles.role}>{user?.role}</Text>
        </View>

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

        <Button mode="contained" buttonColor={palette.navy} textColor="#fff" onPress={() => logout()} style={styles.btn}>
          Log out
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.surface },
  content: { paddingBottom: spacing.xxl },
  banner: {
    height: 180,
    width: '100%',
  },
  bannerImage: {
    resizeMode: 'cover',
  },
  bannerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 42, 77, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#fff',
  },
  bannerBrand: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.4,
  },
  card: {
    marginHorizontal: spacing.lg,
    marginTop: -24,
    backgroundColor: palette.card,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: palette.border,
  },
  name: { fontSize: 24, fontWeight: '800', color: palette.navy },
  meta: { color: palette.muted },
  rolePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF1E6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginTop: 4,
  },
  role: { fontWeight: '700', color: palette.accent },
  divider: { marginVertical: spacing.lg },
  btn: { minHeight: 48, justifyContent: 'center' },
});
