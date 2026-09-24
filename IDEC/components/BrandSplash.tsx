import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { palette } from '@/constants/theme';

const logo = require('../assets/images/idec-logo.jpg');

type Props = {
  fullscreen?: boolean;
};

export function BrandSplash({ fullscreen = true }: Props) {
  return (
    <View style={[styles.wrap, fullscreen && styles.fullscreen]}>
      <View style={styles.logoFrame}>
        <Image source={logo} style={styles.logo} resizeMode="cover" />
      </View>
      <Text style={styles.title}>IDEC</Text>
      <ActivityIndicator color={palette.navy} style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  fullscreen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  logoFrame: {
    width: 220,
    height: 220,
    borderRadius: 48,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: palette.navy,
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    color: '#000000',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 2,
  },
  spinner: {
    marginTop: 4,
  },
});
