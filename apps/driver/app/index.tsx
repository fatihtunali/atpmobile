import { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Animated } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@shared/hooks';
import { colors } from '@shared/components';
import { scale } from '@shared/utils/responsive';

export default function SplashScreen() {
  const [showSplash, setShowSplash] = useState(true);
  const fadeAnim = new Animated.Value(1);
  const { isAuthenticated, isLoading, driver } = useAuth();

  useEffect(() => {
    // Show splash for 1.5 seconds then fade out
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowSplash(false);
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Show splash screen first
  if (showSplash || isLoading) {
    return (
      <Animated.View style={[styles.container, { opacity: showSplash ? fadeAnim : 1 }]}>
        <Image
          source={require('../assets/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    );
  }

  // After splash, check auth
  if (!isAuthenticated || !driver) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  logo: {
    width: scale(150),
    height: scale(150),
  },
});
